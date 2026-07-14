import { createLeadsClient } from "@/lib/supabase/leads"
import { sanitizeSearchInput, isValidStateCode, clampPage } from "@/lib/utils/security"
import { getStateByCode } from "@/lib/utils/states"

const VALID_PAGE_SIZES = [25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

interface QueryAgentsParams {
  state?: string
  search?: string
  page?: string | number
  pageSize?: string | number
}

interface QueryAgentsResult {
  data: { id: string; name: string; email: string; phone: string; state: string }[]
  count: number
  page: number
  totalPages: number
}

export async function queryAgents(params: QueryAgentsParams): Promise<QueryAgentsResult> {
  const serviceClient = createLeadsClient()

  const page = clampPage(String(params.page || "1"))
  const rawSize = Number(params.pageSize || DEFAULT_PAGE_SIZE)
  const pageSize = VALID_PAGE_SIZES.includes(rawSize as 25 | 50 | 100) ? rawSize : DEFAULT_PAGE_SIZE

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = serviceClient
    .schema("usagentleads")
    .from("leads")
    .select("id, name, email, phone, state", { count: "exact" })
    .not("name", "is", null)
    .neq("name", "")
    .filter("name", "match", "[a-zA-Z]{2,}")
    .order("name", { ascending: true })
    .range(from, to)

  if (params.state && isValidStateCode(params.state)) {
    const stateEntry = getStateByCode(params.state)
    if (stateEntry) {
      query = query.eq("state", stateEntry.name)
    }
  }

  if (params.search) {
    const sanitized = sanitizeSearchInput(params.search)
    if (sanitized) {
      query = query.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
      )
    }
  }

  const { data, count, error } = await query

  if (error) {
    console.error("Agents query error:", error)
    throw new Error("Query failed")
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}
