import { NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy/webhook"
import { createServiceClient } from "@/lib/supabase/server"
import { sendDownloadEmail } from "@/lib/resend/emails"
import { getStateByCode } from "@/lib/utils/states"

const db = () => createServiceClient().schema("usagentleads")

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-signature") || ""

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)

  // Reject webhooks older than 5 minutes to prevent replay attacks
  const createdAt = payload.data?.attributes?.created_at || payload.data?.attributes?.updated_at
  if (createdAt) {
    const eventAge = Date.now() - new Date(createdAt).getTime()
    if (eventAge > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Webhook too old" }, { status: 400 })
    }
  }

  const eventName = payload.meta?.event_name as string
  const data = payload.data

  try {
    switch (eventName) {
      case "order_created": {
        const orderId = String(data.id)
        const customerId = String(data.attributes?.customer_id || "")
        const customerEmail =
          data.attributes?.user_email || payload.meta?.custom_data?.email || ""
        const status = data.attributes?.status
        const customData = payload.meta?.custom_data || {}
        const purchaseType = customData.purchase_type || "state"
        const stateCode = customData.state_code || null
        const amountPaid = data.attributes?.total || 0

        // Skip subscription orders — handled by subscription_created
        if (purchaseType === "subscription") break

        const userId = customData.user_id || null

        // Atomic idempotency: upsert on unique lemon_squeezy_order_id
        // If the order already exists, the onConflict will match and no changes are made
        const { data: purchase, error: insertError } = await db()
          .from("purchases")
          .upsert(
            {
              user_id: userId,
              guest_email: customerEmail,
              purchase_type: purchaseType,
              state_code: stateCode,
              lemon_squeezy_order_id: orderId,
              lemon_squeezy_customer_id: customerId,
              amount_paid: amountPaid,
              status: status === "paid" ? "completed" : "pending",
              expires_at: new Date(
                Date.now() + 48 * 60 * 60 * 1000
              ).toISOString(),
            },
            { onConflict: "lemon_squeezy_order_id", ignoreDuplicates: true }
          )
          .select("download_token")
          .single()

        if (insertError) {
          // If ignoreDuplicates returned no row, it's already processed
          if (insertError.code === "PGRST116") {
            return NextResponse.json({ message: "Already processed" })
          }
          console.error("Purchase insert error:", insertError)
          return NextResponse.json({ error: "DB error" }, { status: 500 })
        }

        // Send download email if payment is completed
        if (status === "paid" && customerEmail && purchase?.download_token) {
          const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download?token=${purchase.download_token}`

          let productName = "Full USA"
          if (purchaseType === "state" && stateCode) {
            const stateInfo = getStateByCode(stateCode)
            productName = stateInfo?.name || stateCode
          }

          await sendDownloadEmail({
            to: customerEmail,
            downloadUrl,
            productName,
          })
        }

        break
      }

      case "order_refunded": {
        const orderId = String(data.id)
        await db()
          .from("purchases")
          .update({ status: "refunded" })
          .eq("lemon_squeezy_order_id", orderId)
        break
      }

      case "subscription_created": {
        const subId = String(data.id)
        const customerId = String(data.attributes?.customer_id || "")
        const userId = payload.meta?.custom_data?.user_id
        const status = data.attributes?.status || "active"
        const periodStart = data.attributes?.created_at || null
        const periodEnd = data.attributes?.renews_at || null
        const trialEndsAt = data.attributes?.trial_ends_at || null

        if (userId) {
          await db().from("subscriptions").upsert(
            {
              user_id: userId,
              lemon_squeezy_subscription_id: subId,
              lemon_squeezy_customer_id: customerId,
              status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              trial_ends_at: trialEndsAt,
            },
            { onConflict: "user_id" }
          )
        }
        break
      }

      case "subscription_updated": {
        const subId = String(data.id)
        const status = data.attributes?.status || "active"
        const periodEnd = data.attributes?.renews_at || null
        const cancelAtPeriodEnd = data.attributes?.cancelled === true
        const cancelledAt = data.attributes?.cancelled
          ? data.attributes?.updated_at || new Date().toISOString()
          : null

        await db()
          .from("subscriptions")
          .update({
            status,
            current_period_end: periodEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
            cancelled_at: cancelledAt,
            updated_at: new Date().toISOString(),
          })
          .eq("lemon_squeezy_subscription_id", subId)
        break
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const subId = String(data.id)
        const newStatus =
          eventName === "subscription_cancelled" ? "cancelled" : "expired"

        await db()
          .from("subscriptions")
          .update({
            status: newStatus,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("lemon_squeezy_subscription_id", subId)
        break
      }
    }

    return NextResponse.json({ message: "ok" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
