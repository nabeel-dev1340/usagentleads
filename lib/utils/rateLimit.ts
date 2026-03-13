const MAX_KEYS = 10000
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // Evict oldest entries if map is at capacity
    if (rateLimitMap.size >= MAX_KEYS) {
      const firstKey = rateLimitMap.keys().next().value
      if (firstKey !== undefined) rateLimitMap.delete(firstKey)
    }
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 60000)
}
