/**
 * Contact-masking helpers for the PUBLIC agent directory.
 *
 * The directory is unauthenticated, so raw emails and phone numbers must never
 * leave the server. These functions run server-side (in the directory query /
 * API route) and produce a teaser string that proves a contact exists without
 * exposing anything usable for outreach or scraping. The full, unmasked value is
 * only ever delivered inside a paid CSV.
 *
 * Design choices:
 *  - Email: keep only the first character of the local part; mask the rest AND
 *    the entire domain. We deliberately hide the domain so brokerage/provider
 *    patterns (e.g. "@kw.com") can't be harvested for free.
 *  - Phone: keep only the area code (which is already implied by the agent's
 *    state and carries no personal information); mask every other digit.
 */

const DOT = "•" // • bullet used for masked characters

/**
 * Mask an email to a first-initial teaser, e.g. "john@kw.com" -> "j••••@••••••".
 * Returns null when there is no email so callers can render a neutral state.
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const trimmed = email.trim()
  const at = trimmed.indexOf("@")
  // Guard against malformed values; still reveal nothing usable.
  if (at < 1) return `${DOT.repeat(5)}@${DOT.repeat(6)}`
  const firstChar = trimmed[0]
  // Never echo raw input length back precisely; use a fixed-width mask.
  return `${firstChar}${DOT.repeat(4)}@${DOT.repeat(6)}`
}

/**
 * Mask a phone number to its area code, e.g. "(251) 271-5020" -> "(251) •••-••••".
 * Falls back to a fully masked pattern when an area code can't be parsed.
 */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  // US numbers may include a leading country code "1".
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  if (national.length < 10) return `(${DOT.repeat(3)}) ${DOT.repeat(3)}-${DOT.repeat(4)}`
  const areaCode = national.slice(0, 3)
  return `(${areaCode}) ${DOT.repeat(3)}-${DOT.repeat(4)}`
}
