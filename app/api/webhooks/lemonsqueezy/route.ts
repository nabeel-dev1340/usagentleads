import { NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy/webhook"
import { createServiceClient } from "@/lib/supabase/server"
import { sendDownloadEmail } from "@/lib/resend/emails"
import { getStateByCode } from "@/lib/utils/states"

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

  const supabase = createServiceClient()

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

        // Idempotency check
        const { data: existing } = await supabase
          .from("purchases")
          .select("id")
          .eq("lemon_squeezy_order_id", orderId)
          .single()

        if (existing) {
          return NextResponse.json({ message: "Already processed" })
        }

        const userId = customData.user_id || null

        const { data: purchase, error: insertError } = await supabase
          .from("purchases")
          .insert({
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
          })
          .select("download_token")
          .single()

        if (insertError) {
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
        await supabase
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
        const periodEnd = data.attributes?.renews_at || null

        if (userId) {
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              lemon_squeezy_subscription_id: subId,
              lemon_squeezy_customer_id: customerId,
              status,
              current_period_end: periodEnd,
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

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: periodEnd,
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

        await supabase
          .from("subscriptions")
          .update({
            status: newStatus,
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
