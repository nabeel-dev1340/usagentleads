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
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")

    try {
      const formData = new FormData(e.currentTarget)
      const res = await fetch("/api/contact", { method: "POST", body: formData })

      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-[18px] font-semibold text-ink mb-1">Message Sent</h3>
        <p className="text-[14px] text-tertiary">We typically respond within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" />
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

      {status === "error" && (
        <p className="text-[14px] text-red-600">Something went wrong. Please try again or email us directly.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full justify-center text-[15px]"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
