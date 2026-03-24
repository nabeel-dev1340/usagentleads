import { describe, it, expect, vi, beforeEach } from "vitest"
import crypto from "crypto"

describe("POST /api/webhooks/lemonsqueezy", () => {
  let POST: typeof import("@/app/api/webhooks/lemonsqueezy/route").POST
  let mockUpsert: ReturnType<typeof vi.fn>
  let mockUpdate: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()

    mockUpsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { download_token: "tok-123" }, error: null }),
      }),
    })

    mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    const mockFrom = vi.fn(() => ({
      upsert: mockUpsert,
      update: mockUpdate,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { created_at: new Date().toISOString() }, error: null }),
        }),
      }),
    }))

    vi.doMock("@/lib/supabase/server", () => ({
      createServiceClient: vi.fn(() => ({
        schema: vi.fn(() => ({ from: mockFrom })),
      })),
    }))

    // Mock webhook verification to always pass
    vi.doMock("@/lib/lemonsqueezy/webhook", () => ({
      verifyWebhookSignature: vi.fn(() => true),
    }))

    // Mock email sending
    vi.doMock("@/lib/resend/emails", () => ({
      sendDownloadEmail: vi.fn(),
      sendSubscriptionWelcome: vi.fn(),
      sendSubscriptionCancelled: vi.fn(),
      sendSubscriptionRenewed: vi.fn(),
      sendPaymentFailed: vi.fn(),
    }))

    vi.doMock("@/lib/utils/states", () => ({
      getStateByCode: vi.fn(() => ({ name: "California" })),
    }))

    const mod = await import("@/app/api/webhooks/lemonsqueezy/route")
    POST = mod.POST
  })

  function makeWebhookRequest(eventName: string, payload: Record<string, unknown>) {
    const body = JSON.stringify({
      meta: { event_name: eventName, ...((payload as Record<string, unknown>).meta || {}) },
      data: (payload as Record<string, unknown>).data || payload,
    })
    return new Request("https://example.com/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": "valid", "Content-Type": "application/json" },
      body,
    })
  }

  it("skips purchase insert for subscription_api orders (critical bug fix)", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("order_created", {
      meta: {
        event_name: "order_created",
        custom_data: { purchase_type: "subscription_api", user_id: "u1" },
      },
      data: {
        id: "order-123",
        attributes: {
          customer_id: "cust-1",
          user_email: "test@test.com",
          status: "paid",
          total: 7900,
          created_at: now,
        },
      },
    })

    const res = await POST(req)
    const json = await res.json()

    // Should NOT have called upsert on purchases table
    expect(mockUpsert).not.toHaveBeenCalled()
    expect(json.message).toBe("ok")
  })

  it("skips purchase insert for regular subscription orders", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("order_created", {
      meta: {
        event_name: "order_created",
        custom_data: { purchase_type: "subscription", user_id: "u1" },
      },
      data: {
        id: "order-456",
        attributes: {
          customer_id: "cust-2",
          user_email: "test@test.com",
          status: "paid",
          total: 4900,
          created_at: now,
        },
      },
    })

    const res = await POST(req)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it("inserts purchase for state orders", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("order_created", {
      meta: {
        event_name: "order_created",
        custom_data: { purchase_type: "state", state_code: "CA", page_token: crypto.randomUUID() },
      },
      data: {
        id: "order-789",
        attributes: {
          customer_id: "cust-3",
          user_email: "buyer@test.com",
          status: "paid",
          total: 1000,
          created_at: now,
        },
      },
    })

    const res = await POST(req)
    expect(mockUpsert).toHaveBeenCalled()

    const upsertArgs = mockUpsert.mock.calls[0][0]
    expect(upsertArgs.purchase_type).toBe("state")
    expect(upsertArgs.state_code).toBe("CA")
  })

  it("sets plan to pro_api for subscription_api subscription_created", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("subscription_created", {
      meta: {
        event_name: "subscription_created",
        custom_data: { purchase_type: "subscription_api", user_id: "u1" },
      },
      data: {
        id: "sub-123",
        attributes: {
          customer_id: "cust-1",
          user_email: "test@test.com",
          status: "on_trial",
          created_at: now,
          renews_at: "2027-01-01T00:00:00Z",
          trial_ends_at: "2026-03-25T00:00:00Z",
          updated_at: now,
        },
      },
    })

    const res = await POST(req)
    expect(mockUpsert).toHaveBeenCalled()

    const upsertArgs = mockUpsert.mock.calls[0][0]
    expect(upsertArgs.plan).toBe("pro_api")
    expect(upsertArgs.status).toBe("on_trial")
  })

  it("sets plan to pro_monthly for regular subscription_created", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("subscription_created", {
      meta: {
        event_name: "subscription_created",
        custom_data: { purchase_type: "subscription", user_id: "u1" },
      },
      data: {
        id: "sub-456",
        attributes: {
          customer_id: "cust-2",
          user_email: "test@test.com",
          status: "active",
          created_at: now,
          renews_at: "2027-01-01T00:00:00Z",
          trial_ends_at: null,
          updated_at: now,
        },
      },
    })

    const res = await POST(req)
    expect(mockUpsert).toHaveBeenCalled()

    const upsertArgs = mockUpsert.mock.calls[0][0]
    expect(upsertArgs.plan).toBe("pro_monthly")
  })

  it("subscription_updated does NOT overwrite the plan column", async () => {
    const now = new Date().toISOString()
    const req = makeWebhookRequest("subscription_updated", {
      meta: { event_name: "subscription_updated" },
      data: {
        id: "sub-123",
        attributes: {
          status: "active",
          user_email: "test@test.com",
          renews_at: "2027-02-01T00:00:00Z",
          cancelled: false,
          updated_at: now,
        },
      },
    })

    const res = await POST(req)
    expect(mockUpdate).toHaveBeenCalled()

    const updateArgs = mockUpdate.mock.calls[0][0]
    // Should NOT contain a plan field
    expect(updateArgs).not.toHaveProperty("plan")
    expect(updateArgs).toHaveProperty("status")
    expect(updateArgs).toHaveProperty("current_period_end")
  })
})
