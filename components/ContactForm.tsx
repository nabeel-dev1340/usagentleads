"use client"

import { useState } from "react"
import { CustomSelect } from "@/components/ui/CustomSelect"

const subjectOptions = [
  { value: "pricing", label: "Pricing & Plans" },
  { value: "data-quality", label: "Data Quality" },
  { value: "bulk", label: "Bulk / Custom Orders" },
  { value: "technical", label: "Technical Support" },
  { value: "partnership", label: "Partnership Inquiry" },
  { value: "other", label: "Other" },
]

export function ContactForm() {
  const [subject, setSubject] = useState("")

  return (
    <form
      action="https://formsubmit.co/support@beelodev.com"
      method="POST"
      className="space-y-5"
    >
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" />
      {/* Disable captcha page */}
      <input type="hidden" name="_captcha" value="false" />
      {/* Redirect back */}
      <input type="hidden" name="_next" value="https://www.usagentleads.com/contact?sent=true" />
      {/* Hidden input to submit CustomSelect value */}
      <input type="hidden" name="subject" value={subject} />

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
        <label className="block text-[14px] font-medium text-ink mb-1.5">
          Subject
        </label>
        <CustomSelect
          value={subject}
          options={subjectOptions}
          onChange={setSubject}
          placeholder="Select a topic"
          aria-label="Subject"
        />
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
  )
}
