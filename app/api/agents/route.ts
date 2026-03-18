import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sanitizeSearchInput, isValidStateCode, clampPage } from "@/lib/utils/security"
import { getStateByCode } from "@/lib/utils/states"
import { rateLimit } from "@/lib/utils/rateLimit"

const VALID_PAGE_SIZES = [25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

export async function GET(request: Request) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limit per user
  const { success } = rateLimit(`agents:${user.id}`, 30)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // Check active subscription
  const serviceClient = createServiceClient()
  const { data: subscription } = await serviceClient
    .schema("usagentleads")
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, trial_ends_at")
    .eq("user_id", user.id)
    .single()

  // Allow access if:
  // 1. Status is active/on_trial and period hasn't ended, OR
  // 2. Subscription is cancelled but period/trial hasn't ended yet (cancel_at_period_end)
  const now = new Date()
  const periodValid = subscription?.current_period_end
    ? new Date(subscription.current_period_end) > now
    : false
  const trialValid = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at) > now
    : false

  const isActive =
    subscription &&
    (
      // Active or on trial with valid period
      (["active", "on_trial"].includes(subscription.status) && (periodValid || trialValid)) ||
      // Cancelled but still within the paid/trial period
      (subscription.cancel_at_period_end && (periodValid || trialValid))
    )

  if (!isActive) {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 }
    )
  }

  // Parse params
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state") || ""
  const search = searchParams.get("search") || ""
  const page = clampPage(searchParams.get("page") || "1")
  const rawSize = Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE)
  const pageSize = VALID_PAGE_SIZES.includes(rawSize as 25 | 50 | 100) ? rawSize : DEFAULT_PAGE_SIZE

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build query — exclude rows with empty/junk names (must contain at least 2 letters)
  let query = serviceClient
    .schema("usagentleads")
    .from("leads")
    .select("id, name, email, phone, state", { count: "exact" })
    .not("name", "is", null)
    .neq("name", "")
    .filter("name", "match", "[a-zA-Z]{2,}")
    .order("name", { ascending: true })
    .range(from, to)

  if (state && isValidStateCode(state)) {
    const stateEntry = getStateByCode(state)
    if (stateEntry) {
      query = query.eq("state", stateEntry.name)
    }
  }

  if (search) {
    const sanitized = sanitizeSearchInput(search)
    if (sanitized) {
      query = query.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
      )
    }
  }

  const { data, count, error } = await query

  if (error) {
    console.error("Agents query error:", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  return NextResponse.json({
    data: data || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / pageSize),
  })
}
