/**
 * Mirrors the SQL function usagentleads.clean_name (see migration clean_lead_names).
 * Run on every name before CSV export so any messy rows inserted after the
 * one-shot DB cleanup still produce clean output.
 */
export function cleanName(input: string | null): string | null {
  if (!input) return null
  let s = input
  // Smart quotes -> straight
  s = s.replace(/[“”]/g, '"')
  s = s.replace(/[‘’]/g, "'")
  // HTML entity decode
  s = s
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
  // Strip "(Team ID: ...)" / "(mls Only)" tags
  s = s.replace(/\s*\([Tt]eam ID[^)]*\)\s*/g, " ")
  s = s.replace(/\s*\([Mm][Ll][Ss] [Oo]nly\)\s*/g, " ")
  // Strip surrounding quote chars from quoted nickname tokens (keep content)
  s = s.replace(/"([^"]*)"/g, "$1")
  s = s.replace(/'([^']{2,}?)'(?=\s)/g, "$1")
  // Strip leading punctuation/whitespace
  s = s.replace(/^[\s.\-*,]+/, "")
  // Strip trailing orphan dots/asterisks/spaces (preserves Jr./P.A. style)
  s = s.replace(/(\s\.+|\s\*+|\*+|\s+)+$/, "")
  // Zero-width chars
  s = s.replace(/[​‌‍﻿]/g, "")
  // Collapse internal whitespace
  s = s.replace(/\s+/g, " ")
  s = s.trim()
  return s || null
}

/** True when the name has at least 2 consecutive letters. */
export function isValidName(name: string | null): boolean {
  if (!name) return false
  return /[a-zA-Z]{2,}/.test(name)
}
