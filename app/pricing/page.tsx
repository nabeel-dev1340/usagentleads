import type { Metadata } from "next"
import Link from "next/link"
import { Check, X, Minus, ArrowRight, ShieldCheck } from "lucide-react"
import { BuyFullDBButton } from "@/components/checkout/BuyFullDBButton"
import { SubscribeButton } from "@/components/checkout/SubscribeButton"

export const metadata: Metadata = {
  title: "Pricing — Real Estate Agent Data Starting at $10",
  description:
    "Buy US real estate agent contact data starting at $10 per state. Full 50-state database for $99. Pro Dashboard for $49/month.",
  alternates: {
    canonical: "https://usagentleads.com/pricing",
  },
  openGraph: {
    title: "Pricing — Real Estate Agent Data Starting at $10 | USAgentLeads",
    description:
      "Buy US real estate agent contact data starting at $10 per state. Full 50-state database for $99. Pro Dashboard for $49/month.",
    url: "https://usagentleads.com/pricing",
    images: [{ url: "https://usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads — Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Real Estate Agent Data Starting at $10",
    description: "US real estate agent contact data starting at $10 per state. Full 50-state database for $99.",
    images: ["https://usagentleads.com/twitter-image"],
  },
}

interface Feature {
  text: string
  included: boolean
}

const plans = [
  {
    name: "State Pack",
    subtitle: "One-time purchase",
    price: "$10",
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
    price: "$99",
    period: "/ one-time",
    badge: "BEST VALUE",
    features: [
      { text: "All 50 states in one CSV", included: true },
      { text: "478K+ verified contacts", included: true },
      { text: "Instant delivery via email", included: true },
      { text: "No account required", included: true },
      { text: "Dashboard access", included: false },
    ] as Feature[],
    cta: "buy",
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
    cta: "subscribe",
    href: "/pricing",
    highlighted: false,
  },
]

const comparisonRows = [
  { label: "Price", state: "$10/state", full: "$99", pro: "$49/mo" },
  { label: "All 50 states", state: false, full: true, pro: false },
  { label: "CSV download", state: true, full: true, pro: false },
  { label: "Dashboard access", state: false, full: false, pro: true },
  { label: "Search & filter", state: false, full: false, pro: true },
  { label: "Account required", state: false, full: false, pro: true },
  { label: "Delivery", state: "Email CSV", full: "Email CSV", pro: "Instant" },
]

function renderCell(val: boolean | string) {
  if (val === true) return <Check size={15} className="text-success mx-auto" />
  if (val === false) return <Minus size={15} className="text-muted mx-auto" />
  return <span className="font-mono text-[14px] text-ink">{val}</span>
}

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-28 max-sm:py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header text-center flex flex-col items-center mb-16">
          <p className="label-eyebrow">Pricing</p>
          <h1 className="section-heading">Simple, Transparent Pricing</h1>
          <p className="section-sub max-w-xl">
            No hidden fees. No subscriptions required for CSV purchases.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-5 sm:p-8 flex flex-col rounded-xl transition-all duration-200 ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-[0_8px_40px_rgba(29,78,216,0.12),0_2px_8px_rgba(29,78,216,0.08)] scale-[1.02] max-sm:scale-100 hover:-translate-y-0.5"
                  : "card hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
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
                <span className="font-mono text-[36px] sm:text-[52px] font-semibold text-ink leading-none">
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

              <div className="mt-8">
                {plan.name === "State Pack" && (
                  <Link href="/states" className="btn-outline w-full justify-center">
                    Browse States <ArrowRight size={14} />
                  </Link>
                )}
                {plan.name === "Full Database" && (
                  <BuyFullDBButton className="w-full" />
                )}
                {plan.name === "Pro Dashboard" && (
                  <SubscribeButton className="w-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-[14px] text-tertiary">
          <ShieldCheck size={16} className="text-tertiary" />
          Payments processed by Lemon Squeezy &middot; SSL encrypted &middot; Instant delivery
        </div>

        {/* Comparison table */}
        <div className="mt-20 max-w-3xl mx-auto card overflow-hidden overflow-x-auto">
          <table className="data-table min-w-120">
            <thead>
              <tr>
                <th className="text-left">Feature</th>
                <th className="text-center">State Pack</th>
                <th className="text-center bg-accent-light/50">Full Database</th>
                <th className="text-center">Pro Dashboard</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="text-[14px] text-ink font-medium">{row.label}</td>
                  <td className="text-center">{renderCell(row.state)}</td>
                  <td className="text-center bg-accent-light/30">{renderCell(row.full)}</td>
                  <td className="text-center">{renderCell(row.pro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
