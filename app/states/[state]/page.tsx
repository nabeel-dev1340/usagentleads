import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { US_STATES, getStateBySlug, formatAgentCount } from "@/lib/utils/states"
import { generateStateMetadata, generateBreadcrumbSchema, generateProductSchema, generateDatasetSchema, generateFAQSchema } from "@/lib/utils/seo"
import { getStateContent, getStateFAQs } from "@/lib/utils/state-content"
import { getStateSampleContact } from "@/lib/utils/state-sample-contacts"
import { getAllPosts } from "@/lib/blog"
import { STATE_NEIGHBORS } from "@/lib/utils/state-neighbors"
import { BuyStateButton } from "@/components/checkout/BuyStateButton"
import { StateFAQ } from "@/components/states/StateFAQ"
import { ChevronRight, Check, Lock, ShieldCheck } from "lucide-react"
import { createServiceClient } from "@/lib/supabase/server"

export const revalidate = 86400

interface Props {
  params: Promise<{ state: string }>
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params
  const state = getStateBySlug(slug)
  if (!state) return {}
  const content = getStateContent(slug)
  return generateStateMetadata(state, content?.cities)
}

const blurredFillerRows = [
  { name: "Sarah Chen", email: "sarah.chen@kw.com", phone: "(512) 447-9801" },
  { name: "Michael Rivera", email: "mrivera@homes.co", phone: "(213) 556-1102" },
  { name: "Emily Thompson", email: "emily.t@sold.net", phone: "(404) 223-8877" },
]

