import { VALID_STATE_CODES } from "./states"

export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_'";\-\-]/g, "")
    .trim()
    .slice(0, 100)
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
