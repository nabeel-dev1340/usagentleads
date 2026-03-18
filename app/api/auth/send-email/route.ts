import { NextResponse } from "next/server"
import { Webhook } from "standardwebhooks"
import { sendMagicLink, sendConfirmSignup } from "@/lib/resend/emails"

// Supabase Auth Hook payload types
interface AuthHookPayload {
  user: {
    email: string
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new: string
    token_hash_new: string
  }
}

export async function POST(request: Request) {
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET

  if (!hookSecret) {
    console.error("SEND_EMAIL_HOOK_SECRET is not set")
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  try {
    // Verify the webhook signature using standardwebhooks
    const payload = await request.text()
    const headers = Object.fromEntries(request.headers)

    const wh = new Webhook(hookSecret)
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as AuthHookPayload

    // Build the confirmation URL (Supabase auth verification endpoint)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`)}`

    switch (email_action_type) {
      case "magic_link":
      case "magiclink":
        await sendMagicLink({ to: user.email, confirmationUrl })
        break
      case "signup":
      case "email_change":
        await sendConfirmSignup({ to: user.email, confirmationUrl })
        break
      default:
        await sendMagicLink({ to: user.email, confirmationUrl })
        break
    }

    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Auth email hook error:", message)
    return NextResponse.json(
      {
        error: {
          http_code: 401,
          message,
        },
      },
      { status: 401 }
    )
  }
}
