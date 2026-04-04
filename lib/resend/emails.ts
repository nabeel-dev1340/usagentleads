import { Resend } from "resend"
import { escapeHtml } from "@/lib/utils/security"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "USAgentLeads <support@beelodev.com>"

// ── Shared email layout ──────────────────────────────────────────────

const BRAND_COLOR = "#1D4ED8"
const BRAND_DARK = "#1E40AF"

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <!-- Header -->
  <div style="background-color: ${BRAND_COLOR}; padding: 28px 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">USAgentLeads</h1>
  </div>

  <!-- Body -->
  <div style="background-color: #ffffff; padding: 36px 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
    ${body}
  </div>

  <!-- Footer -->
  <div style="padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">
      USAgentLeads &mdash; A product by <a href="https://beelodev.com" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 500;">BeeloDev</a>
    </p>
    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
      Questions? Reply to this email or contact us at support@beelodev.com
    </p>
  </div>
</body>
</html>`
}

function primaryButton(url: string, label: string): string {
  return `<div style="text-align: center; margin: 28px 0;">
    <a href="${escapeHtml(url)}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; mso-padding-alt: 0; text-align: center;">
      <!--[if mso]><i style="mso-font-width: 150%; mso-text-raise: 21pt;">&nbsp;</i><![endif]-->
      <span style="mso-text-raise: 10pt;">${escapeHtml(label)}</span>
      <!--[if mso]><i style="mso-font-width: 150%;">&nbsp;</i><![endif]-->
    </a>
  </div>`
}

function infoBox(content: string): string {
  return `<div style="background-color: #EEF2FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
    ${content}
  </div>`
}

// ── Magic link email (auth) ──────────────────────────────────────────

interface SendMagicLinkParams {
  to: string
  confirmationUrl: string
}

export async function sendMagicLink({
  to,
  confirmationUrl,
}: SendMagicLinkParams) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 8px 0; font-size: 15px;">
      You requested a magic link to sign in to your USAgentLeads account. Click the button below to continue.
    </p>

    ${primaryButton(confirmationUrl, "Sign In to USAgentLeads")}

    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: #1e3a5f;">
        This link will expire in 24 hours and can only be used once. If you didn't request this email, you can safely ignore it.
      </p>
    `)}

    <p style="color: #6B7280; font-size: 13px; margin: 24px 0 0 0;">
      If the button above doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="color: ${BRAND_COLOR}; font-size: 13px; word-break: break-all; margin: 4px 0 0 0;">
      ${escapeHtml(confirmationUrl)}
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Sign in to USAgentLeads",
    html: emailLayout(body),
  })
}

// ── Confirm signup email (auth) ─────────────────────────────────────

interface SendConfirmSignupParams {
  to: string
  confirmationUrl: string
}

export async function sendConfirmSignup({
  to,
  confirmationUrl,
}: SendConfirmSignupParams) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Welcome to USAgentLeads!</p>

    <p style="margin: 0 0 8px 0; font-size: 15px;">
      Please confirm your email address to get started. Click the button below to verify your account.
    </p>

    ${primaryButton(confirmationUrl, "Confirm Email Address")}

    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: #1e3a5f;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    `)}

    <p style="color: #6B7280; font-size: 13px; margin: 24px 0 0 0;">
      If the button above doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="color: ${BRAND_COLOR}; font-size: 13px; word-break: break-all; margin: 4px 0 0 0;">
      ${escapeHtml(confirmationUrl)}
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Confirm your USAgentLeads account",
    html: emailLayout(body),
  })
}

// ── Download email (state pack or full database purchase) ────────────

interface SendDownloadEmailParams {
  to: string
  downloadUrl: string
  productName: string
  purchaseType: "state" | "full_database"
}

