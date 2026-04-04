import { NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/resend/emails"
import { rateLimit } from "@/lib/utils/rateLimit"

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // Rate limit: 3 requests per IP per minute
    const { success: ipOk } = await rateLimit(`contact:${ip}`, 3, 60_000)
    if (!ipOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.formData()

    const name = body.get("name") as string
    const email = body.get("email") as string
    const subject = body.get("subject") as string
    const message = body.get("message") as string
    const honey = body.get("_honey") as string

    // Honeypot check
    if (honey) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    await sendContactEmail({ name, email, subject, message })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
