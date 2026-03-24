import { describe, it, expect, beforeEach, vi } from "vitest"

// Fresh import for each test to reset the map
let rateLimit: typeof import("@/lib/utils/rateLimit").rateLimit

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("@/lib/utils/rateLimit")
  rateLimit = mod.rateLimit
})

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const result = rateLimit("test-key", 5)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("decrements remaining count on each call", () => {
    const key = "decrement-test"
    expect(rateLimit(key, 5).remaining).toBe(4)
    expect(rateLimit(key, 5).remaining).toBe(3)
    expect(rateLimit(key, 5).remaining).toBe(2)
    expect(rateLimit(key, 5).remaining).toBe(1)
    expect(rateLimit(key, 5).remaining).toBe(0)
  })

  it("blocks requests at the limit", () => {
    const key = "block-test"
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3)
    }
    const result = rateLimit(key, 3)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("blocks all requests after limit is reached", () => {
    const key = "block-all"
    for (let i = 0; i < 10; i++) {
      rateLimit(key, 10)
    }
    // All subsequent should fail
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 10).success).toBe(false)
    }
  })

  it("isolates rate limits by key", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("key-a", 5)
    }
    // key-a is exhausted
    expect(rateLimit("key-a", 5).success).toBe(false)
    // key-b should be independent
    expect(rateLimit("key-b", 5).success).toBe(true)
  })

  it("resets after the time window expires", async () => {
    const key = "window-test"
    // Use a very short window (50ms)
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 50)
    }
    expect(rateLimit(key, 3, 50).success).toBe(false)

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60))
    expect(rateLimit(key, 3, 50).success).toBe(true)
  })

  it("handles limit of 1 (single request per window)", () => {
    const key = "one-shot"
    expect(rateLimit(key, 1).success).toBe(true)
    expect(rateLimit(key, 1).success).toBe(false)
  })

  it("returns remaining=0 when blocked", () => {
    const key = "remaining-0"
    rateLimit(key, 1)
    const result = rateLimit(key, 1)
    expect(result.remaining).toBe(0)
    expect(result.success).toBe(false)
  })
})
