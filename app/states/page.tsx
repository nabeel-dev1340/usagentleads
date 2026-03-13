import type { Metadata } from "next"
import { StateGrid } from "@/components/states/StateGrid"
import { createServiceClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Browse Real Estate Agent Data by State — All 50 States",
  description:
    "Buy verified real estate agent contact data for any US state. CSV download with name, email, phone. Starting at $10 per state.",
  alternates: {
    canonical: "https://usagentleads.com/states",
  },
  openGraph: {
    title: "Browse Real Estate Agent Data by State — All 50 States | USAgentLeads",
    description: "Buy verified real estate agent contact data for any US state. CSV download with name, email, phone. Starting at $10 per state.",
    url: "https://usagentleads.com/states",
    images: [{ url: "https://usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads — Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Real Estate Agent Data by State — All 50 States",
    description: "Verified real estate agent contacts for every US state. Starting at $10 per state.",
    images: ["https://usagentleads.com/twitter-image"],
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

  return (
    <div className="bg-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="pt-20 pb-12 border-b border-border flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="label-eyebrow mb-3">50 States Available</p>
            <h1 className="section-heading">Browse by State</h1>
            <p className="section-sub mt-3 max-w-[440px]">
              Verified agent contacts for every US state.
              Starting at $10 per state — instant CSV delivery.
            </p>
          </div>
        </div>

        <StateGrid countMap={countMap} />
      </div>
    </div>
  )
}
