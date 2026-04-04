import { NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/resend/emails"

export async function POST(request: Request) {
  try {
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

    await sendContactEmail({ name, email, subject, message })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
