import { createServiceClient } from "@/lib/supabase/server"
import { sanitizeSearchInput, isValidStateCode } from "@/lib/utils/security"
import { getStateByCode } from "@/lib/utils/states"
import { cleanName } from "@/lib/utils/clean-name"
import { maskEmail, maskPhone } from "@/lib/utils/mask"
import { DIRECTORY_PAGE_SIZE, DIRECTORY_MAX_PAGE } from "@/lib/utils/directory-limits"

export { DIRECTORY_PAGE_SIZE, DIRECTORY_MAX_PAGE }

// Minimum name-search length. A global (no-state) search needs 3 characters:
// a 2-char substring is too broad for the pg_trgm index to stay selective. Once
// a state narrows the set, 2 characters is fine.
const MIN_QUERY_WITH_STATE = 2
const MIN_QUERY_GLOBAL = 3

/** A directory row is contact-masked before it ever leaves the server. */
export interface DirectoryRow {
  id: string
  name: string
  state: string
  emailMasked: string | null
  phoneMasked: string | null
  hasEmail: boolean
  hasPhone: boolean
}

export interface DirectoryParams {
  /** Two-letter state code (validated against a whitelist). */
  state?: string | null
  /** Free-text name search (sanitized; PostgREST filter chars stripped). */
  q?: string | null
  page?: string | number | null
}

export interface DirectoryResult {
  rows: DirectoryRow[]
  page: number
  pageSize: number
  hasMore: boolean
  /** The resolved full state name, if a valid state was supplied. */
  stateName: string | null
  /** The sanitized query actually applied (empty string if none). */
  query: string
}

function clampDirectoryPage(page: unknown): number {
  const num = Number(page)
  if (!Number.isFinite(num) || num < 1) return 1
  if (num > DIRECTORY_MAX_PAGE) return DIRECTORY_MAX_PAGE
  return Math.floor(num)
}

const EMPTY = (page: number, stateName: string | null, query: string): DirectoryResult => ({
  rows: [],
  page,
  pageSize: DIRECTORY_PAGE_SIZE,
  hasMore: false,
  stateName,
  query,
})

/**
 * Search the public agent directory by name and/or state.
 *
 * Security properties:
 *  - `state` is resolved through an allow-list (isValidStateCode) before use.
 *  - `q` is run through sanitizeSearchInput, which strips the characters
 *    PostgREST uses as filter separators (commas, dots, parens, %), so it cannot
 *    break out of the `.ilike()` value. We also use a single-column `.ilike()`
 *    (value passed as a bound parameter) rather than `.or()` string building.
 *  - Page size is fixed and pagination depth is capped (see constants above).
 *  - Email/phone are masked here; raw contact values never reach the caller.
 *  - Requires at least a valid state OR a >=2 char query, so the endpoint can
 *    never be used to page through the entire unfiltered table.
 */
export async function searchDirectory(params: DirectoryParams): Promise<DirectoryResult> {
  const page = clampDirectoryPage(params.page)

  // Resolve + validate state via allow-list.
  let stateName: string | null = null
  if (params.state) {
    const code = String(params.state).trim()
    if (isValidStateCode(code)) {
      stateName = getStateByCode(code)?.name ?? null
    } else {
      // Unknown state code -> no results rather than a silent full-table browse.
      return EMPTY(page, null, "")
    }
  }

  // Sanitize the name query.
  const query = params.q ? sanitizeSearchInput(String(params.q)) : ""
  const minQueryLength = stateName ? MIN_QUERY_WITH_STATE : MIN_QUERY_GLOBAL
  const hasQuery = query.length >= minQueryLength

  // Require some filter. A bare, unfiltered directory dump is not allowed.
  if (!stateName && !hasQuery) {
    return EMPTY(page, stateName, hasQuery ? query : "")
  }

  const supabase = createServiceClient()
  const from = (page - 1) * DIRECTORY_PAGE_SIZE
  // Fetch one extra row to detect a next page without an expensive exact count.
  const to = from + DIRECTORY_PAGE_SIZE

  let builder = supabase
    .schema("usagentleads")
    .from("leads")
    .select("id, name, state, email, phone")
    .not("name", "is", null)
    .neq("name", "")
    .filter("name", "match", "[a-zA-Z]{2,}")

  if (stateName) {
    builder = builder.eq("state", stateName)
  }
  if (hasQuery) {
    // Single-column ILIKE — the value is sent as a bound parameter, and the
    // sanitizer already removed PostgREST filter metacharacters. Backed by the
    // pg_trgm GIN indexes (idx_leads_name_trgm for global search,
    // idx_leads_state_name_trgm for state+name) so this never seq-scans the table.
    builder = builder.ilike("name", `%${query}%`)
  }

  // Ordering strategy is performance-critical on a ~1M-row table. ORDER BY is
  // applied ONLY to a pure state browse (no name filter):
  //  - Browse (state, no query): idx_leads_state_name_id returns rows already in
  //    (name, id) order, so LIMIT stops at one page immediately (~0.5ms).
  //  - Any name search (global OR state-scoped) SKIPS ORDER BY. Sorting a name
  //    search would force Postgres to materialize/scan every match before LIMIT
  //    — measured in SECONDS for common substrings ("%jose%" matched 40k+ rows).
  //    Unordered, the GIN indexes let the scan stop after a single page
  //    (~10-25ms). The trade-off (search results aren't alphabetized) is fine for
  //    a search box and is what keeps the endpoint from overloading under load.
  if (!hasQuery) {
    builder = builder
      .order("name", { ascending: true })
      .order("id", { ascending: true })
  }

  builder = builder.range(from, to)

  const { data, error } = await builder

  if (error) {
    console.error("Directory query error:", error)
    // Fail closed: never surface raw errors or partial data to the public.
    return EMPTY(page, stateName, hasQuery ? query : "")
  }

  const raw = (data ?? []) as {
    id: string
    name: string
    state: string
    email: string | null
    phone: string | null
  }[]

  const hasMore = raw.length > DIRECTORY_PAGE_SIZE
  const pageRows = raw.slice(0, DIRECTORY_PAGE_SIZE)

  const rows: DirectoryRow[] = pageRows.map((r) => ({
    id: r.id,
    name: cleanName(r.name) ?? r.name,
    state: r.state,
    emailMasked: maskEmail(r.email),
    phoneMasked: maskPhone(r.phone),
    hasEmail: Boolean(r.email && r.email.trim()),
    hasPhone: Boolean(r.phone && r.phone.trim()),
  }))

  return {
    rows,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
    hasMore,
    stateName,
    query: hasQuery ? query : "",
  }
}
