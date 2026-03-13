"use client"

import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"

const previewRows = [
  { name: "James Harrington", email: "james@harrington-realty.com", phone: "(305) 881-2244", state: "FL" },
  { name: "Sarah Chen", email: "sarah.chen@kw.com", phone: "(512) 447-9801", state: "TX" },
  { name: "Michael Rivera", email: "mrivera@homes.co", phone: "(213) 556-1102", state: "CA" },
  { name: "Emily Thompson", email: "emily.t@sold.net", phone: "(404) 223-8877", state: "GA" },
]

export function HeroSection() {
  return (
    <section className="relative bg-page min-h-[88vh] flex flex-col items-center justify-center px-6 pb-20 pt-10 overflow-hidden">
      {/* Subtle editorial lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            top: "35%",
            background: "linear-gradient(to right, transparent, #E2E5EB 20%, #E2E5EB 80%, transparent)",
          }}
        />
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            top: "65%",
            background: "linear-gradient(to right, transparent, #E2E5EB 20%, #E2E5EB 80%, transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[780px] text-center">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-border shadow-sm text-[14px] mb-10">
          <span className="flex items-center gap-1.5 text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live Data
          </span>
          <span className="text-border-strong">|</span>
          <span className="font-mono text-ink font-medium">500,000+</span>
          <span className="text-tertiary">Contacts</span>
          <span className="text-border-strong">|</span>
          <span className="text-tertiary">Updated 2026</span>
        </div>

        {/* H1 */}
        <h1 className="hero-h1">
          <span className="block text-tertiary font-light text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.05] tracking-[-0.025em]">
            The Complete US
          </span>
          <span className="block text-ink font-semibold text-[48px] sm:text-[60px] lg:text-[72px] leading-[1.0] tracking-[-0.03em]">
            Real Estate Agent Database
          </span>
        </h1>

        {/* Subheadline */}
        <p className="hero-sub text-[18px] text-tertiary mt-6 leading-relaxed">
          <span className="text-ink font-medium">Name</span>
          <span className="text-accent mx-2 font-bold">&middot;</span>
          <span className="text-ink font-medium">Email</span>
          <span className="text-accent mx-2 font-bold">&middot;</span>
          <span className="text-ink font-medium">Phone</span>
          <span className="text-accent mx-2 font-bold">&middot;</span>
          <span className="text-ink font-medium">State</span>
          <span className="text-muted mx-3">&mdash;</span>
          Clean CSV. Instant delivery. No account needed.
        </p>

        {/* CTAs */}
        <div className="hero-ctas mt-10 flex gap-3 justify-center flex-wrap">
          <Link href="/states" className="btn-primary text-[16px] px-8 py-3.5">
            Browse by State <ArrowRight size={16} />
          </Link>
          <Link href="/pricing" className="btn-outline text-[16px] px-8 py-3.5">
            Get Full Database — <span className="font-mono">$100</span>
          </Link>
        </div>

        {/* Trust note */}
        <p className="mt-4 text-[14px] text-tertiary hero-sub">
          Trusted by 1,200+ marketers, agencies &amp; lenders
        </p>

        {/* Data preview card */}
        <div className="hero-preview mt-16 bg-white border border-border rounded-2xl shadow-xl overflow-hidden max-w-[700px] mx-auto">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-subtle">
            <span className="text-[13px] font-mono font-medium text-tertiary uppercase tracking-wider">
              Sample Data — First 4 Records
            </span>
            <span className="badge-state">Preview</span>
          </div>

          {/* Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th className="hidden sm:table-cell">Phone</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr
                  key={i}
                  className={i > 0 ? "[&_td]:blur-[3px] [&_td]:select-none pointer-events-none" : ""}
                >
                  <td className="cell-name">{row.name}</td>
                  <td className="cell-email">{row.email}</td>
                  <td className="cell-phone hidden sm:table-cell">{row.phone}</td>
                  <td><span className="badge-state">{row.state}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 bg-accent-light border-t border-accent-mid">
            <Lock size={14} className="text-accent" />
            <span className="text-[14px] text-accent font-medium">
              Purchase to access the full database
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
