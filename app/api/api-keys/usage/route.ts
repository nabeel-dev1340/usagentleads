import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/utils/rateLimit"
import { getMonthlyQuota } from "@/lib/utils/apiKeyAuth"

const db = () => createServiceClient().schema("usagentleads")

// GET — monthly usage stats for current user
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { success } = rateLimit(`api-keys-usage:${user.id}`, 10)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // Check trial status
  const { data: subscription } = await db()
    .from("subscriptions")
    .select("status, trial_ends_at")
    .eq("user_id", user.id)
    .single()

  const now = new Date()
  const onTrial =
    subscription?.status === "on_trial" &&
    subscription?.trial_ends_at &&
    new Date(subscription.trial_ends_at) > now

  const quota = getMonthlyQuota(!!onTrial)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Total monthly count
  const { count: monthlyUsed } = await db()
    .from("api_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStart.toISOString())
    .lt("status_code", 400)

  // Daily breakdown for current month
  const { data: logs } = await db()
    .from("api_usage_logs")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", monthStart.toISOString())
    .lt("status_code", 400)
    .order("created_at", { ascending: true })

  // Aggregate by day
  const dailyCounts: Record<string, number> = {}
  for (const log of logs || []) {
    const day = log.created_at.slice(0, 10)
    dailyCounts[day] = (dailyCounts[day] || 0) + 1
  }

  return NextResponse.json({
    monthly_used: monthlyUsed ?? 0,
    monthly_limit: quota,
    on_trial: !!onTrial,
    resets_at: nextMonth.toISOString(),
    daily_counts: Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })),
  })
}