export default async function StatePage({ params }: Props) {
  const { state: slug } = await params
  const state = getStateBySlug(slug)
  if (!state) notFound()

  // Fetch real count from DB
  const supabase = createServiceClient()
  const { data: stateCountRow } = await supabase
    .schema("usagentleads")
    .from("state_count")
    .select("count, total_emails, total_phones")
    .eq("state", state.name)
    .single()

  const agentCount: number = stateCountRow?.count ?? state.agentCount
  const totalEmails: number = stateCountRow?.total_emails ?? agentCount
  const totalPhones: number = stateCountRow?.total_phones ?? 0

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "States", url: "https://www.usagentleads.com/states" },
    { name: state.name, url: `https://www.usagentleads.com/states/${state.slug}` },
  ])
  const product = generateProductSchema(state, agentCount)
  const dataset = generateDatasetSchema(state, agentCount)

  const stateContent = getStateContent(slug)
  const previewContact = getStateSampleContact(slug) ?? blurredFillerRows[0]
  const sampleData = [previewContact, ...blurredFillerRows]
  const faqs = getStateFAQs(state, agentCount)
  const faqSchema = generateFAQSchema(faqs)

  // Related blog guides — use state-specific slugs if defined, else fallback defaults
  const defaultGuides = ["how-to-build-realtor-email-list", "real-estate-cold-email-templates"]
  const guideSlugs = stateContent?.relatedBlogSlugs ?? defaultGuides
  const allPosts = getAllPosts()
  const relatedGuides = guideSlugs
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter(Boolean)
    .map((p) => ({ slug: p!.slug, title: p!.title }))

  // Geographic neighbors (fallback to alphabetical if not mapped)
  const neighborSlugs = STATE_NEIGHBORS[slug]
  const neighbors = neighborSlugs
    ? neighborSlugs.map((s) => getStateBySlug(s)).filter(Boolean) as typeof US_STATES[number][]
    : (() => {
        const idx = US_STATES.findIndex((s) => s.code === state.code)
        return [
          US_STATES[(idx - 1 + US_STATES.length) % US_STATES.length],
          US_STATES[(idx + 1) % US_STATES.length],
          US_STATES[(idx + 2) % US_STATES.length],
          US_STATES[(idx + 3) % US_STATES.length],
        ]
      })()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, product, dataset, faqSchema]) }}
      />
      <div className="bg-page min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6 overflow-hidden">
            <Link href="/" className="hover:text-ink transition-colors shrink-0">Home</Link>
            <ChevronRight size={14} className="text-muted shrink-0" />
            <Link href="/states" className="hover:text-ink transition-colors shrink-0">States</Link>
            <ChevronRight size={14} className="text-muted shrink-0" />
            <span className="text-ink font-medium truncate">{state.name}</span>
          </nav>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start pb-20">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <p className="label-eyebrow mb-4">State Data</p>

              {/* Big state name */}
              <h1
                className="font-semibold text-ink tracking-[-0.04em] leading-[0.9] mb-5"
                style={{ fontSize: "clamp(36px, 10vw, 88px)" }}
              >
                {state.name}
                <span
                  className="block text-[clamp(16px,3vw,28px)] tracking-[-0.02em] leading-[1.3] text-tertiary font-medium mt-2"
                >
                  Real Estate Agent Email List & Database
                </span>
              </h1>

              <p className="text-[15px] sm:text-[17px] text-tertiary mb-4">
                Realtor Email List & Contact Database —{" "}
                <span className="font-mono text-ink font-semibold ml-1">
                  {agentCount.toLocaleString()}
                </span>{" "}
                verified contacts
              </p>
              <p className="text-[14px] text-body/70 mb-10">
                Download {state.name} real estate agent emails and phone numbers. The complete {state.name} realtor email database with instant CSV delivery.
              </p>

              {/* Mobile CTA */}
              <div className="lg:hidden mb-10">
                <PurchaseCard stateCode={state.code} stateName={state.name} agentCount={agentCount} />
              </div>

              {/* 4-stat strip */}
              <div className="bg-white border border-border rounded-xl p-4 sm:p-6 grid grid-cols-3 gap-0 divide-x divide-border mb-10">
                {[
                  { value: agentCount.toLocaleString(), label: "Total" },
                  { value: totalEmails.toLocaleString(), label: "Emails" },
                  { value: totalPhones.toLocaleString(), label: "Phones" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center px-1 sm:px-4">
                    <div className="font-mono text-[16px] sm:text-[28px] font-semibold text-ink leading-tight">{stat.value}</div>
                    <div className="text-[11px] sm:text-[13px] font-mono uppercase tracking-wider text-tertiary mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample data preview */}
              <div className="card overflow-hidden mb-10">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-subtle">
                  <h2 className="text-[13px] font-mono font-semibold text-tertiary uppercase tracking-wider">
                    Sample Preview
                  </h2>
                  <span className="text-[13px] text-tertiary font-mono">
                    Showing 1 of {agentCount.toLocaleString()} records
                  </span>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th className="hidden sm:table-cell">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, i) => (
                      <tr
                        key={i}
                        className={i > 0 ? "[&_td]:blur-[3px] [&_td]:select-none pointer-events-none" : ""}
                      >
                        <td className="cell-name">{row.name}</td>
                        <td className="cell-email">{row.email}</td>
                        <td className="cell-phone hidden sm:table-cell">{row.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-center gap-2 px-5 py-3.5 bg-accent-light border-t border-accent-mid">
                  <Lock size={14} className="text-accent" />
                  <span className="text-[14px] text-accent font-medium">
                    Purchase to access all {agentCount.toLocaleString()} records
                  </span>
                </div>
              </div>

              {/* About this state's data */}
              {stateContent && (
                <section className="mb-10">
                  <h2 className="text-[17px] font-semibold text-ink mb-3">
                    {state.name} Real Estate Agent Email Database
                  </h2>
                  <p className="text-[15px] text-body leading-[1.8] mb-3">
                    {stateContent.description}
                  </p>
                  {stateContent.useCase && (
                    <p className="text-[15px] text-body leading-[1.8] mb-3">
                      {stateContent.useCase}
                    </p>
                  )}
                  {stateContent.licensingBody && (
                    <p className="text-[14px] text-tertiary">
                      Licensing authority:{" "}
                      {stateContent.licensingSourceUrl ? (
                        <a
                          href={stateContent.licensingSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-accent font-medium hover:underline"
                        >
                          {stateContent.licensingBody}
                        </a>
                      ) : (
                        stateContent.licensingBody
                      )}
                    </p>
                  )}
                </section>
              )}

              {stateContent?.sourceNote && (
                <section className="mb-10">
                  <h2 className="text-[17px] font-semibold text-ink mb-3">
                    How We Source {state.name} Agent Data
                  </h2>
                  <p className="text-[15px] text-body leading-[1.8] mb-3">
                    {stateContent.sourceNote}
                  </p>
                  <p className="text-[15px] text-body leading-[1.8]">
                    USAgentLeads turns fragmented public licensing records and professional directory data into a cleaned CSV with standardized names, email addresses, phone numbers, and state fields.
                  </p>
                </section>
              )}

              {stateContent?.cityNote && (
                <section className="mb-10">
                  <h2 className="text-[17px] font-semibold text-ink mb-3">
                    Best {state.name} Cities to Target
                  </h2>
                  <p className="text-[15px] text-body leading-[1.8] mb-4">
                    {stateContent.cityNote}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stateContent.cities.map((city) => (
                      <span
                        key={city}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-[14px] text-body"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {stateContent?.whoUses?.length && (
                <section className="mb-10">
                  <h2 className="text-[17px] font-semibold text-ink mb-3">
                    Who Uses a {state.name} Realtor Email List?
                  </h2>
                  <ul className="space-y-2.5 text-[15px] text-body">
                    {stateContent.whoUses.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={15} className="text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {stateContent?.localAngles?.length && (
                <section className="mb-10">
                  <h2 className="text-[17px] font-semibold text-ink mb-3">
                    Outreach Angles for {state.name} Agents
                  </h2>
                  <div className="space-y-3">
                    {stateContent.localAngles.map((item) => (
                      <p key={item} className="text-[15px] text-body leading-[1.8] border-l-2 border-accent-mid pl-4">
                        {item}
                      </p>
                    ))}
                  </div>
                </section>
              )}

              {/* What's included */}
              <section className="mb-10">
                <h2 className="text-[17px] font-semibold text-ink mb-3">
                  What You Get in the {state.name} Agent List
                </h2>
                <p className="text-[15px] text-body mb-4">
                  Your {state.name} CSV download includes {agentCount.toLocaleString()} verified records, each containing:
                </p>
                <ul className="space-y-2.5 text-[15px] text-body">
                  <li className="flex items-start gap-2.5">
                    <Check size={15} className="text-success shrink-0 mt-0.5" />
                    <span><strong>Full Name</strong> — the agent&apos;s registered legal name</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={15} className="text-success shrink-0 mt-0.5" />
                    <span><strong>Email Address</strong> — {totalEmails.toLocaleString()} verified professional emails</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={15} className="text-success shrink-0 mt-0.5" />
                    <span><strong>Phone Number</strong> — {totalPhones.toLocaleString()} direct phone numbers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={15} className="text-success shrink-0 mt-0.5" />
                    <span><strong>State</strong> — {state.name} ({state.code})</span>
                  </li>
                </ul>
              </section>

              {/* FAQ */}
              <section className="mb-10">
                <h2 className="text-[17px] font-semibold text-ink mb-4">
                  Frequently Asked Questions
                </h2>
                <StateFAQ faqs={faqs} />
              </section>

              {/* Related Guides */}
              <section className="mb-10">
                <h2 className="text-[13px] font-mono uppercase tracking-wider text-tertiary mb-4">
                  Related Guides
                </h2>
                <div className="space-y-2">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/blog/${guide.slug}`}
                      className="flex items-center gap-2 text-[14px] text-accent font-medium hover:underline"
                    >
                      {guide.title}
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Neighboring states */}
              <section>
                <h2 className="text-[13px] font-mono uppercase tracking-wider text-tertiary mb-4">
                  Agent Lists for Nearby States
                </h2>
                <div className="flex flex-wrap gap-2">
                  {neighbors.map((s) => (
                    <Link
                      key={s.code}
                      href={`/states/${s.slug}`}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-border
                                 hover:border-accent hover:bg-accent-light transition-all duration-150 text-[14px]"
                    >
                      <span className="font-mono font-semibold text-ink">{s.code}</span>
                      <span className="text-tertiary">{s.name}</span>
                      <span className="font-mono text-tertiary text-[13px] ml-1">
                        ~{formatAgentCount(s.agentCount)}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/states"
                  className="inline-flex items-center gap-1.5 mt-4 text-[14px] text-accent font-medium hover:underline"
                >
                  View All 50 States
                  <ChevronRight size={14} />
                </Link>
              </section>
            </div>

            {/* Right column — sticky purchase card (desktop) */}
            <div className="hidden lg:block w-[300px] shrink-0 sticky top-24">
              <PurchaseCard stateCode={state.code} stateName={state.name} agentCount={agentCount} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PurchaseCard({ stateCode, stateName, agentCount }: { stateCode: string; stateName: string; agentCount: number }) {
  return (
    <div className="card p-5 sm:p-7 border-accent/30 border-2 shadow-lg">
      <p className="label-eyebrow mb-1">{stateName} Data</p>
      <p className="text-[13px] font-mono text-tertiary mb-5">One-time purchase</p>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-mono text-[36px] sm:text-[48px] font-semibold text-ink leading-none">$49</span>
        <span className="text-tertiary text-[15px]">one-time</span>
      </div>
      <p className="text-[14px] text-body mb-6">
        <span className="font-mono font-semibold text-accent">{agentCount.toLocaleString()}</span> contacts included
      </p>

      <div className="space-y-2.5 mb-7">
        {["Full Name", "Email Address", "Phone Number", "State"].map((field) => (
          <div key={field} className="flex items-center gap-2.5 text-[15px] text-body">
            <Check size={15} className="text-success shrink-0" />
            {field}
          </div>
        ))}
      </div>

      <BuyStateButton stateCode={stateCode} stateName={stateName} className="w-full" />

      <p className="flex items-center justify-center gap-1.5 mt-4 text-[13px] text-tertiary">
        <ShieldCheck size={14} />
        Secure checkout &middot; Instant delivery &middot; No account needed
      </p>

      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-[11px] text-muted">Payments by</span>
        <Image
          src="/lemon-squeezy-logo.svg"
          alt="Lemon Squeezy"
          width={212}
          height={28}
          unoptimized
          className="h-4 w-auto"
        />
      </div>
    </div>
  )
}
