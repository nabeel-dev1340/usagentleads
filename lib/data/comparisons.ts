export interface ComparisonFeature {
  feature: string
  us: string | boolean
  them: string | boolean
}

export interface Competitor {
  slug: string
  name: string
  title: string
  headline: string
  description: string
  features: ComparisonFeature[]
  ourAdvantages: string[]
  theirAdvantages: string[]
  verdict: string
  keywords: string[]
  faqs: { question: string; answer: string }[]
}

export const COMPETITORS: readonly Competitor[] = [
  {
    slug: "redx-vs-usagentleads",
    name: "REDX",
    title: "REDX vs USAgentLeads — Agent Data Comparison",
    headline: "REDX vs USAgentLeads: Which Agent Database Is Worth It?",
    description:
      "REDX sells expired listing leads and FSBO contacts to real estate agents. If you're looking for a database of real estate agent contacts (not homeowner leads), here's how REDX compares to USAgentLeads for reaching agents directly.",
    features: [
      { feature: "Purpose", us: "Contact real estate agents", them: "Find expired/FSBO homeowner leads" },
      { feature: "Data Type", us: "Agent emails, phones, names", them: "Homeowner contact info" },
      { feature: "Pricing", us: "$99 one-time (all states)", them: "$50-200/month subscription" },
      { feature: "Per-State Option", us: "$20/state", them: "Zone-based pricing" },
      { feature: "Contract Required", us: false, them: true },
      { feature: "Instant Download", us: true, them: false },
      { feature: "CRM-Ready CSV", us: true, them: "Proprietary format" },
      { feature: "Agent Count", us: "553,000+", them: "N/A (homeowner leads)" },
    ],
    ourAdvantages: [
      "One-time payment vs monthly subscription — no recurring costs",
      "Specifically built for reaching agents, not homeowners",
      "No contract or commitment required",
      "Instant CSV download — import into any tool immediately",
    ],
    theirAdvantages: [
      "Includes power dialer tool for calling leads",
      "Expired listing data not available elsewhere",
      "Built-in prospecting workflow for agents",
    ],
    verdict:
      "REDX and USAgentLeads serve different needs. REDX helps agents find homeowner leads (expired listings, FSBOs). USAgentLeads helps businesses reach agents themselves. If you're selling to agents — coaching, software, mortgage services — USAgentLeads is the right tool. If you're an agent looking for homeowner leads, REDX is designed for that.",
    keywords: [
      "REDX vs USAgentLeads",
      "REDX alternative",
      "REDX real estate data comparison",
      "real estate agent database comparison",
      "REDX pricing vs alternatives",
    ],
    faqs: [
      {
        question: "Is USAgentLeads a direct competitor to REDX?",
        answer: "Not exactly. REDX provides homeowner leads (expired listings, FSBOs) to real estate agents. USAgentLeads provides agent contact data to businesses that sell to agents. Different audience, different use case.",
      },
      {
        question: "Can I use USAgentLeads to find expired listings like REDX?",
        answer: "No. USAgentLeads is a database of real estate agent contacts — names, emails, and phone numbers of licensed agents. It's for businesses that want to reach agents, not for agents prospecting homeowners.",
      },
    ],
  },
  {
    slug: "costar-vs-usagentleads",
    name: "CoStar / BrokerMetrics",
    title: "CoStar vs USAgentLeads — Agent Data Comparison",
    headline: "CoStar vs USAgentLeads: Enterprise Data vs Affordable Agent Contacts",
    description:
      "CoStar Group (including BrokerMetrics) provides commercial real estate analytics and agent performance data at enterprise pricing. Here's how it compares to USAgentLeads for getting agent contact information.",
    features: [
      { feature: "Focus", us: "Agent contact data (all 50 states)", them: "Commercial RE analytics + agent metrics" },
      { feature: "Agent Emails", us: true, them: "Limited" },
      { feature: "Agent Phone Numbers", us: true, them: "Limited" },
      { feature: "Pricing", us: "$99 one-time", them: "$300-1,000+/month" },
      { feature: "Contract", us: "None", them: "Annual contract typical" },
      { feature: "Setup Time", us: "Instant download", them: "Sales process + onboarding" },
      { feature: "Production Data", us: false, them: true },
      { feature: "Market Analytics", us: false, them: true },
    ],
    ourAdvantages: [
      "95%+ cheaper for basic agent contact data",
      "No sales process, contracts, or onboarding — buy and download instantly",
      "Clean CSV format works with any tool",
      "Per-state purchasing for targeted outreach",
    ],
    theirAdvantages: [
      "Agent production and transaction data",
      "Market analytics and trends",
      "Commercial real estate coverage",
      "Enterprise reporting tools",
    ],
    verdict:
      "If you need agent production data, transaction analytics, or commercial real estate intelligence, CoStar is the enterprise solution — at enterprise prices. If you just need a clean list of agent names, emails, and phone numbers for outreach, USAgentLeads delivers that for a fraction of the cost with zero friction.",
    keywords: [
      "CoStar vs USAgentLeads",
      "CoStar alternative",
      "BrokerMetrics alternative",
      "cheap real estate agent database",
      "CoStar pricing alternative",
    ],
    faqs: [
      {
        question: "Does USAgentLeads include agent production or sales data?",
        answer: "No. USAgentLeads focuses on contact data: name, email, phone, and state. If you need transaction volume or production rankings, you'll need a platform like CoStar or BrokerMetrics.",
      },
      {
        question: "Why would I choose USAgentLeads over CoStar?",
        answer: "If your goal is outreach — emailing or calling agents to sell a product or service — you don't need CoStar's analytics. USAgentLeads gives you the contact data at $99 instead of $300+/month.",
      },
    ],
  },
  {
    slug: "zoominfo-vs-usagentleads",
    name: "ZoomInfo",
    title: "ZoomInfo vs USAgentLeads — Real Estate Agent Data",
    headline: "ZoomInfo vs USAgentLeads: General B2B Data vs Specialized Agent Contacts",
    description:
      "ZoomInfo is a massive B2B contact database covering every industry. It's powerful but expensive. If you specifically need real estate agent contacts, here's why a specialized database might be the better fit.",
    features: [
      { feature: "Focus", us: "Real estate agents only", them: "All B2B contacts" },
      { feature: "Real Estate Agent Coverage", us: "553,000+ verified", them: "Partial (not specialized)" },
      { feature: "Pricing", us: "$99 one-time", them: "$15,000-30,000+/year" },
      { feature: "Contract", us: "None", them: "Annual minimum" },
      { feature: "Data Export", us: "Unlimited CSV download", them: "Credit-based exports" },
      { feature: "Per-State Purchase", us: "$20/state", them: "Not available" },
      { feature: "Enrichment Data", us: "Name, email, phone, state", them: "Full company + contact profiles" },
      { feature: "Intent Data", us: false, them: true },
    ],
    ourAdvantages: [
      "99% cheaper for real estate agent contacts specifically",
      "No annual contract or minimum spend",
      "Unlimited exports — no credit system",
      "Specialized: higher coverage of licensed agents than general B2B databases",
    ],
    theirAdvantages: [
      "Covers all industries, not just real estate",
      "Company data, org charts, technographics",
      "Intent signals and buying triggers",
      "CRM integrations and workflow automation",
    ],
    verdict:
      "If your sales team sells to many industries and needs a full B2B intelligence platform, ZoomInfo justifies its cost. But if you specifically target real estate agents, paying $15K+/year for ZoomInfo makes no sense when USAgentLeads covers 553,000+ agents for a one-time $99. The specialized database has better agent coverage at a fraction of the cost.",
    keywords: [
      "ZoomInfo vs USAgentLeads",
      "ZoomInfo alternative for real estate",
      "cheap ZoomInfo alternative",
      "real estate agent database vs ZoomInfo",
      "ZoomInfo real estate data",
    ],
    faqs: [
      {
        question: "Is USAgentLeads' agent data as accurate as ZoomInfo?",
        answer: "For real estate agent contacts specifically, yes — often more so. USAgentLeads sources directly from state licensing authorities, which is the most authoritative source for agent data. ZoomInfo aggregates from multiple sources and may have gaps in niche verticals like real estate licensing.",
      },
      {
        question: "Can I use both USAgentLeads and ZoomInfo?",
        answer: "Absolutely. Many companies use ZoomInfo for general B2B prospecting and USAgentLeads specifically for real estate agent outreach. At $99 one-time, it's a negligible addition to your data stack.",
      },
    ],
  },
  {
    slug: "apollo-vs-usagentleads",
    name: "Apollo.io",
    title: "Apollo.io vs USAgentLeads — Real Estate Agent Data",
    headline: "Apollo.io vs USAgentLeads: General Prospecting vs Specialized Agent Data",
    description:
      "Apollo.io is a popular sales intelligence platform with a large B2B database and built-in email sequencing. Here's how it stacks up against USAgentLeads when your target is specifically real estate agents.",
    features: [
      { feature: "Focus", us: "Real estate agents only", them: "All B2B contacts" },
      { feature: "Agent Coverage", us: "553,000+ verified", them: "Partial — not specialized" },
      { feature: "Pricing", us: "$99 one-time", them: "$49-99/month per user" },
      { feature: "Email Sequencing", us: false, them: true },
      { feature: "Data Export", us: "Unlimited CSV", them: "Credit-limited" },
      { feature: "Per-State Purchase", us: "$20/state", them: "Not available" },
      { feature: "Contract", us: "None", them: "Monthly or annual" },
      { feature: "Free Tier", us: "No (one-time purchase)", them: "Yes (limited)" },
    ],
    ourAdvantages: [
      "Complete coverage of licensed US agents vs Apollo's partial real estate data",
      "No per-user pricing — one purchase covers your whole team",
      "No credit limits on exports",
      "Data sourced directly from state licensing records",
    ],
    theirAdvantages: [
      "Built-in email sequencing and dialer",
      "Multi-industry coverage",
      "Free tier available",
      "Chrome extension for LinkedIn prospecting",
    ],
    verdict:
      "Apollo is a great all-in-one prospecting tool, but its real estate agent coverage has gaps because it isn't specialized. If you already use Apollo for email sequences, buy the agent data from USAgentLeads for $99 and import it into Apollo — you get the best of both worlds: specialized data plus Apollo's workflow tools.",
    keywords: [
      "Apollo.io vs USAgentLeads",
      "Apollo alternative for real estate",
      "Apollo.io real estate agent data",
      "real estate agent database comparison",
      "Apollo real estate contacts",
    ],
    faqs: [
      {
        question: "Can I import USAgentLeads data into Apollo?",
        answer: "Yes. Download the CSV from USAgentLeads, then use Apollo's CSV import to add the contacts to your Apollo workspace. From there you can run sequences, enrich records, and use Apollo's workflow tools with the agent data.",
      },
      {
        question: "Does Apollo have all US real estate agents?",
        answer: "No. Apollo aggregates B2B data from many sources but doesn't specialize in real estate licensing data. You'll find some agents in Apollo, but coverage is inconsistent — especially for smaller states. USAgentLeads covers all 50 states from licensing authority records.",
      },
    ],
  },
  {
    slug: "realtyagentlists-vs-usagentleads",
    name: "RealtyAgentLists",
    title: "RealtyAgentLists vs USAgentLeads — Agent Database Comparison",
    headline: "RealtyAgentLists vs USAgentLeads: Which Agent List Is Better Value?",
    description:
      "RealtyAgentLists is a direct competitor selling real estate agent contact databases. Both services offer similar data — here's how they compare on pricing, data quality, and overall value.",
    features: [
      { feature: "Full US Database", us: "$99", them: "$199-499+" },
      { feature: "Per-State Pricing", us: "$20", them: "$30-50" },
      { feature: "Agent Count", us: "553,000+", them: "Varies" },
      { feature: "Instant Download", us: true, them: true },
      { feature: "CSV Format", us: true, them: true },
      { feature: "No Account Required", us: true, them: false },
      { feature: "Phone Numbers Included", us: true, them: "Sometimes extra" },
      { feature: "Money-Back Guarantee", us: true, them: "Varies" },
    ],
    ourAdvantages: [
      "Consistently lower pricing — $99 vs $199+ for full database",
      "No account required to purchase",
      "Phone numbers included at no extra charge",
      "Transparent pricing with no upsells",
    ],
    theirAdvantages: [
      "May offer additional segmentation options",
      "Some plans include recurring updates",
    ],
    verdict:
      "Both services provide real estate agent contact data. USAgentLeads is the more affordable option with transparent, no-upsell pricing. If you want the same data type for less money with instant access, USAgentLeads is the straightforward choice.",
    keywords: [
      "RealtyAgentLists vs USAgentLeads",
      "RealtyAgentLists alternative",
      "best real estate agent email list",
      "cheapest realtor database",
      "real estate agent list comparison",
    ],
    faqs: [
      {
        question: "Is the data from USAgentLeads the same quality as RealtyAgentLists?",
        answer: "Both services source data from state licensing records. The core data fields (name, email, phone, state) are comparable. USAgentLeads offers this at a lower price point with no hidden fees.",
      },
      {
        question: "Why is USAgentLeads cheaper?",
        answer: "Lower overhead, no subscription model, and a focus on volume over margin. We believe agent contact data should be affordable and accessible, not gated behind enterprise pricing.",
      },
    ],
  },
] as const

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug)
}
