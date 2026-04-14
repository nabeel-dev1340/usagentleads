import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isValidUUID, isValidStateCode } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"

const db = () => createServiceClient().schema("usagentleads")

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const { success } = await rateLimit(`download:${ip}`, 10)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token || !isValidUUID(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  // First check expiry without claiming (avoids claim/revert race)
  const { data: check } = await db()
    .from("purchases")
    .select("expires_at")
    .eq("download_token", token)
    .eq("token_used", false)
    .eq("status", "completed")
    .single()

  if (!check) {
    return NextResponse.json(
      { error: "Invalid or expired download link" },
      { status: 403 }
    )
  }

  if (check.expires_at && new Date(check.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired download link" },
      { status: 403 }
    )
  }

  // Atomic: claim the token in a single update (prevents race condition)
  const { data: purchase, error } = await db()
    .from("purchases")
    .update({ token_used: true })
    .eq("download_token", token)
    .eq("token_used", false)
    .eq("status", "completed")
    .select("id, user_id, guest_email, purchase_type, state_code, expires_at")
    .single()

  if (error || !purchase) {
    return NextResponse.json(
      { error: "Invalid or expired download link" },
      { status: 403 }
    )
  }

  // Determine file path
  let filePath: string
  if (purchase.purchase_type === "full_database") {
    filePath = "full/usa_agents_full.csv.gz"
  } else if (purchase.purchase_type === "state" && purchase.state_code && isValidStateCode(purchase.state_code)) {
    filePath = `states/${purchase.state_code}.csv`
  } else {
    return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 })
  }

  // Generate signed URL
  const supabase = createServiceClient()
  const { data: signedUrlData, error: storageError } = await supabase.storage
    .from("agent-csvs")
    .createSignedUrl(filePath, 300) // 5-minute expiry

  if (storageError || !signedUrlData?.signedUrl) {
    console.error("Storage signed URL error:", storageError)
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    )
  }

  // Log download
  await db().from("download_logs").insert({
    user_id: purchase.user_id,
    guest_email: purchase.guest_email,
    download_type: purchase.purchase_type,
    state_code: purchase.state_code,
    ip_address: ip,
    user_agent: request.headers.get("user-agent") || null,
  })

  return NextResponse.redirect(signedUrlData.signedUrl)
}
