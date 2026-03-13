import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { US_STATES, getStateBySlug, formatAgentCount } from "@/lib/utils/states"
import { generateStateMetadata, generateBreadcrumbSchema, generateProductSchema } from "@/lib/utils/seo"
import { BuyStateButton } from "@/components/checkout/BuyStateButton"
import { ChevronRight, Check, Lock, ShieldCheck } from "lucide-react"

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
  return generateStateMetadata(state)
}

const sampleData = [
  { name: "James Harrington", email: "james@harrington-realty.com", phone: "(305) 881-2244" },
  { name: "Sarah Chen", email: "sarah.chen@kw.com", phone: "(512) 447-9801" },
  { name: "Michael Rivera", email: "mrivera@homes.co", phone: "(213) 556-1102" },
  { name: "Emily Thompson", email: "emily.t@sold.net", phone: "(404) 223-8877" },
]

export default async function StatePage({ params }: Props) {
  const { state: slug } = await params
  const state = getStateBySlug(slug)
  if (!state) notFound()

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://usagentleads.com" },
    { name: "States", url: "https://usagentleads.com/states" },
    { name: state.name, url: `https://usagentleads.com/states/${state.slug}` },
  ])
  const product = generateProductSchema(state)

  const stateIndex = US_STATES.findIndex((s) => s.code === state.code)
  const neighbors = [
    US_STATES[(stateIndex - 1 + US_STATES.length) % US_STATES.length],
    US_STATES[(stateIndex + 1) % US_STATES.length],
    US_STATES[(stateIndex + 2) % US_STATES.length],
    US_STATES[(stateIndex + 3) % US_STATES.length],
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, product]) }}
      />
      <div className="bg-page min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={14} className="text-muted" />
            <Link href="/states" className="hover:text-ink transition-colors">States</Link>
            <ChevronRight size={14} className="text-muted" />
            <span className="text-ink font-medium">{state.name}</span>
          </nav>

          {/* Two-column layout */}
          <div className="flex gap-16 items-start pb-20">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <p className="label-eyebrow mb-4">State Data</p>

              {/* Big state name */}
              <h1
                className="font-semibold text-ink tracking-[-0.04em] leading-[0.9] mb-5"
                style={{ fontSize: "clamp(56px, 9vw, 88px)" }}
              >
                {state.name}
              </h1>

              <p className="text-[17px] text-tertiary mb-10">
                Real Estate Agent Email List —{" "}
                <span className="font-mono text-ink font-semibold ml-1">
                  {state.agentCount.toLocaleString()}
                </span>{" "}
                verified contacts
              </p>

              {/* Mobile CTA */}
              <div className="lg:hidden mb-10">
                <PurchaseCard stateCode={state.code} stateName={state.name} agentCount={state.agentCount} />
              </div>

              {/* 4-stat strip */}
              <div className="bg-white border border-border rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-border mb-10">
                {[
                  { value: state.agentCount.toLocaleString(), label: "Total" },
                  { value: Math.round(state.agentCount * 1.43).toLocaleString(), label: "Emails" },
                  { value: Math.round(state.agentCount * 0.41).toLocaleString(), label: "Phones" },
                  { value: "10+", label: "Fields" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center px-4">
                    <div className="font-mono text-[28px] font-semibold text-ink">{stat.value}</div>
                    <div className="text-[13px] font-mono uppercase tracking-wider text-tertiary mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample data preview */}
              <div className="card overflow-hidden mb-10">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-subtle">
                  <span className="text-[13px] font-mono font-semibold text-tertiary uppercase tracking-wider">
                    Sample Preview
                  </span>
                  <span className="text-[13px] text-tertiary font-mono">
                    Showing 1 of {state.agentCount.toLocaleString()} records
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
                    Purchase to access all {state.agentCount.toLocaleString()} records
                  </span>
                </div>
              </div>

              {/* Neighboring states */}
              <div>
                <p className="text-[13px] font-mono uppercase tracking-wider text-tertiary mb-4">
                  Also Available
                </p>
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
              </div>
            </div>

            {/* Right column — sticky purchase card (desktop) */}
            <div className="hidden lg:block w-[300px] shrink-0 sticky top-24">
              <PurchaseCard stateCode={state.code} stateName={state.name} agentCount={state.agentCount} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PurchaseCard({ stateCode, stateName, agentCount }: { stateCode: string; stateName: string; agentCount: number }) {
  return (
    <div className="card p-7 border-accent/30 border-2 shadow-lg">
      <p className="label-eyebrow mb-1">{stateName} Data</p>
      <p className="text-[13px] font-mono text-tertiary mb-5">One-time purchase</p>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-mono text-[48px] font-semibold text-ink leading-none">$20</span>
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
    </div>
  )
}
