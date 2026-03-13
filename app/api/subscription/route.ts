import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/utils/rateLimit"

const db = () => createServiceClient().schema("usagentleads")

// GET — return current user's subscription
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: subscription } = await db()
    .from("subscriptions")
    .select(
      "status, plan, current_period_start, current_period_end, trial_ends_at, cancel_at_period_end, cancelled_at, created_at"
    )
    .eq("user_id", user.id)
    .single()

  return NextResponse.json({ subscription })
}

// DELETE — cancel subscription (sets cancel_at_period_end via LemonSqueezy API)
export async function DELETE(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { success } = rateLimit(`sub-cancel:${ip}`, 5)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: subscription } = await db()
    .from("subscriptions")
    .select("lemon_squeezy_subscription_id, status, cancel_at_period_end")
    .eq("user_id", user.id)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 })
  }

  if (subscription.cancel_at_period_end) {
    return NextResponse.json({ error: "Already scheduled for cancellation" }, { status: 400 })
  }

  if (!["active", "on_trial"].includes(subscription.status)) {
    return NextResponse.json({ error: "Subscription is not active" }, { status: 400 })
  }

  // Cancel via LemonSqueezy API (cancel at period end, not immediately)
  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${subscription.lemon_squeezy_subscription_id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: subscription.lemon_squeezy_subscription_id,
          attributes: {
            cancelled: true,
          },
        },
      }),
    }
  )

  if (!response.ok) {
    const errBody = await response.text()
    console.error("LemonSqueezy cancel error:", errBody)
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }

  // Update local record immediately (webhook will also update, but this gives instant feedback)
  await db()
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)

  return NextResponse.json({ message: "Subscription will cancel at end of billing period" })
}
