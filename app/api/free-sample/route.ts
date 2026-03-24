import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendFreeSampleEmail } from "@/lib/resend/emails"
import { escapeHtml } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // Rate limit: 3 requests per IP per minute
  const { success } = rateLimit(`free-sample:${ip}`, 3, 60_000)
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const body = await request.json()
  const email = body.email?.trim()?.toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()

    // Generate a signed URL (7 days) for the pre-generated sample CSV
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("agent-csvs")
      .createSignedUrl("free-sample/free-sample-data.csv", 60 * 60 * 24 * 7)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError)
      throw new Error("Failed to generate download link")
    }

    await sendFreeSampleEmail({
      to: escapeHtml(email),
      downloadUrl: signedUrlData.signedUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Free sample error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
