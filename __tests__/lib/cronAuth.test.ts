import { describe, it, expect, afterEach } from "vitest"
import { isAuthorizedCron } from "@/lib/utils/cronAuth"

const ORIGINAL = process.env.CRON_SECRET

function req(authorization?: string): Request {
  return new Request("https://example.com/api/cron/whatever", {
    headers: authorization ? { authorization } : {},
  })
}

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = ORIGINAL
})

describe("isAuthorizedCron", () => {
  it("accepts the correct bearer token", () => {
    process.env.CRON_SECRET = "s3cr3t-value"
    expect(isAuthorizedCron(req("Bearer s3cr3t-value"))).toBe(true)
  })

  it("rejects a wrong token", () => {
    process.env.CRON_SECRET = "s3cr3t-value"
    expect(isAuthorizedCron(req("Bearer wrong-value1"))).toBe(false)
  })

  it("rejects a missing authorization header", () => {
    process.env.CRON_SECRET = "s3cr3t-value"
    expect(isAuthorizedCron(req())).toBe(false)
  })

  it("rejects a bare token without the Bearer prefix", () => {
    process.env.CRON_SECRET = "s3cr3t-value"
    expect(isAuthorizedCron(req("s3cr3t-value"))).toBe(false)
  })

  // Regression: the old inline check built `Bearer ${process.env.CRON_SECRET}`,
  // so a deploy missing the env var accepted the literal "Bearer undefined".
  it("fails closed when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET
    expect(isAuthorizedCron(req("Bearer undefined"))).toBe(false)
    expect(isAuthorizedCron(req("Bearer "))).toBe(false)
    expect(isAuthorizedCron(req())).toBe(false)
  })

  it("does not throw on multi-byte tokens that match by char length", () => {
    process.env.CRON_SECRET = "abcdefgh"
    expect(() => isAuthorizedCron(req("Bearer abcdefgé"))).not.toThrow()
    expect(isAuthorizedCron(req("Bearer abcdefgé"))).toBe(false)
  })
})
