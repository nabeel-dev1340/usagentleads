import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(
      Buffer.from(authHeader),
      Buffer.from(expected)
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .schema("usagentleads")
      .rpc("update_state_counts")

    if (error) throw error

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error) {
    console.error("Cron update-state-counts error:", error)
    return NextResponse.json(
      { error: "Failed to update state counts" },
      { status: 500 }
    )
  }
}
