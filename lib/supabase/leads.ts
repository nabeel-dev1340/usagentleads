import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Client for the self-hosted `usagentleads.leads` table.
 *
 * The leads table (~500 MB) was moved off Supabase to stay under the free-tier
 * storage cap; it now lives on our own Postgres, fronted by PostgREST, so the
 * supabase-js query builder keeps working unchanged — only the endpoint differs.
 * Every other table (auth-linked subscriptions, purchases, api_keys, state_count,
 * …) still lives on Supabase and must keep using the clients in ./server.
 *
 * Auth: LEADS_REST_KEY is a long-lived PostgREST JWT whose `role` claim maps to
 * the privileged `leads_service` Postgres role. Server-side only — never expose
 * it to the browser.
 */
let client: SupabaseClient | null = null

export function createLeadsClient(): SupabaseClient {
  if (client) return client

  const url = process.env.LEADS_REST_URL
  const key = process.env.LEADS_REST_KEY
  if (!url || !key) {
    throw new Error(
      "LEADS_REST_URL / LEADS_REST_KEY are not set — the leads database is unconfigured"
    )
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
