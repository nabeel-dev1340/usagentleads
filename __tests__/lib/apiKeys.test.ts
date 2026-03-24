import { describe, it, expect } from "vitest"
import { generateApiKey, hashApiKey, extractPrefix } from "@/lib/utils/apiKeys"

describe("generateApiKey", () => {
  it("returns a key starting with sk_live_", () => {
    const key = generateApiKey()
    expect(key.startsWith("sk_live_")).toBe(true)
  })

  it("returns a key of correct length (sk_live_ + 32 hex chars)", () => {
    const key = generateApiKey()
    expect(key.length).toBe(8 + 32) // "sk_live_" = 8 chars, 16 random bytes = 32 hex
  })

  it("generates unique keys each time", () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()))
    expect(keys.size).toBe(100)
  })

  it("only contains valid hex characters after prefix", () => {
    const key = generateApiKey()
    const hex = key.slice(8)
    expect(hex).toMatch(/^[0-9a-f]{32}$/)
  })
})

describe("hashApiKey", () => {
  it("returns a 64-char hex string (SHA-256)", () => {
    const hash = hashApiKey("sk_live_test123")
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("is deterministic — same input always produces same hash", () => {
    const key = "sk_live_abc123def456"
    expect(hashApiKey(key)).toBe(hashApiKey(key))
  })

  it("produces different hashes for different keys", () => {
    const h1 = hashApiKey("sk_live_key_one")
    const h2 = hashApiKey("sk_live_key_two")
    expect(h1).not.toBe(h2)
  })

  it("is not reversible — hash does not contain the key", () => {
    const key = "sk_live_mysecretkey"
    const hash = hashApiKey(key)
    expect(hash.includes("mysecretkey")).toBe(false)
  })
})

describe("extractPrefix", () => {
  it("extracts sk_live_ plus first 4 chars of the random part", () => {
    const key = "sk_live_abcd1234567890ef1234567890ef"
    expect(extractPrefix(key)).toBe("sk_live_abcd")
  })

  it("returns consistent prefix length of 12 chars", () => {
    const key = generateApiKey()
    const prefix = extractPrefix(key)
    expect(prefix.length).toBe(12)
  })

  it("prefix is a substring of the full key", () => {
    const key = generateApiKey()
    expect(key.startsWith(extractPrefix(key))).toBe(true)
  })
})
