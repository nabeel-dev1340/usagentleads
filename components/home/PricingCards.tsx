"use client"

import Link from "next/link"
import { Check, X, ArrowRight, ShieldCheck } from "lucide-react"

interface Feature {
  text: string
  included: boolean
}

const plans = [
  {
    name: "State Pack",
    subtitle: "One-time purchase",
    price: "$20",
    period: "/ state",
    features: [
      { text: "Single state CSV download", included: true },
      { text: "Name, email, phone, state", included: true },
      { text: "Instant delivery via email", included: true },
      { text: "No account required", included: true },
      { text: "Dashboard access", included: false },
    ] as Feature[],
    cta: "Browse States",
    href: "/states",
    highlighted: false,
  },
  {
    name: "Full Database",
    subtitle: "One-time purchase",
    price: "$100",
    period: "/ one-time",
    badge: "BEST VALUE",
    features: [
      { text: "All 50 states in one CSV", included: true },
      { text: "500K+ verified contacts", included: true },
      { text: "Instant delivery via email", included: true },
      { text: "No account required", included: true },
      { text: "Dashboard access", included: false },
    ] as Feature[],
    cta: "Buy Full Database",
    href: "/pricing",
    highlighted: true,
  },
  {
    name: "Pro Dashboard",
    subtitle: "Monthly subscription",
    price: "$49",
    period: "/ month",
    features: [
      { text: "Browse all agents in-app", included: true },
      { text: "Search & filter by state", included: true },
      { text: "Real-time data access", included: true },
      { text: "Cancel anytime", included: true },
      { text: "Google Sign In required", included: true },
    ] as Feature[],
    cta: "Subscribe",
    href: "/pricing",
    highlighted: false,
  },
]

export function PricingCards() {
  return (
    <section className="bg-page py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">Pricing</p>
          <h2 className="section-heading">Simple, Transparent Pricing</h2>
          <p className="section-sub max-w-xl">
            No hidden fees. No subscriptions required for CSV purchases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start reveal-stagger">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 flex flex-col rounded-xl transition-all duration-200 ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-[0_8px_40px_rgba(29,78,216,0.12),0_2px_8px_rgba(29,78,216,0.08)] scale-[1.02] max-sm:scale-100 hover:-translate-y-0.5"
                  : "bg-white border border-border rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-white font-mono text-[12px] font-semibold tracking-wider uppercase px-4 py-1.5 rounded-b-lg shadow-sm">
                    {plan.badge}
                  </div>
                </div>
              )}

              <p className={`text-[15px] font-medium text-body mb-1 ${plan.badge ? "mt-4" : ""}`}>
                {plan.name}
              </p>
              <p className="text-[13px] font-mono text-tertiary mb-6">{plan.subtitle}</p>

              <div className="flex items-baseline gap-1.5 mb-8">
                <span className="font-mono text-[52px] font-semibold text-ink leading-none">
                  {plan.price}
                </span>
                <span className="text-tertiary text-[15px]">{plan.period}</span>
              </div>

              <div className="h-px bg-border mb-8" />

              <ul className="space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-[15px]">
                    {f.included ? (
                      <Check size={16} className="text-success shrink-0" />
                    ) : (
                      <X size={16} className="text-muted shrink-0" />
                    )}
                    <span className={f.included ? "text-body" : "text-muted line-through decoration-muted/50"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full justify-center mt-8 ${
                  plan.highlighted ? "btn-primary text-[15px]" : "btn-outline"
                }`}
              >
                {plan.cta} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-[14px] text-tertiary">
          <ShieldCheck size={16} className="text-tertiary" />
          Payments processed by Lemon Squeezy &middot; SSL encrypted &middot; Instant delivery
        </div>
      </div>
    </section>
  )
}
