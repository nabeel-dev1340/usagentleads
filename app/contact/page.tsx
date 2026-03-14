import type { Metadata } from "next"
import { Mail, MessageSquare, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with USAgentLeads. Questions about our real estate agent database, pricing, or data quality? We're here to help.",
  alternates: {
    canonical: "https://usagentleads.com/contact",
    languages: {
      "en-US": "https://usagentleads.com/contact",
      "x-default": "https://usagentleads.com/contact",
    },
  },
  openGraph: {
    title: "Contact Us | USAgentLeads",
    description:
      "Get in touch with USAgentLeads. Questions about our real estate agent database, pricing, or data quality?",
    url: "https://usagentleads.com/contact",
  },
}

export default function ContactPage() {
  return (
    <div className="bg-page min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-28 max-sm:py-16 sm:px-6">
        {/* Header */}
        <div className="section-header text-center flex flex-col items-center mb-14">
          <p className="label-eyebrow">Contact</p>
          <h1 className="section-heading">Get in Touch</h1>
          <p className="section-sub max-w-lg">
            Have a question about our data, pricing, or need a custom solution? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {[
            {
              icon: Mail,
              title: "Email Us",
              detail: "support@usagentleads.com",
              sub: "We reply within 24 hours",
            },
            {
              icon: MessageSquare,
              title: "General Inquiries",
              detail: "Sales & partnerships",
              sub: "Bulk pricing available",
            },
            {
              icon: Clock,
              title: "Response Time",
              detail: "< 24 hours",
              sub: "Mon – Fri, 9am – 6pm EST",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent-light border border-accent-mid flex items-center justify-center mx-auto mb-4">
                <item.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink mb-1">{item.title}</h3>
              <p className="text-[14px] font-medium text-accent mb-0.5">{item.detail}</p>
              <p className="text-[13px] text-tertiary">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="card p-7 sm:p-10">
          <h2 className="text-[20px] font-semibold text-ink mb-1">Send Us a Message</h2>
          <p className="text-[14px] text-tertiary mb-8">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>

          <form
            action="https://formsubmit.co/support@usagentleads.com"
            method="POST"
            className="space-y-5"
          >
            {/* Honeypot */}
            <input type="text" name="_honey" className="hidden" />
            {/* Disable captcha page */}
            <input type="hidden" name="_captcha" value="false" />
            {/* Redirect back */}
            <input type="hidden" name="_next" value="https://usagentleads.com/contact?sent=true" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-[14px] font-medium text-ink mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[14px] font-medium text-ink mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-[14px] font-medium text-ink mb-1.5">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="input"
                defaultValue=""
              >
                <option value="" disabled>Select a topic</option>
                <option value="pricing">Pricing & Plans</option>
                <option value="data-quality">Data Quality</option>
                <option value="bulk">Bulk / Custom Orders</option>
                <option value="technical">Technical Support</option>
                <option value="partnership">Partnership Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-[14px] font-medium text-ink mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="How can we help?"
                className="input resize-none"
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center text-[15px]">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
