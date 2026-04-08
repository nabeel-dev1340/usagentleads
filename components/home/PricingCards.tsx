"use client"

import Link from "next/link"
import { Check, X, ArrowRight, ShieldCheck } from "lucide-react"
import { formatAgentCount } from "@/lib/utils/states"

interface Feature {
  text: string
  included: boolean
}

function getPlans(totalCount: number) {
  const countLabel = totalCount > 0 ? `${formatAgentCount(totalCount)} verified contacts` : "500K+ verified contacts"
  return [
    {
      name: "State Pack",
      subtitle: "One-time purchase",
      price: "$49",
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
      price: "$149",
      period: "/ one-time",
      badge: "BEST VALUE",
      features: [
        { text: "All 50 states in one CSV", included: true },
        { text: countLabel, included: true },
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
      trial: "3-day free trial",
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
    {
      name: "Pro API",
      subtitle: "Monthly subscription",
      price: "$79",
      period: "/ month",
      trial: "3-day free trial",
      features: [
        { text: "Everything in Pro Dashboard", included: true },
        { text: "REST API access", included: true },
        { text: "10,000 API requests/month", included: true },
        { text: "100 requests during trial", included: true },
        { text: "API key management & analytics", included: true },
      ] as Feature[],
      cta: "Subscribe",
      href: "/pricing",
      highlighted: false,
    },
  ]
}

export function PricingCards({ totalCount }: { totalCount: number }) {
  const plans = getPlans(totalCount)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto items-stretch reveal-stagger">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative p-6 flex flex-col rounded-xl transition-all duration-200 ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-[0_8px_40px_rgba(29,78,216,0.12),0_2px_8px_rgba(29,78,216,0.08)] hover:-translate-y-0.5"
                  : "bg-white border border-border rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-white font-mono text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-b-lg shadow-sm">
                    {plan.badge}
                  </div>
                </div>
              )}

              <p className={`text-[14px] font-medium text-body mb-0.5 ${plan.badge ? "mt-3" : ""}`}>
                {plan.name}
              </p>
              <p className="text-[12px] font-mono text-tertiary mb-5">{plan.subtitle}</p>

              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="font-mono text-[32px] sm:text-[40px] font-semibold text-ink leading-none">
                  {plan.price}
                </span>
                <span className="text-tertiary text-[14px]">{plan.period}</span>
              </div>
              {"trial" in plan && plan.trial ? (
                <p className="text-[12px] font-medium text-accent mb-5">{plan.trial}</p>
              ) : (
                <div className="mb-5" />
              )}

              <div className="h-px bg-border mb-6" />

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-[14px]">
                    {f.included ? (
                      <Check size={15} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <X size={15} className="text-muted shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-body" : "text-muted line-through decoration-muted/50"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full justify-center mt-6 text-[14px] ${
                  plan.highlighted ? "btn-primary" : "btn-outline"
                }`}
              >
                {plan.cta} <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-bg border border-success/20 text-[14px] text-success font-medium">
            <ShieldCheck size={16} />
            30-Day Money-Back Guarantee
          </div>
          <p className="text-[14px] text-tertiary">
            Payments processed by Lemon Squeezy &middot; SSL encrypted &middot; Instant delivery
          </p>
        </div>
      </div>
    </section>
  )
}
