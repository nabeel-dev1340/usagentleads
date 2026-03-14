"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

interface StateFAQProps {
  faqs: { question: string; answer: string }[]
}

export function StateFAQ({ faqs }: StateFAQProps) {
  return (
    <div className="border border-border rounded-xl bg-white divide-y divide-border overflow-hidden">
      {faqs.map((faq, i) => (
        <FAQItem key={i} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <span className="text-[15px] font-medium text-ink group-hover:text-accent transition-colors pr-8">
          {question}
        </span>
        <span className={`text-accent transition-transform duration-200 shrink-0 ${open ? "rotate-45" : "rotate-0"}`}>
          <Plus size={16} strokeWidth={2.5} />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-40 pb-4" : "max-h-0"
        }`}
      >
        <p className="text-[14px] text-tertiary leading-[1.8] px-5">{answer}</p>
      </div>
    </div>
  )
}
