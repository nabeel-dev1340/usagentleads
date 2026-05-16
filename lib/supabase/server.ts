import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}

/** Fetch total lead count from state_count table. Returns 0 if DB is unavailable. */
export async function getTotalCount(): Promise<number> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .schema("usagentleads")
    .from("state_count")
    .select("count")

  if (!data || data.length === 0) return 0
  return data.reduce((sum: number, row: { count: number }) => sum + row.count, 0)
}

/** Fetch total contacts, emails, and phones across all states. Returns zeros if DB is unavailable. */
export async function getDatabaseTotals(): Promise<{ count: number; emails: number; phones: number }> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .schema("usagentleads")
    .from("state_count")
    .select("count, total_emails, total_phones")

  if (!data || data.length === 0) return { count: 0, emails: 0, phones: 0 }
  return data.reduce(
    (acc, row: { count: number; total_emails: number; total_phones: number }) => ({
      count: acc.count + row.count,
      emails: acc.emails + row.total_emails,
      phones: acc.phones + row.total_phones,
    }),
    { count: 0, emails: 0, phones: 0 }
  )
}

/** Fetch per-state agent counts keyed by state name. Returns empty object if DB is unavailable. */
export async function getStateCountMap(): Promise<Record<string, number>> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .schema("usagentleads")
    .from("state_count")
    .select("state, count")

  const map: Record<string, number> = {}
  if (!data) return map
  for (const row of data as { state: string; count: number }[]) {
    map[row.state] = row.count
  }
  return map
}
