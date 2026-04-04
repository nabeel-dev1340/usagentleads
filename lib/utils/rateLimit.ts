import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache limiters by window size to avoid recreating on every call
const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`
  let limiter = limiters.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
    })
    limiters.set(key, limiter)
  }
  return limiter
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getLimiter(limit, windowMs)
  const { success, remaining } = await limiter.limit(key)
  return { success, remaining }
}
