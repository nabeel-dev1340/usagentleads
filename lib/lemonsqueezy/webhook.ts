import crypto from "crypto"

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(rawBody).digest("hex")

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    )
  } catch {
    return false
  }
}
