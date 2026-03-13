import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sanitizeSearchInput, isValidStateCode, clampPage } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"

const PAGE_SIZE = 25

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
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  const isActive =
    subscription &&
    subscription.status === "active" &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())

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

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Build query
  let query = serviceClient
    .from("agents")
    .select("*", { count: "exact" })
    .order("full_name", { ascending: true })
    .range(from, to)

  if (state && isValidStateCode(state)) {
    query = query.eq("state", state.toUpperCase())
  }

  if (search) {
    const sanitized = sanitizeSearchInput(search)
    if (sanitized) {
      query = query.or(
        `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
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
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  })
}
