import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCheckout } from "@/lib/lemonsqueezy/client"
import { isValidStateCode } from "@/lib/utils/security"
import { rateLimit } from "@/lib/utils/rateLimit"
import { z } from "zod"

const checkoutSchema = z.object({
  purchaseType: z.enum(["state", "full_database", "subscription"]),
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

    if (purchaseType === "state") {
      variantId = process.env.NEXT_PUBLIC_LS_STATE_VARIANT_ID!
      customData.state_code = stateCode!
    } else if (purchaseType === "full_database") {
      variantId = process.env.NEXT_PUBLIC_LS_FULL_DB_VARIANT_ID!
    } else {
      // subscription
      variantId = process.env.NEXT_PUBLIC_LS_SUBSCRIPTION_VARIANT_ID!
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
    }

    const url = await createCheckout({ variantId, customData })

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    )
  }
}