export async function sendDownloadEmail({
  to,
  downloadUrl,
  productName,
  purchaseType,
}: SendDownloadEmailParams) {
  const fileFormat = "CSV"
  const subject = `Your ${productName} Real Estate Agent Data is Ready`

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 8px 0; font-size: 15px;">
      Your purchase is confirmed! Your <strong>${escapeHtml(productName)}</strong> real estate agent data is ready for download.
    </p>

    ${primaryButton(downloadUrl, `Download Your ${fileFormat}`)}

    <p style="color: #dc2626; font-weight: 600; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
      This link expires in 48 hours and can only be used once.
    </p>

    ${infoBox(`
      <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px; color: #1e3a5f;">What's included:</p>
      <table style="width: 100%; font-size: 14px; color: #334155;">
        <tr><td style="padding: 3px 0;">Full Name</td></tr>
        <tr><td style="padding: 3px 0;">Email Address</td></tr>
        <tr><td style="padding: 3px 0;">Phone Number</td></tr>
        <tr><td style="padding: 3px 0;">State</td></tr>
      </table>
    `)}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      File format: ${escapeHtml(fileFormat)} (opens in Excel, Google Sheets, or any CRM)
    </p>`

  await resend.emails.send({ from: FROM_EMAIL, to, subject, html: emailLayout(body) })
}

// ── Subscription welcome email ───────────────────────────────────────

interface SendSubscriptionWelcomeParams {
  to: string
  trialEndsAt: string | null
}

export async function sendSubscriptionWelcome({
  to,
  trialEndsAt,
}: SendSubscriptionWelcomeParams) {
  const trialNote = trialEndsAt
    ? `<p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">
        Your free trial is active until <strong style="color: #1a1a1a;">${new Date(trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.
        You won't be charged until then.
      </p>`
    : ""

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">
      Welcome to <strong>USAgentLeads Pro Dashboard</strong>! Your subscription is now active.
    </p>

    ${trialNote}

    ${infoBox(`
      <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px; color: #1e3a5f;">Your Pro access includes:</p>
      <table style="width: 100%; font-size: 14px; color: #334155;">
        <tr><td style="padding: 3px 0;">Browse 500K+ verified agents in-app</td></tr>
        <tr><td style="padding: 3px 0;">Search & filter by state</td></tr>
        <tr><td style="padding: 3px 0;">Real-time updated data</td></tr>
        <tr><td style="padding: 3px 0;">Cancel anytime</td></tr>
      </table>
    `)}

    ${primaryButton("https://www.usagentleads.com/dashboard", "Go to Dashboard")}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      Manage your subscription anytime from the dashboard sidebar.
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to USAgentLeads Pro Dashboard",
    html: emailLayout(body),
  })
}

// ── Subscription cancelled email ─────────────────────────────────────

interface SendSubscriptionCancelledParams {
  to: string
  accessUntil: string | null
}

export async function sendSubscriptionCancelled({
  to,
  accessUntil,
}: SendSubscriptionCancelledParams) {
  const accessNote = accessUntil
    ? `You'll continue to have full access until <strong>${new Date(accessUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.`
    : "You'll continue to have access until the end of your current billing period."

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">
      Your USAgentLeads Pro Dashboard subscription has been cancelled.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">${accessNote}</p>

    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: #1e3a5f;">
        Changed your mind? You can resubscribe anytime from our
        <a href="https://www.usagentleads.com/pricing" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 500;">pricing page</a>.
      </p>
    `)}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      If you have feedback on how we can improve, we'd love to hear from you &mdash; just reply to this email.
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your USAgentLeads Subscription Has Been Cancelled",
    html: emailLayout(body),
  })
}

// ── Subscription renewed email ───────────────────────────────────────

interface SendSubscriptionRenewedParams {
  to: string
  nextRenewal: string | null
}

export async function sendSubscriptionRenewed({
  to,
  nextRenewal,
}: SendSubscriptionRenewedParams) {
  const renewalNote = nextRenewal
    ? `Your next renewal is on <strong>${new Date(nextRenewal).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.`
    : ""

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">
      Your USAgentLeads Pro Dashboard subscription has been renewed successfully. ${renewalNote}
    </p>

    ${primaryButton("https://www.usagentleads.com/dashboard", "Go to Dashboard")}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      Thanks for being a Pro member!
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your USAgentLeads Subscription Has Been Renewed",
    html: emailLayout(body),
  })
}

// ── Contact form email ──────────────────────────────────────────────

interface SendContactEmailParams {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: SendContactEmailParams) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">New contact form submission:</p>

    ${infoBox(`
      <table style="width: 100%; font-size: 14px; color: #334155;">
        <tr><td style="padding: 4px 0; font-weight: 600; width: 80px;">Name</td><td style="padding: 4px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Email</td><td style="padding: 4px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Subject</td><td style="padding: 4px 0;">${escapeHtml(subject || "Not specified")}</td></tr>
      </table>
    `)}

    <p style="margin: 16px 0 8px 0; font-weight: 600; font-size: 14px;">Message:</p>
    <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${escapeHtml(message)}</p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: "support@beelodev.com",
    replyTo: email,
    subject: `Contact Form: ${subject || "New Message"} — ${name}`,
    html: emailLayout(body),
  })
}

// ── Payment failed email ─────────────────────────────────────────────

interface SendPaymentFailedParams {
  to: string
}

// ── Free sample download email ────────────────────────────────────────

interface SendFreeSampleEmailParams {
  to: string
  downloadUrl: string
}

export async function sendFreeSampleEmail({
  to,
  downloadUrl,
}: SendFreeSampleEmailParams) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 8px 0; font-size: 15px;">
      Thanks for your interest in USAgentLeads! Here's your <strong>free sample</strong> of 500 verified real estate agent contacts.
    </p>

    ${primaryButton(downloadUrl, "Download Free Sample (CSV)")}

    <p style="color: #dc2626; font-weight: 600; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
      This link expires in 7 days.
    </p>

    ${infoBox(`
      <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px; color: #1e3a5f;">What's included:</p>
      <table style="width: 100%; font-size: 14px; color: #334155;">
        <tr><td style="padding: 3px 0;">500 verified agent records</td></tr>
        <tr><td style="padding: 3px 0;">Full Name, Email, Phone, State</td></tr>
        <tr><td style="padding: 3px 0;">Ready for Excel, Google Sheets, or any CRM</td></tr>
      </table>
    `)}

    <p style="margin: 0 0 8px 0; font-size: 15px;">
      Want access to our <strong>full database of 500K+ agents</strong>?
    </p>

    ${primaryButton("https://www.usagentleads.com/pricing", "View Pricing Plans")}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      Questions? Reply to this email and we'll be happy to help.
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your Free Sample — 500 Real Estate Agent Contacts",
    html: emailLayout(body),
  })
}

// ── Payment failed email ─────────────────────────────────────────────

export async function sendPaymentFailed({ to }: SendPaymentFailedParams) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15px;">Hi there,</p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">
      We were unable to process your latest payment for the USAgentLeads Pro Dashboard subscription.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 15px;">
      Please update your payment method to avoid losing access to your dashboard.
    </p>

    ${primaryButton("https://app.lemonsqueezy.com/my-orders", "Update Payment Method")}

    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Important:</strong> If payment isn't resolved, your subscription will be paused and you'll lose dashboard access.
      </p>
    `)}

    <p style="color: #64748b; font-size: 13px; margin: 0;">
      If you believe this is an error, reply to this email and we'll help sort it out.
    </p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Action Required: Payment Failed for USAgentLeads",
    html: emailLayout(body),
  })
}
