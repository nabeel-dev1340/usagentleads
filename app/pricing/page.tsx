import type { Metadata } from "next"
import Link from "next/link"
import { Check, X, Minus, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react"
import { BuyFullDBButton } from "@/components/checkout/BuyFullDBButton"
import { SubscribeButton } from "@/components/checkout/SubscribeButton"
import { getTotalCount } from "@/lib/supabase/server"
import { formatAgentCount } from "@/lib/utils/states"
import { generateBreadcrumbSchema } from "@/lib/utils/seo"

const pricingProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "USAgentLeads Real Estate Agent Database",
  description: "Complete US real estate agent contact database with 553,778+ verified contacts across all 50 states",
  brand: { "@type": "Brand", name: "USAgentLeads" },
  offers: [
    {
      "@type": "Offer",
      name: "State Pack",
      price: "10.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/states",
    },
    {
      "@type": "Offer",
      name: "Full Database",
      price: "99.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro Dashboard",
      price: "49.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro API",
      price: "79.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
    },
  ],
}

export const metadata: Metadata = {
  title: "Pricing | Real Estate Agent Database from $10/State",
  description:
    "Get verified real estate agent contact data starting at $10 per state or $99 for all 50 states. 553K+ contacts with instant CSV delivery. No subscription required.",
  alternates: {
    canonical: "https://www.usagentleads.com/pricing",
    languages: {
      "en-US": "https://www.usagentleads.com/pricing",
      "x-default": "https://www.usagentleads.com/pricing",
    },
  },
  openGraph: {
    title: "Pricing | Real Estate Agent Database from $10/State | USAgentLeads",
    description:
      "Get verified real estate agent contact data starting at $10 per state or $99 for all 50 states. 553K+ contacts with instant CSV delivery. No subscription required.",
    url: "https://www.usagentleads.com/pricing",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Real Estate Agent Database from $10/State",
    description: "Verified real estate agent contact data starting at $10 per state or $99 for all 50 states. Instant CSV delivery.",
    images: ["https://www.usagentleads.com/twitter-image"],
  },
}

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
        { text: countLabel, included: true },
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
      trial: "3-day free trial",
      features: [
        { text: "Browse all agents in-app", included: true },
        { text: "Search & filter by state", included: true },
        { text: "Real-time data access", included: true },
        { text: "Cancel anytime", included: true },
        { text: "3-day free trial included", included: true },
      ] as Feature[],
      cta: "subscribe",
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
      cta: "subscribe_api",
      href: "/pricing",
      highlighted: false,
    },
  ]
}

const comparisonRows = [
  { label: "Price", state: "$10/state", full: "$99", pro: "$49/mo", proApi: "$79/mo" },
  { label: "All 50 states", state: false, full: true, pro: false, proApi: false },
  { label: "CSV download", state: true, full: true, pro: false, proApi: false },
  { label: "Dashboard access", state: false, full: false, pro: true, proApi: true },
  { label: "Search & filter", state: false, full: false, pro: true, proApi: true },
  { label: "API access", state: false, full: false, pro: false, proApi: true },
  { label: "API requests/mo", state: false, full: false, pro: false, proApi: "10,000" },
  { label: "Trial API requests", state: false, full: false, pro: false, proApi: "100" },
  { label: "Account required", state: false, full: false, pro: "Email", proApi: "Email" },
  { label: "Delivery", state: "Email CSV", full: "Email CSV", pro: "Instant", proApi: "Instant" },
]

function renderCell(val: boolean | string) {
  if (val === true) return <Check size={15} className="text-success mx-auto" />
  if (val === false) return <Minus size={15} className="text-muted mx-auto" />
  return <span className="font-mono text-[14px] text-ink">{val}</span>
}

export default async function PricingPage() {
  const totalCount = await getTotalCount()
  const plans = getPlans(totalCount)

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "Pricing", url: "https://www.usagentleads.com/pricing" },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([pricingProductSchema, breadcrumb]) }}
      />
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-28 max-sm:py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-tertiary mb-10 -mt-12">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight size={14} className="text-muted" />
          <span className="text-ink font-medium">Pricing</span>
        </nav>

        {/* Header */}
        <div className="section-header text-center flex flex-col items-center mb-16">
          <p className="label-eyebrow">Pricing</p>
          <h1 className="section-heading">Simple, Transparent Pricing</h1>
          <p className="section-sub max-w-xl">
            No hidden fees. No subscriptions required for CSV purchases.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 flex flex-col rounded-xl transition-all duration-200 ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-[0_8px_40px_rgba(29,78,216,0.12),0_2px_8px_rgba(29,78,216,0.08)] hover:-translate-y-0.5"
                  : "card hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
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

              <div className="mt-6">
                {plan.name === "State Pack" && (
                  <Link href="/states" className="btn-outline w-full justify-center text-[14px]">
                    Browse States <ArrowRight size={13} />
                  </Link>
                )}
                {plan.name === "Full Database" && (
                  <BuyFullDBButton className="w-full" />
                )}
                {plan.name === "Pro Dashboard" && (
                  <SubscribeButton className="w-full" />
                )}
                {plan.name === "Pro API" && (
                  <SubscribeButton
                    className="w-full"
                    purchaseType="subscription_api"
                    label="Subscribe"
                  />
                )}
              </div>
            </div>
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

        {/* Comparison table */}
        <div className="mt-20 max-w-4xl mx-auto card overflow-hidden overflow-x-auto">
          <table className="data-table min-w-120">
            <thead>
              <tr>
                <th className="text-left">Feature</th>
                <th className="text-center">State Pack</th>
                <th className="text-center bg-accent-light/50">Full Database</th>
                <th className="text-center">Pro Dashboard</th>
                <th className="text-center">Pro API</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="text-[14px] text-ink font-medium">{row.label}</td>
                  <td className="text-center">{renderCell(row.state)}</td>
                  <td className="text-center bg-accent-light/30">{renderCell(row.full)}</td>
                  <td className="text-center">{renderCell(row.pro)}</td>
                  <td className="text-center">{renderCell(row.proApi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  )
}
