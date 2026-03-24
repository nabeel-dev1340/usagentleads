import crypto from "crypto"

const KEY_PREFIX = "sk_live_"

export function generateApiKey(): string {
  return KEY_PREFIX + crypto.randomBytes(16).toString("hex")
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export function extractPrefix(key: string): string {
  return key.slice(0, KEY_PREFIX.length + 4)
}
