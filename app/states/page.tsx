export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { StateGrid } from "@/components/states/StateGrid"
import { createServiceClient } from "@/lib/supabase/server"
import { generateBreadcrumbSchema } from "@/lib/utils/seo"

export const metadata: Metadata = {
  title: "Agent Email Lists by State 2026 — All 50 States from $49",
  description:
    "2026 verified real estate agent contacts for every US state. CSV files with names, emails, and phone numbers — instant download from $49/state. Free sample available.",
  alternates: {
    canonical: "https://www.usagentleads.com/states",
    languages: {
      "en-US": "https://www.usagentleads.com/states",
      "x-default": "https://www.usagentleads.com/states",
    },
  },
  openGraph: {
    title: "Agent Email Lists by State — All 50 States from $49",
    description: "Browse verified real estate agent contacts for every US state. CSV files with names, emails, and phone numbers — instant download from $49/state.",
    url: "https://www.usagentleads.com/states",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Email Lists by State — All 50 States from $49",
    description: "Browse verified real estate agent contacts for every US state — instant download from $49/state.",
    images: ["https://www.usagentleads.com/twitter-image"],
  },
}

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

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "States", url: "https://www.usagentleads.com/states" },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    <div className="bg-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight size={14} className="text-muted" />
          <span className="text-ink font-medium">States</span>
        </nav>

        {/* Page header */}
        <div className="pb-12 border-b border-border flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="label-eyebrow mb-3">50 States Available</p>
            <h1 className="section-heading">Browse by State</h1>
            <p className="section-sub mt-3 max-w-[440px]">
              Verified agent contacts for every US state.
              Starting at $49 per state — instant CSV delivery.
            </p>
          </div>
        </div>

        <p className="text-[15px] text-body leading-[1.8] max-w-2xl mt-8 mb-2">
          Browse verified real estate agent contact data for all 50 US states. Each state pack includes name, email, and phone number for every licensed agent, delivered as an instant CSV download for $49.{" "}
          <Link href="/pricing" className="text-accent font-medium hover:underline">
            Looking for all 50 states? Get the Full Database for $149 →
          </Link>
        </p>

        <StateGrid countMap={countMap} />
      </div>
    </div>
    </>
  )
}
