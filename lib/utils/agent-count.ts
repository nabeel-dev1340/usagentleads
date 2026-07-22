import { createClient } from "@supabase/supabase-js"
import { TOTAL_AGENTS } from "@/lib/utils/states"

/**
 * Live total agent count (sum of state_count), for use in email copy so numbers
 * match the site and don't go stale. Uses a direct service-role client (no
 * next/headers coupling, unlike lib/supabase/server) and falls back to the
 * static estimate if the DB is unavailable. Cached briefly per instance.
 */
let cached: { value: number; at: number } | null = null
const TTL_MS = 5 * 60 * 1000

export async function getAgentCount(): Promise<number> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await supabase
      .schema("usagentleads")
      .from("state_count")
      .select("count")
    if (data && data.length) {
      const total = data.reduce((s: number, r: { count: number }) => s + r.count, 0)
      cached = { value: total, at: Date.now() }
      return total
    }
  } catch {
    // fall through to the static estimate
  }
  return TOTAL_AGENTS
}

/**
 * Round down to a clean label, e.g. 963112 -> "963K+", 1_168_510 -> "1.1M+".
 *
 * Millions keep one decimal — flooring to a whole million understated the
 * database by well over 100k once it passed 1.1M. Always rounds *down* so the
 * "+" stays honest.
 */
export function formatAgentCountLabel(n: number): string {
  if (n >= 1_000_000) {
    const millions = Math.floor(n / 100_000) / 10
    return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M+`
  }
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`
  return `${n}+`
}
