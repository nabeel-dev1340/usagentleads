import { describe, it, expect, vi, beforeEach } from "vitest"

describe("POST /api/checkout", () => {
  let POST: typeof import("@/app/api/checkout/route").POST
  let mockAuthClient: { auth: { getUser: ReturnType<typeof vi.fn> } }
  let mockCreateCheckout: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }

    mockAuthClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123" } },
        }),
      },
    }

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(() => Promise.resolve(mockAuthClient)),
      createServiceClient: vi.fn(() => ({
        schema: vi.fn(() => ({ from: vi.fn(() => mockQuery) })),
      })),
    }))

    mockCreateCheckout = vi.fn().mockResolvedValue("https://checkout.lemonsqueezy.com/test")

    vi.doMock("@/lib/lemonsqueezy/client", () => ({
      createCheckout: mockCreateCheckout,
    }))

    const mod = await import("@/app/api/checkout/route")
    POST = mod.POST
  })

  function makeRequest(body: unknown): Request {
    return new Request("https://example.com/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.2.3.4",
      },
      body: JSON.stringify(body),
    })
  }

  it("returns 400 for invalid purchase type", async () => {
    const res = await POST(makeRequest({ purchaseType: "invalid" }))
    const json = await res.json()
    expect(json.error).toBe("Invalid request")
  })

  it("returns 400 for state purchase without state code", async () => {
    const res = await POST(makeRequest({ purchaseType: "state" }))
    const json = await res.json()
    expect(json.error).toBe("Invalid state code")
  })

  it("returns 400 for state purchase with invalid state code", async () => {
    const res = await POST(makeRequest({ purchaseType: "state", stateCode: "XX" }))
    const json = await res.json()
    expect(json.error).toBe("Invalid state code")
  })

  it("requires auth for subscription purchase", async () => {
    mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ purchaseType: "subscription" }))
    const json = await res.json()
    expect(json.error).toBe("Authentication required for subscription")
  })

  it("requires auth for subscription_api purchase", async () => {
    mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ purchaseType: "subscription_api" }))
    const json = await res.json()
    expect(json.error).toBe("Authentication required for subscription")
  })

  it("creates checkout URL for subscription_api", async () => {
    process.env.NEXT_PUBLIC_LS_API_SUBSCRIPTION_VARIANT_ID = "variant-api"

    const res = await POST(makeRequest({ purchaseType: "subscription_api" }))
    const json = await res.json()
    expect(json.url).toBe("https://checkout.lemonsqueezy.com/test")
    expect(mockCreateCheckout).toHaveBeenCalled()

    // Verify custom_data includes user_id and purchase_type
    const callArgs = mockCreateCheckout.mock.calls[0][0]
    expect(callArgs.customData.purchase_type).toBe("subscription_api")
    expect(callArgs.customData.user_id).toBe("user-123")
  })

  it("creates checkout URL for full_database", async () => {
    process.env.NEXT_PUBLIC_LS_FULL_DB_VARIANT_ID = "variant-full"

    const res = await POST(makeRequest({ purchaseType: "full_database" }))
    const json = await res.json()
    expect(json.url).toBeDefined()
    expect(mockCreateCheckout).toHaveBeenCalled()

    const callArgs = mockCreateCheckout.mock.calls[0][0]
    expect(callArgs.customData.purchase_type).toBe("full_database")
    expect(callArgs.customData.page_token).toBeDefined()
  })

  it("does not set page_token for subscription purchases", async () => {
    process.env.NEXT_PUBLIC_LS_SUBSCRIPTION_VARIANT_ID = "variant-sub"

    const res = await POST(makeRequest({ purchaseType: "subscription" }))
    const json = await res.json()
    expect(json.url).toBeDefined()

    const callArgs = mockCreateCheckout.mock.calls[0][0]
    expect(callArgs.customData.page_token).toBeUndefined()
  })
})
