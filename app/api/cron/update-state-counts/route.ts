import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createServiceClient } from "@/lib/supabase/server"
import { createLeadsClient } from "@/lib/supabase/leads"

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
    const leads = createLeadsClient()      // self-hosted: leads + refresh_states()
    const supabase = createServiceClient() // Supabase: state_count

    // Run leads hygiene + per-state aggregation on the VPS; get the counts back.
    const { data: rows, error: rpcError } = await leads
      .schema("usagentleads")
      .rpc("refresh_states")

    if (rpcError) throw rpcError

    type StateRow = { state: string; count: number; total_emails: number; total_phones: number }
    const stateRows = (rows ?? []) as StateRow[]
    const updatedAt = new Date().toISOString()

    // Upsert fresh counts into Supabase's state_count.
    const { error: upsertError } = await supabase
      .schema("usagentleads")
      .from("state_count")
      .upsert(
        stateRows.map((r) => ({
          state: r.state,
          count: r.count,
          total_emails: r.total_emails,
          total_phones: r.total_phones,
          updated_at: updatedAt,
        })),
        { onConflict: "state" }
      )

    if (upsertError) throw upsertError

    // Remove state_count rows for states that no longer exist in leads.
    const keep = new Set(stateRows.map((r) => r.state))
    const { data: existing, error: readError } = await supabase
      .schema("usagentleads")
      .from("state_count")
      .select("state")

    if (readError) throw readError

    const stale = (existing ?? [])
      .map((e) => (e as { state: string }).state)
      .filter((s) => !keep.has(s))

    if (stale.length > 0) {
      const { error: deleteError } = await supabase
        .schema("usagentleads")
        .from("state_count")
        .delete()
        .in("state", stale)
      if (deleteError) throw deleteError
    }

    return NextResponse.json({
      success: true,
      states_updated: stateRows.length,
      total_leads: stateRows.reduce((s, r) => s + r.count, 0),
      total_emails: stateRows.reduce((s, r) => s + r.total_emails, 0),
      total_phones: stateRows.reduce((s, r) => s + r.total_phones, 0),
    })
  } catch (error) {
    console.error("Cron update-state-counts error:", error)
    return NextResponse.json(
      { error: "Failed to update state counts" },
      { status: 500 }
    )
  }
}
