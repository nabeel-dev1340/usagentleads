export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Check, Database, Shield, Zap } from "lucide-react"
import { StateGrid } from "@/components/states/StateGrid"
import { createServiceClient } from "@/lib/supabase/server"
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/utils/seo"
import { TOTAL_AGENTS, US_STATES } from "@/lib/utils/states"

export const metadata: Metadata = {
  title: { absolute: "Real Estate Agent Email Lists by State: 50 States" },
  description:
    "Buy verified real estate agent email lists by state. CSV files with realtor names, emails, and phone numbers for all 50 US states from $49.",
  alternates: {
    canonical: "https://www.usagentleads.com/states",
    languages: {
      "en-US": "https://www.usagentleads.com/states",
      "x-default": "https://www.usagentleads.com/states",
    },
  },
  openGraph: {
    title: "Real Estate Agent Email Lists by State: 50 States",
    description: "Browse verified realtor email lists for every US state. CSV files with names, emails, and phone numbers from $49/state.",
    url: "https://www.usagentleads.com/states",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Agent Email Lists by State: 50 States",
    description: "Browse verified realtor email lists for every US state from $49/state.",
    images: ["https://www.usagentleads.com/twitter-image"],
  },
}

const statesFAQs = [
  {
    question: "What data fields are included in each state pack?",
    answer: "Every state CSV includes full name, email address, phone number, and state for each licensed real estate agent. Records are sourced from official state real estate licensing boards.",
  },
  {
    question: "How is the agent data sourced and verified?",
    answer: "All contacts are sourced from publicly available state real estate licensing board records — the same registries that regulators use to track active licenses. We run regular verification passes to maintain deliverability above 90%.",
  },
  {
    question: "What's the difference between a state pack and the full database?",
    answer: "A state pack ($49) gives you a CSV for a single state. The Full Database ($149, one-time) includes all 50 states in a single download — 889,000+ contacts. If you need 4+ states, the full database is better value.",
  },
  {
    question: "How quickly is the CSV delivered after purchase?",
    answer: "Instantly. After checkout, a download link is emailed to you within seconds. No waiting for manual fulfillment — available 24/7.",
  },
  {
    question: "Can I import the CSV into my CRM?",
    answer: "Yes. The CSV format is compatible with all major CRMs including HubSpot, Salesforce, GoHighLevel, ActiveCampaign, and Mailchimp. The columns — name, email, phone, state — map directly to standard contact fields.",
  },
]

export default async function StatesPage() {
  const supabase = createServiceClient()
  const { data: stateCounts } = await supabase
    .schema("usagentleads")
    .from("state_count")
    .select("state, count")

  const countMap: Record<string, number> = {}
  if (stateCounts) {
    for (const row of stateCounts) {
      countMap[row.state] = row.count
    }
  }
  const totalContacts = stateCounts?.length
    ? stateCounts.reduce((sum, row) => sum + row.count, 0)
    : TOTAL_AGENTS

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "States", url: "https://www.usagentleads.com/states" },
  ])

  const faqSchema = generateFAQSchema(statesFAQs)

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Real Estate Agent Email Lists by State",
    description: "Verified real estate agent contact databases for all 50 US states — instant CSV download.",
    numberOfItems: US_STATES.length,
    itemListElement: US_STATES.map((state, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${state.name} Realtor Email List`,
      url: `https://www.usagentleads.com/states/${state.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, itemList, faqSchema]) }}
      />
    <div className="bg-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight size={14} className="text-muted" />
          <span className="text-ink font-medium">States</span>
        </nav>

        <header className="pb-10 border-b border-border">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="label-eyebrow mb-3">50 States Available</p>
              <h1 className="section-heading max-w-3xl">Real Estate Agent Email Lists by State</h1>
              <p className="section-sub mt-4 max-w-2xl">
                Pick a state pack and download a clean CSV with licensed realtor names, email addresses, phone numbers, and state fields. Every card below follows the same format, price, and delivery model.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              {[
                { value: US_STATES.length.toString(), label: "States" },
                { value: totalContacts.toLocaleString(), label: "Contacts" },
                { value: "$49", label: "Per State" },
              ].map((stat) => (
                <div key={stat.label} className="border-r border-border px-3 py-4 text-center last:border-r-0">
                  <p className="font-mono text-[18px] font-semibold leading-tight text-ink sm:text-[22px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Same CSV fields in every pack",
            "Instant delivery",
            "Full database: $149",
          ].map((item, i) => (
            <div key={item} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-body">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent-light font-mono text-[11px] font-semibold text-accent">
                {i + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <StateGrid countMap={countMap} />

        {/* What's included */}
        <section className="mt-20 border-t border-border pt-16">
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-semibold text-ink mb-6">What&apos;s in Each State Pack</h2>
            <p className="text-[15px] text-body leading-[1.8] mb-8">
              Every state CSV download contains the same four verified fields for each licensed real estate agent in that state. No fluff, no filler — just the contact data you need for outreach.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { label: "Full Name", detail: "The agent's registered legal name as it appears on their license" },
                { label: "Email Address", detail: "Verified professional email — 90%+ deliverability rate" },
                { label: "Phone Number", detail: "Direct phone number where available" },
                { label: "State", detail: "The state where the agent holds an active license" },
              ].map((field) => (
                <div key={field.label} className="card p-5 flex gap-3">
                  <Check size={16} className="text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{field.label}</p>
                    <p className="text-[13px] text-tertiary mt-0.5 leading-relaxed">{field.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-tertiary">
              Files are delivered as clean UTF-8 CSVs — ready to import into HubSpot, Salesforce, GoHighLevel, Mailchimp, or any email platform.{" "}
              <Link href="/pricing" className="text-accent font-medium hover:underline">
                Need all 50 states? Get the Full Database for $149 →
              </Link>
            </p>
          </div>
        </section>

        {/* How data is sourced */}
        <section className="mt-16 border-t border-border pt-16">
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-semibold text-ink mb-6">How We Source the Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: Database,
                  title: "State Licensing Boards",
                  body: "Every contact is sourced from official state real estate commission and licensing board records — the same public registries regulators use to track active licenses.",
                },
                {
                  icon: Shield,
                  title: "Verified & Deduplicated",
                  body: "Raw licensing data is cleaned, deduplicated, and standardized into a consistent format. We run regular verification passes to maintain 90%+ deliverability.",
                },
                {
                  icon: Zap,
                  title: "Instant CSV Delivery",
                  body: "After checkout, a download link arrives in your inbox within seconds. No manual fulfillment, no delays — available 24/7.",
                },
              ].map((item) => (
                <div key={item.title} className="card p-5">
                  <div className="w-9 h-9 rounded-xl bg-accent-light border border-accent-mid flex items-center justify-center mb-3">
                    <item.icon size={18} className="text-accent" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-ink mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-body leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 border-t border-border pt-16 pb-20">
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-semibold text-ink mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {statesFAQs.map((faq) => (
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
        </section>
      </div>
    </div>
    </>
  )
}
