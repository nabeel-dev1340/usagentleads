import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendDownloadEmailParams {
  to: string
  downloadUrl: string
  productName: string
}

export async function sendDownloadEmail({
  to,
  downloadUrl,
  productName,
}: SendDownloadEmailParams) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "downloads@usagentleads.com",
    to,
    subject: `Your ${productName} Real Estate Agent Data is Ready`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #0ea5e9; margin: 0; font-size: 24px;">USAgentLeads</h1>
  </div>

  <p>Hi there,</p>

  <p>Your purchase is confirmed. Here's your download link:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${downloadUrl}" style="background-color: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
      Download Your CSV Now
    </a>
  </div>

  <p style="color: #dc2626; font-weight: 600;">This link expires in 48 hours. Download your file now.</p>

  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-weight: 600;">What's included:</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Full Name</li>
      <li>Email Address</li>
      <li>Phone Number</li>
      <li>State</li>
    </ul>
  </div>

  <p style="color: #64748b; font-size: 14px;">File format: CSV (opens in Excel, Google Sheets, or any CRM)</p>

  <p>Questions? Reply to this email.</p>

  <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; color: #94a3b8; font-size: 13px;">
    <p>&mdash; USAgentLeads Team</p>
  </div>
</body>
</html>`,
  })
}
