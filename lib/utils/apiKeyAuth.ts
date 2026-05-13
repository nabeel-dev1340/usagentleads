import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { hashApiKey } from "./apiKeys"

const MONTHLY_QUOTA = 10_000

interface AuthResult {
  userId: string
  apiKeyId: string
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

  // Check monthly quota
  const { count } = await serviceClient
    .schema("usagentleads")
    .from("api_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", keyRecord.user_id)
    .gte("created_at", new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
    .lt("status_code", 400)

  if ((count ?? 0) >= MONTHLY_QUOTA) {
    return NextResponse.json(
      {
        error: "Monthly API quota exceeded",
        quota: { used: count, limit: MONTHLY_QUOTA },
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

  return { userId: keyRecord.user_id, apiKeyId: keyRecord.id }
}

export function getQuotaHeaders(used: number) {
  return {
    "X-RateLimit-Limit": "60",
    "X-Monthly-Quota-Limit": String(MONTHLY_QUOTA),
    "X-Monthly-Quota-Remaining": String(Math.max(0, MONTHLY_QUOTA - used)),
  }
}

export { MONTHLY_QUOTA }
