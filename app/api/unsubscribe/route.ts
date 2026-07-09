import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { verifyUnsubToken } from "@/lib/utils/unsubscribe"

function page(title: string, message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1a1a1a;margin:0;padding:0;">
<div style="max-width:480px;margin:80px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:40px 32px;text-align:center;">
<h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
<p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px;">${message}</p>
<a href="https://www.usagentleads.com" style="color:#1D4ED8;text-decoration:none;font-weight:600;font-size:14px;">Return to USAgentLeads</a>
</div></body></html>`
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("e")?.trim().toLowerCase()
  const token = request.nextUrl.searchParams.get("t")?.trim()

  if (!email || !token || !verifyUnsubToken(email, token)) {
    return page("Invalid link", "This unsubscribe link is invalid or has expired. If you keep receiving emails, reply to any of them and we'll remove you.")
  }

  try {
    const supabase = createServiceClient()
    await supabase
      .schema("usagentleads")
      .from("sample_leads")
      .update({ status: "unsubscribed" })
      .eq("email", email)
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return page("Something went wrong", "We couldn't process your request just now. Please reply to any email and we'll remove you manually.")
  }

  return page("You're unsubscribed", "You won't receive any more follow-up emails from USAgentLeads. Your free sample download link still works.")
}
