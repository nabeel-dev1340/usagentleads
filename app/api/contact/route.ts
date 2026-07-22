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

    // Read as strings only. A multipart File entry has no .replace/.trim, so a
    // blind `as string` cast let a crafted upload throw deep inside the mailer.
    const field = (key: string, max: number): string => {
      const value = body.get(key)
      return typeof value === "string" ? value.trim().slice(0, max) : ""
    }

    // Every field is length-capped: these are relayed verbatim into an email we
    // send ourselves, so unbounded input is both a delivery and a cost problem.
    const name = field("name", 100)
    const email = field("email", 254)
    const subject = field("subject", 200)
    const message = field("message", 5000)
    const honey = field("_honey", 100)

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
