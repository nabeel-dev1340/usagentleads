import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isValidUUID } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"

const db = () => createServiceClient().schema("usagentleads")

// GET — look up a purchase by page_token (only the buyer has this token)
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { success } = rateLimit(`purchase-lookup:${ip}`, 10)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const pageToken = request.nextUrl.searchParams.get("pt")
  if (!pageToken || !isValidUUID(pageToken)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  const { data: purchase } = await db()
    .from("purchases")
    .select("download_token, purchase_type, state_code, status, token_used, expires_at")
    .eq("page_token", pageToken)
    .single()

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
  }

  const expired = purchase.expires_at && new Date(purchase.expires_at) < new Date()

  return NextResponse.json({
    status: purchase.status,
    purchaseType: purchase.purchase_type,
    stateCode: purchase.state_code,
    downloadAvailable: purchase.status === "completed" && !purchase.token_used && !expired,
    downloadUrl: purchase.status === "completed" && !purchase.token_used && !expired
      ? `/api/download?token=${purchase.download_token}`
      : null,
  })
}
