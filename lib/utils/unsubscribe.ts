import crypto from "crypto"
import { SITE_URL } from "@/lib/utils/site"

/**
 * Stateless unsubscribe tokens for the sample-lead nurture drip. We HMAC the
 * email with a server secret so an unsubscribe link can be verified without
 * storing a per-lead token. Marketing email must offer a working opt-out
 * (CAN-SPAM), and these links keep the drip compliant.
 */
const SECRET = process.env.CRON_SECRET || process.env.LEMONSQUEEZY_API_KEY || "usagentleads-unsub"

export function makeUnsubToken(email: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32)
}

export function verifyUnsubToken(email: string, token: string): boolean {
  const expected = makeUnsubToken(email)
  if (token.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

export function unsubscribeUrl(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase())
  const t = makeUnsubToken(email)
  return `${SITE_URL}/api/unsubscribe?e=${e}&t=${t}`
}
