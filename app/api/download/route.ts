import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isValidUUID } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const { success } = rateLimit(`download:${ip}`, 10)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token || !isValidUUID(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("download_token", token)
    .single()

  if (error || !purchase) {
    return NextResponse.json(
      { error: "Download link not found" },
      { status: 404 }
    )
  }

  if (purchase.status !== "completed") {
    return NextResponse.json(
      { error: "Purchase not completed" },
      { status: 403 }
    )
  }

  if (purchase.token_used) {
    return NextResponse.json(
      { error: "This download link has already been used" },
      { status: 403 }
    )
  }

  if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This download link has expired" },
      { status: 403 }
    )
  }

  // Determine file path
  let filePath: string
  if (purchase.purchase_type === "full_database") {
    filePath = "full/usa_agents_full.csv"
  } else if (purchase.purchase_type === "state" && purchase.state_code) {
    filePath = `states/${purchase.state_code}.csv`
  } else {
    return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 })
  }

  // Generate signed URL
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

  // Mark token as used
  await supabase
    .from("purchases")
    .update({ token_used: true })
    .eq("id", purchase.id)

  // Log download
  await supabase.from("download_logs").insert({
    user_id: purchase.user_id,
    guest_email: purchase.guest_email,
    download_type: purchase.purchase_type,
    state_code: purchase.state_code,
    ip_address: ip,
    user_agent: request.headers.get("user-agent") || null,
  })

  return NextResponse.redirect(signedUrlData.signedUrl)
}
