import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { hashApiKey } from "./apiKeys"

const MONTHLY_QUOTA_FULL = 10_000
const MONTHLY_QUOTA_TRIAL = 100

interface AuthResult {
  userId: string
  apiKeyId: string
  onTrial: boolean
}

/** Returns the effective monthly quota based on trial status */
export function getMonthlyQuota(onTrial: boolean): number {
  return onTrial ? MONTHLY_QUOTA_TRIAL : MONTHLY_QUOTA_FULL
}

export async function authenticateApiKey(
  request: Request
): Promise<AuthResult | NextResponse> {
  // Extract key from headers
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null

  if (!apiKey || !apiKey.startsWith("sk_live_")) {
    return NextResponse.json(
      { error: "Missing or invalid API key" },
      { status: 401 }
    )
  }

  const keyHash = hashApiKey(apiKey)
  const serviceClient = createServiceClient()

  // Look up key + subscription in one query
  const { data: keyRecord, error } = await serviceClient
    .schema("usagentleads")
    .from("api_keys")
    .select("id, user_id, revoked_at, expires_at")
    .eq("key_hash", keyHash)
    .single()

  if (error || !keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  // Check key not revoked
  if (keyRecord.revoked_at) {
    return NextResponse.json(
      { error: "API key has been revoked" },
      { status: 401 }
    )
  }

  // Check key not expired
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "API key has expired" },
      { status: 401 }
    )
  }

  // Check subscription is active + pro_api plan
  const { data: subscription } = await serviceClient
    .schema("usagentleads")
    .from("subscriptions")
    .select("status, plan, current_period_end, cancel_at_period_end, trial_ends_at")
    .eq("user_id", keyRecord.user_id)
    .single()

  if (!subscription || subscription.plan !== "pro_api") {
    return NextResponse.json(
      { error: "Pro API subscription required" },
      { status: 403 }
    )
  }

  const now = new Date()
  const periodValid = subscription.current_period_end
    ? new Date(subscription.current_period_end) > now
    : false
  const trialValid = subscription.trial_ends_at
    ? new Date(subscription.trial_ends_at) > now
    : false

  const isActive =
    (["active", "on_trial"].includes(subscription.status) && (periodValid || trialValid)) ||
    (subscription.cancel_at_period_end && (periodValid || trialValid))

  if (!isActive) {
    return NextResponse.json(
      { error: "Subscription is not active" },
      { status: 403 }
    )
  }

  // Determine if user is on trial
  const onTrial = subscription.status === "on_trial" && trialValid
  const quota = getMonthlyQuota(onTrial)

  // Check monthly quota
  const { count } = await serviceClient
    .schema("usagentleads")
    .from("api_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", keyRecord.user_id)
    .gte("created_at", new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
    .lt("status_code", 400)

  if ((count ?? 0) >= quota) {
    return NextResponse.json(
      {
        error: onTrial
          ? "Trial API quota exceeded (100 requests). Subscribe to unlock 10,000/month."
          : "Monthly API quota exceeded",
        quota: { used: count, limit: quota },
      },
      { status: 429 }
    )
  }

  // Fire-and-forget: update last_used_at
  serviceClient
    .schema("usagentleads")
    .from("api_keys")
    .update({ last_used_at: now.toISOString() })
    .eq("id", keyRecord.id)
    .then(() => {})

  return { userId: keyRecord.user_id, apiKeyId: keyRecord.id, onTrial }
}

export function getQuotaHeaders(used: number, onTrial: boolean) {
  const quota = getMonthlyQuota(onTrial)
  return {
    "X-RateLimit-Limit": "60",
    "X-Monthly-Quota-Limit": String(quota),
    "X-Monthly-Quota-Remaining": String(Math.max(0, quota - used)),
  }
}

export { MONTHLY_QUOTA_FULL, MONTHLY_QUOTA_TRIAL }
