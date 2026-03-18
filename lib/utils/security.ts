import { VALID_STATE_CODES } from "./states"

export function sanitizeSearchInput(input: string): string {
  // Whitelist: only allow alphanumeric, spaces, hyphens, and @
  // Dots are excluded because they are PostgREST filter separators
  return input
    .replace(/[^a-zA-Z0-9\s\-@]/g, "")
    .trim()
    .slice(0, 100)
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function isValidStateCode(code: string): boolean {
  return VALID_STATE_CODES.has(code.toUpperCase())
}

export function clampPage(page: unknown): number {
  const num = Number(page)
  if (isNaN(num) || num < 1) return 1
  if (num > 1000) return 1000
  return Math.floor(num)
}

export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}
