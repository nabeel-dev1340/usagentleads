"use client"

import Link from "next/link"
import { US_STATES, formatAgentCount } from "@/lib/utils/states"

export function StatsCTA() {
  return (
    <section className="bg-subtle py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header">
          <p className="label-eyebrow">Coverage</p>
          <h2 className="section-heading">Every State. Every Agent.</h2>
          <p className="section-sub">500,000+ verified contacts across all 50 US states.</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 max-w-5xl mx-auto reveal-stagger">
          {US_STATES.map((state) => (
            <Link
              key={state.code}
              href={`/states/${state.slug}`}
              className="group bg-white border border-border rounded-lg p-3
                         hover:border-accent hover:bg-accent-light
                         hover:-translate-y-0.5 hover:shadow-sm
                         transition-all duration-150 cursor-pointer text-center"
            >
              <span className="block font-mono text-[14px] font-semibold text-ink group-hover:text-accent transition-colors">
                {state.code}
              </span>
              <span className="block font-mono text-[12px] text-tertiary mt-0.5">
                ~{formatAgentCount(state.agentCount)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
