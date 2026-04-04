import { describe, it, expect, vi, beforeEach } from "vitest"

// Track call counts per key to simulate rate limiting
const callCounts = new Map<string, number>()

vi.mock("@upstash/redis", () => {
  return {
    Redis: class MockRedis {
      constructor() {}
    },
  }
})

vi.mock("@upstash/ratelimit", () => {
  class MockRatelimit {
    private maxRequests: number
    constructor({ limiter }: { limiter: { maxRequests: number } }) {
      this.maxRequests = limiter.maxRequests
    }
    async limit(key: string) {
      const count = (callCounts.get(key) || 0) + 1
      callCounts.set(key, count)
      if (count > this.maxRequests) {
        return { success: false, remaining: 0 }
      }
      return { success: true, remaining: this.maxRequests - count }
    }
    static slidingWindow(maxRequests: number) {
      return { maxRequests }
    }
  }
  return { Ratelimit: MockRatelimit }
})

let rateLimit: typeof import("@/lib/utils/rateLimit").rateLimit

beforeEach(async () => {
  callCounts.clear()
  vi.resetModules()

  vi.doMock("@upstash/redis", () => ({
    Redis: class MockRedis {
      constructor() {}
    },
  }))

  vi.doMock("@upstash/ratelimit", () => {
    class MockRatelimit {
      private maxRequests: number
      constructor({ limiter }: { limiter: { maxRequests: number } }) {
        this.maxRequests = limiter.maxRequests
      }
      async limit(key: string) {
        const count = (callCounts.get(key) || 0) + 1
        callCounts.set(key, count)
        if (count > this.maxRequests) {
          return { success: false, remaining: 0 }
        }
        return { success: true, remaining: this.maxRequests - count }
      }
      static slidingWindow(maxRequests: number) {
        return { maxRequests }
      }
    }
    return { Ratelimit: MockRatelimit }
  })

  const mod = await import("@/lib/utils/rateLimit")
  rateLimit = mod.rateLimit
})

describe("rateLimit", () => {
  it("allows requests under the limit", async () => {
    const result = await rateLimit("test-key", 5)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("decrements remaining count on each call", async () => {
    const key = "decrement-test"
    expect((await rateLimit(key, 5)).remaining).toBe(4)
    expect((await rateLimit(key, 5)).remaining).toBe(3)
    expect((await rateLimit(key, 5)).remaining).toBe(2)
    expect((await rateLimit(key, 5)).remaining).toBe(1)
    expect((await rateLimit(key, 5)).remaining).toBe(0)
  })

  it("blocks requests at the limit", async () => {
    const key = "block-test"
    for (let i = 0; i < 3; i++) {
      await rateLimit(key, 3)
    }
    const result = await rateLimit(key, 3)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("blocks all requests after limit is reached", async () => {
    const key = "block-all"
    for (let i = 0; i < 10; i++) {
      await rateLimit(key, 10)
    }
    for (let i = 0; i < 5; i++) {
      expect((await rateLimit(key, 10)).success).toBe(false)
    }
  })

  it("isolates rate limits by key", async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit("key-a", 5)
    }
    expect((await rateLimit("key-a", 5)).success).toBe(false)
    expect((await rateLimit("key-b", 5)).success).toBe(true)
  })

  it("handles limit of 1 (single request per window)", async () => {
    const key = "one-shot"
    expect((await rateLimit(key, 1)).success).toBe(true)
    expect((await rateLimit(key, 1)).success).toBe(false)
  })

  it("returns remaining=0 when blocked", async () => {
    const key = "remaining-0"
    await rateLimit(key, 1)
    const result = await rateLimit(key, 1)
    expect(result.remaining).toBe(0)
    expect(result.success).toBe(false)
  })
})
