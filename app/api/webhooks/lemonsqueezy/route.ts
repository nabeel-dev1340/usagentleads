import { NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy/webhook"
import { createServiceClient } from "@/lib/supabase/server"
import {
  sendDownloadEmail,
  sendSubscriptionWelcome,
  sendSubscriptionCancelled,
  sendSubscriptionRenewed,
  sendPaymentFailed,
} from "@/lib/resend/emails"
import { getStateByCode } from "@/lib/utils/states"

const db = () => createServiceClient().schema("usagentleads")

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-signature") || ""

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Reject webhooks older than 5 minutes to prevent replay attacks
  const createdAt = payload.data?.attributes?.created_at || payload.data?.attributes?.updated_at
  if (!createdAt) {
    return NextResponse.json({ error: "Missing timestamp" }, { status: 400 })
  }
  const eventAge = Date.now() - new Date(createdAt).getTime()
  if (eventAge > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Webhook too old" }, { status: 400 })
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
        if (purchaseType === "subscription" || purchaseType === "subscription_api") break

        const userId = customData.user_id || null
        const pageToken = customData.page_token || null

        // Atomic idempotency: upsert on unique lemon_squeezy_order_id
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
              ...(pageToken ? { page_token: pageToken } : {}),
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
            purchaseType,
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
        const customerEmail = data.attributes?.user_email || ""
        const status = data.attributes?.status || "active"
        const periodStart = data.attributes?.created_at || null
        const periodEnd = data.attributes?.renews_at || null
        const trialEndsAt = data.attributes?.trial_ends_at || null
        const customData = payload.meta?.custom_data || {}
        const plan = customData.purchase_type === "subscription_api" ? "pro_api" : "pro_monthly"

        if (userId) {
          await db().from("subscriptions").upsert(
            {
              user_id: userId,
              lemon_squeezy_subscription_id: subId,
              lemon_squeezy_customer_id: customerId,
              status,
              plan,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              trial_ends_at: trialEndsAt,
            },
            { onConflict: "user_id" }
          )
        }

        // Send welcome email
        if (customerEmail) {
          await sendSubscriptionWelcome({ to: customerEmail })
        }

        break
      }

      case "subscription_updated": {
        const subId = String(data.id)
        const status = data.attributes?.status || "active"
        const customerEmail = data.attributes?.user_email || ""
        const periodEnd = data.attributes?.renews_at || null
        const cancelAtPeriodEnd = data.attributes?.cancelled === true
        const cancelledAt = data.attributes?.cancelled
          ? data.attributes?.updated_at || new Date().toISOString()
          : null

        // Fetch existing subscription to determine if this is a genuine renewal
        const { data: existingSub } = await db()
          .from("subscriptions")
          .select("created_at")
          .eq("lemon_squeezy_subscription_id", subId)
          .single()

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

        // Send appropriate notification email
        if (customerEmail) {
          if (cancelAtPeriodEnd) {
            // User cancelled — notify with access end date
            await sendSubscriptionCancelled({
              to: customerEmail,
              accessUntil: periodEnd,
            })
          } else if (status === "past_due") {
            // Payment failed
            await sendPaymentFailed({ to: customerEmail })
          } else if (status === "active" && !cancelAtPeriodEnd) {
            // Only send renewal email if subscription is older than 5 minutes
            // (avoids duplicate email on initial creation + immediate update)
            const isNew = existingSub?.created_at &&
              Date.now() - new Date(existingSub.created_at).getTime() < 5 * 60 * 1000
            if (!isNew) {
              await sendSubscriptionRenewed({
                to: customerEmail,
                nextRenewal: periodEnd,
              })
            }
          }
        }

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

      case "subscription_payment_failed": {
        const customerEmail = data.attributes?.user_email || ""
        if (customerEmail) {
          await sendPaymentFailed({ to: customerEmail })
        }
        break
      }
    }

    return NextResponse.json({ message: "ok" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
