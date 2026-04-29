export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { Check, X, Minus, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react"
import { BuyFullDBButton } from "@/components/checkout/BuyFullDBButton"
import { SubscribeButton } from "@/components/checkout/SubscribeButton"
import { getDatabaseTotals } from "@/lib/supabase/server"
import { formatAgentCount, TOTAL_AGENTS } from "@/lib/utils/states"
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/utils/seo"

const pricingProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "USAgentLeads Real Estate Agent Database",
  description: `Complete US real estate agent contact database with ${TOTAL_AGENTS.toLocaleString()}+ verified contacts across all 50 states`,
  image: "https://www.usagentleads.com/opengraph-image",
  brand: { "@type": "Brand", name: "USAgentLeads" },
  offers: [
    {
      "@type": "Offer",
      name: "State Pack",
      price: "49.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/states",
      priceValidUntil: "2027-12-31",
      seller: { "@type": "Organization", name: "USAgentLeads" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    {
      "@type": "Offer",
      name: "Full Database",
      price: "149.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
      priceValidUntil: "2027-12-31",
      seller: { "@type": "Organization", name: "USAgentLeads" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    {
      "@type": "Offer",
      name: "Pro Dashboard",
      price: "49.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
      priceValidUntil: "2027-12-31",
      seller: { "@type": "Organization", name: "USAgentLeads" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    {
      "@type": "Offer",
      name: "Pro API",
      price: "79.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.usagentleads.com/pricing",
      priceValidUntil: "2027-12-31",
      seller: { "@type": "Organization", name: "USAgentLeads" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: "0", maxValue: "0", unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  ],
}

export const metadata: Metadata = {
  title: "Pricing 2026 — Real Estate Agent Database from $49/State",
  description:
    "2026 realtor email lists from $49/state or $149 for all 50 states. 889K+ verified contacts, instant CSV delivery, no subscription. Free sample available.",
  alternates: {
    canonical: "https://www.usagentleads.com/pricing",
    languages: {
      "en-US": "https://www.usagentleads.com/pricing",
      "x-default": "https://www.usagentleads.com/pricing",
    },
  },
  openGraph: {
    title: "Pricing — Real Estate Agent Database from $49/State",
    description:
      "Realtor email lists from $49/state or $149 for all 50 states. 889K+ verified contacts, instant CSV delivery, no subscription.",
    url: "https://www.usagentleads.com/pricing",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Real Estate Agent Database from $49/State",
    description: "Verified real estate agent contact data starting at $49 per state or $149 for all 50 states. Instant CSV delivery.",
    images: ["https://www.usagentleads.com/twitter-image"],
  },
}

interface Feature {
  text: string
  included: boolean
}

interface Stat {
  value: string
  label: string
}

function formatStat(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000).toLocaleString()}K+`
  return n.toLocaleString()
}

function getPlans(totalCount: number, totalEmails: number, totalPhones: number) {
  const countLabel = totalCount > 0 ? `${formatAgentCount(totalCount)} verified contacts` : "500K+ verified contacts"
  const fullDbStats: Stat[] | undefined =
    totalCount > 0 && totalEmails > 0 && totalPhones > 0
      ? [
          { value: formatStat(totalCount), label: "Contacts" },
          { value: formatStat(totalEmails), label: "Emails" },
          { value: formatStat(totalPhones), label: "Phones" },
        ]
      : undefined
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
      stats: fullDbStats,
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
  { label: "Price", state: "$49/state", full: "$149", pro: "$49/mo", proApi: "$79/mo" },
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

const pricingFAQs = [
  {
    question: "Is there a free trial or free sample?",
    answer:
      "Yes. You can download a free sample of 50 agent contacts before purchasing. For the Pro Dashboard and Pro API plans, we offer a 3-day free trial with full access.",
  },
  {
    question: "Do I need to create an account to buy?",
    answer:
      "No. State packs and the full database are guest checkouts — just enter your email at checkout and we send the download link. The Pro Dashboard and Pro API plans require an email to create your account.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal through our payment processor, Lemon Squeezy. All transactions are SSL-encrypted.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes. All purchases come with a 30-day money-back guarantee. If the data doesn't meet your expectations, contact us for a full refund — no questions asked.",
  },
  {
    question: "How is the data delivered?",
    answer:
      "CSV purchases (State Pack and Full Database) are delivered instantly via email as a download link. Pro Dashboard and Pro API access is activated immediately after signup.",
  },
  {
    question: "What's the difference between the Full Database and Pro Dashboard?",
    answer:
      "The Full Database ($149 one-time) gives you a single CSV download of all 889K+ contacts. The Pro Dashboard ($49/month) gives you a searchable, filterable interface to browse agents in-app without downloading a file. Choose CSV if you want the data in your own tools; choose Pro if you prefer a web interface.",
  },
]

export default async function PricingPage() {
  const { count: totalCount, emails: totalEmails, phones: totalPhones } = await getDatabaseTotals()
  const plans = getPlans(totalCount, totalEmails, totalPhones)

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "Pricing", url: "https://www.usagentleads.com/pricing" },
  ])
  const faqSchema = generateFAQSchema(pricingFAQs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([pricingProductSchema, breadcrumb, faqSchema]) }}
      />
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-28 max-sm:py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-tertiary mb-10 -mt-6 sm:-mt-12">
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

              {"stats" in plan && plan.stats && (
                <div className="mb-6 rounded-lg bg-accent-light/60 border border-accent/25 px-4 py-3 space-y-1.5">
                  {plan.stats.map((stat) => (
                    <div key={stat.label} className="flex items-baseline justify-between">
                      <span className="font-mono text-[18px] font-semibold text-accent leading-tight">
                        {stat.value}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-accent/80">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

        {/* Pricing FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-[22px] font-semibold text-ink text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {pricingFAQs.map((faq) => (
              <details key={faq.question} className="group card p-5">
                <summary className="cursor-pointer text-[15px] font-semibold text-ink list-none flex items-center justify-between gap-3">
                  {faq.question}
                  <ChevronRight size={16} className="text-muted shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-[14px] text-body leading-[1.8] mt-3 pt-3 border-t border-border">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
