import { describe, it, expect, vi, beforeEach } from "vitest"

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
const VALID_UUID_2 = "b1ffcd00-0d1c-5fg9-cc7e-7ccace491b22"

describe("API Key Management Routes", () => {
  let mockQuery: Record<string, ReturnType<typeof vi.fn>>
  let mockAuthClient: { auth: { getUser: ReturnType<typeof vi.fn> } }

  beforeEach(async () => {
    vi.resetModules()

    mockQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
      order: vi.fn(),
      single: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    }

    for (const key of Object.keys(mockQuery)) {
      if (!["single"].includes(key)) {
        mockQuery[key].mockReturnValue(mockQuery)
      }
    }

    mockAuthClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@test.com" } },
        }),
      },
    }

    const mockFrom = vi.fn(() => mockQuery)
    const mockSchema = vi.fn(() => ({ from: mockFrom }))

    vi.doMock("@/lib/supabase/server", () => ({
      createServiceClient: vi.fn(() => ({ schema: mockSchema })),
      createClient: vi.fn(() => Promise.resolve(mockAuthClient)),
    }))
  })

  describe("GET /api/api-keys", () => {
    it("returns 401 for unauthenticated users", async () => {
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const { GET } = await import("@/app/api/api-keys/route")
      const res = await GET(new Request("https://example.com/api/api-keys"))
      const json = await res.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("returns 403 for non-pro_api subscribers", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: { plan: "pro_monthly", status: "active" },
        error: null,
      })

      const { GET } = await import("@/app/api/api-keys/route")
      const res = await GET(new Request("https://example.com/api/api-keys"))
      const json = await res.json()
      expect(json.error).toBe("Pro API subscription required")
      expect(json.upgrade).toBe(true)
    })

    it("returns keys list for pro_api subscribers", async () => {
      const mockKeys = [
        { id: "k1", name: "Production", key_prefix: "sk_live_ab", created_at: "2026-01-01" },
      ]

      // Subscription check
      mockQuery.single.mockResolvedValueOnce({
        data: { plan: "pro_api", status: "active" },
        error: null,
      })

      // Keys list
      mockQuery.order.mockReturnValue(
        Promise.resolve({ data: mockKeys, error: null })
      )

      const { GET } = await import("@/app/api/api-keys/route")
      const res = await GET(new Request("https://example.com/api/api-keys"))
      const json = await res.json()
      expect(json.keys).toBeDefined()
    })
  })

  describe("POST /api/api-keys", () => {
    it("returns 401 for unauthenticated users", async () => {
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const { POST } = await import("@/app/api/api-keys/route")
      const res = await POST(
        new Request("https://example.com/api/api-keys", {
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
        })
      )
      const json = await res.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("returns 403 for non-pro_api subscribers", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: { plan: "pro_monthly", status: "active" },
        error: null,
      })

      const { POST } = await import("@/app/api/api-keys/route")
      const res = await POST(
        new Request("https://example.com/api/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        })
      )
      const json = await res.json()
      expect(json.error).toBe("Pro API subscription required")
    })

    it("limits to 3 active keys", async () => {
      // Subscription check passes
      mockQuery.single.mockResolvedValueOnce({
        data: { plan: "pro_api", status: "active" },
        error: null,
      })

      // Count active keys returns 3
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.is.mockReturnValue(
        Promise.resolve({ count: 3 })
      )

      const { POST } = await import("@/app/api/api-keys/route")
      const res = await POST(
        new Request("https://example.com/api/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        })
      )
      const json = await res.json()
      expect(json.error).toContain("Maximum of 3")
    })
  })

  describe("DELETE /api/api-keys/[id]", () => {
    it("returns 401 for unauthenticated users", async () => {
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const { DELETE } = await import("@/app/api/api-keys/[id]/route")
      const res = await DELETE(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("returns 404 when key not found or not owned by user", async () => {
      mockQuery.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } })

      const { DELETE } = await import("@/app/api/api-keys/[id]/route")
      const res = await DELETE(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.error).toBe("API key not found")
    })

    it("successfully revokes an owned key", async () => {
      mockQuery.single.mockResolvedValueOnce({ data: { id: VALID_UUID }, error: null })

      const { DELETE } = await import("@/app/api/api-keys/[id]/route")
      const res = await DELETE(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.message).toBe("API key revoked")
    })
  })

  describe("PATCH /api/api-keys/[id]", () => {
    it("returns 401 for unauthenticated users", async () => {
      mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const { PATCH } = await import("@/app/api/api-keys/[id]/route")
      const res = await PATCH(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Name" }),
        }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("returns 400 for invalid name", async () => {
      const { PATCH } = await import("@/app/api/api-keys/[id]/route")
      const res = await PATCH(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "" }),
        }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.error).toBe("Invalid name")
    })

    it("returns 400 for name longer than 50 chars", async () => {
      const { PATCH } = await import("@/app/api/api-keys/[id]/route")
      const res = await PATCH(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "x".repeat(51) }),
        }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.error).toBe("Invalid name")
    })

    it("renames an owned key", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: { id: VALID_UUID, name: "Renamed", key_prefix: "sk_live_ab", created_at: "2026-01-01" },
        error: null,
      })

      const { PATCH } = await import("@/app/api/api-keys/[id]/route")
      const res = await PATCH(
        new Request(`https://example.com/api/api-keys/${VALID_UUID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Renamed" }),
        }),
        { params: Promise.resolve({ id: VALID_UUID }) }
      )
      const json = await res.json()
      expect(json.name).toBe("Renamed")
    })
  })
})
