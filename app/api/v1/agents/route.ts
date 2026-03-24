import { NextResponse } from "next/server"
import { authenticateApiKey, getQuotaHeaders, getMonthlyQuota } from "@/lib/utils/apiKeyAuth"
import { rateLimit } from "@/lib/utils/rateLimit"
import { queryAgents } from "@/lib/queries/agents"
import { createServiceClient } from "@/lib/supabase/server"

// GET /api/v1/agents — public API endpoint, authenticated via API key
export async function GET(request: Request) {
  const startTime = Date.now()

  // Authenticate via API key
  const authResult = await authenticateApiKey(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { userId, apiKeyId, onTrial } = authResult

  // Per-minute rate limit
  const { success, remaining } = rateLimit(`api-v1:${apiKeyId}`, 60)
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 60 requests per minute." },
      { status: 429, headers: { "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": "0" } }
    )
  }

  // Parse query params
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state") || undefined
  const search = searchParams.get("search") || undefined
  const page = searchParams.get("page") || "1"
  const pageSize = searchParams.get("pageSize") || "25"

  let result
  let statusCode = 200
  try {
    result = await queryAgents({ state, search, page, pageSize })
  } catch {
    statusCode = 500
    logUsage(apiKeyId, userId, "/api/v1/agents", statusCode, request, Date.now() - startTime)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  // Get current monthly usage for quota headers
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const quota = getMonthlyQuota(onTrial)

  const serviceClient = createServiceClient()
  const { count: monthlyUsed } = await serviceClient
    .schema("usagentleads")
    .from("api_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString())
    .lt("status_code", 400)

  const used = (monthlyUsed ?? 0) + 1
  const quotaHeaders = getQuotaHeaders(used, onTrial)

  // Log usage (fire-and-forget)
  logUsage(apiKeyId, userId, "/api/v1/agents", statusCode, request, Date.now() - startTime)

  return NextResponse.json(
    {
      data: result.data,
      count: result.count,
      page: result.page,
      totalPages: result.totalPages,
      quota: {
        used,
        limit: quota,
        resets_at: nextMonth.toISOString(),
        ...(onTrial ? { trial: true } : {}),
      },
    },
    {
      headers: {
        ...quotaHeaders,
        "X-RateLimit-Remaining": String(remaining ?? 0),
      },
    }
  )
}

function logUsage(
  apiKeyId: string,
  userId: string,
  endpoint: string,
  statusCode: number,
  request: Request,
  responseTimeMs: number
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  const userAgent = request.headers.get("user-agent") || null

  createServiceClient()
    .schema("usagentleads")
    .from("api_usage_logs")
    .insert({
      api_key_id: apiKeyId,
      user_id: userId,
      endpoint,
      status_code: statusCode,
      ip_address: ip,
      user_agent: userAgent,
      response_time_ms: responseTimeMs,
    })
    .then(() => {})
}
