import { NextResponse } from "next/server"
import crypto from "crypto"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { createCheckout } from "@/lib/lemonsqueezy/client"
import { isValidStateCode } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"
import { z } from "zod"

const checkoutSchema = z.object({
  purchaseType: z.enum(["state", "full_database", "subscription", "subscription_api"]),
  stateCode: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { success } = rateLimit(`checkout:${ip}`, 10)
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { purchaseType, stateCode } = parsed.data

    if (purchaseType === "state" && (!stateCode || !isValidStateCode(stateCode))) {
      return NextResponse.json({ error: "Invalid state code" }, { status: 400 })
    }

    let variantId: string
    const customData: Record<string, string> = { purchase_type: purchaseType }

    // Generate a page_token for secure purchase-success page lookup
    // Only the person who completes checkout will have this token in the redirect URL
    if (purchaseType !== "subscription" && purchaseType !== "subscription_api") {
      customData.page_token = crypto.randomUUID()
    }

    if (purchaseType === "state") {
      variantId = process.env.NEXT_PUBLIC_LS_STATE_VARIANT_ID!
      customData.state_code = stateCode!
    } else if (purchaseType === "full_database") {
      variantId = process.env.NEXT_PUBLIC_LS_FULL_DB_VARIANT_ID!
    } else {
      // subscription or subscription_api
      variantId = purchaseType === "subscription_api"
        ? process.env.NEXT_PUBLIC_LS_API_SUBSCRIPTION_VARIANT_ID!
        : process.env.NEXT_PUBLIC_LS_SUBSCRIPTION_VARIANT_ID!
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required for subscription" },
          { status: 401 }
        )
      }
      customData.user_id = user.id

      // Check if user has ever had a subscription (skip trial for returning users)
      const { data: existingSub } = await createServiceClient()
        .schema("usagentleads")
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

      if (existingSub) {
        customData.skip_trial = "true"
      }
    }

    const skipTrial = customData.skip_trial === "true"
    delete customData.skip_trial

    const url = await createCheckout({ variantId, customData, skipTrial })

    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Checkout error:", message)
    return NextResponse.json(
      { error: "Failed to create checkout", detail: message },
      { status: 500 }
    )
  }
}
