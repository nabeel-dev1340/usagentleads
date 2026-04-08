export interface Persona {
  slug: string
  name: string
  title: string
  headline: string
  description: string
  painPoints: string[]
  useCases: string[]
  cta: string
  keywords: string[]
  relatedBlogSlugs: string[]
  faqs: { question: string; answer: string }[]
}

export const PERSONAS: readonly Persona[] = [
  {
    slug: "coaches",
    name: "Real Estate Coaches & Trainers",
    title: "Real Estate Agent Email List for Coaches",
    headline: "Fill Your Coaching Pipeline with Verified Agent Contacts",
    description:
      "You run coaching programs, sell courses, or offer certifications to real estate agents. Growing your pipeline means reaching agents directly — not waiting for them to find you. Our database gives you verified email addresses and phone numbers for agents across all 50 states, so you can run targeted outreach and fill your programs faster.",
    painPoints: [
      "Spending hours on LinkedIn trying to find agent contacts one by one",
      "Paying for Facebook or Google ads with unpredictable cost-per-lead",
      "Buying lists from brokers who recycle the same stale data",
      "No way to segment outreach by state or region",
    ],
    useCases: [
      "Launch email campaigns promoting your coaching programs state by state",
      "Build lookalike audiences from verified agent emails for paid ads",
      "Cold call agents in states where you're expanding",
      "Invite agents to free webinars or workshops as a top-of-funnel play",
    ],
    cta: "Start reaching agents who need your coaching",
    keywords: [
      "real estate agent email list for coaches",
      "realtor email list for coaching",
      "real estate coaching leads",
      "email list for real estate trainers",
      "agent contacts for coaching programs",
      "real estate coach marketing",
    ],
    faqs: [
      {
        question: "Can I email agents directly to promote my coaching program?",
        answer:
          "Yes. The contacts are licensed professionals with publicly available business information. Most coaches use our data for cold email outreach, webinar invitations, and course promotions. Follow CAN-SPAM guidelines: include your business address, a clear unsubscribe link, and accurate subject lines.",
      },
      {
        question: "How do I target agents most likely to need coaching?",
        answer:
          "Start with smaller states or states where you already have testimonials. Newer agents (identifiable by cross-referencing license dates) tend to be more receptive to coaching. You can also segment by state to match your program's geographic focus.",
      },
      {
        question: "What format is the data in?",
        answer:
          "You get a clean CSV file with Full Name, Email, Phone, and State columns. It imports directly into any email tool (Mailchimp, ActiveCampaign, Instantly, Smartlead) or CRM (HubSpot, Close, Salesforce) without reformatting.",
      },
    ],
    relatedBlogSlugs: [
      "real-estate-coach-marketing-agent-pipeline",
      "real-estate-cold-email-templates",
      "how-to-build-realtor-email-list",
    ],
  },
  {
    slug: "saas-companies",
    name: "SaaS & PropTech Companies",
    title: "Real Estate Agent Database for SaaS Companies",
    headline: "Reach Every Agent Who Needs Your Software",
    description:
      "You built a product for real estate agents — a CRM, website builder, transaction tool, or lead gen platform. The hard part isn't the product, it's distribution. Our database gives your sales team direct access to the inboxes and phone numbers of agents across every US state, so you can run outbound at scale without paying per lead.",
    painPoints: [
      "High CAC from relying on paid ads and inbound alone",
      "SDRs spending half their day researching contacts instead of selling",
      "Third-party lead databases charging per contact or per month",
      "No reliable way to reach agents outside your existing network",
    ],
    useCases: [
      "Run cold email sequences introducing your product to agents state by state",
      "Build targeted outbound lists for your SDR team without per-lead costs",
      "Seed your CRM with verified contacts for nurture campaigns",
      "Upload agent emails as custom audiences for retargeting ads",
    ],
    cta: "Get the agent contacts your sales team needs",
    keywords: [
      "real estate agent database for saas",
      "realtor email list for software companies",
      "proptech agent outreach",
      "real estate agent contacts for b2b sales",
      "agent email list for saas marketing",
      "sell to real estate agents",
    ],
    faqs: [
      {
        question: "How many contacts will my team actually be able to reach?",
        answer:
          "The full database includes 553,000+ contacts. Email coverage is near-complete, and roughly 40% of records include a direct phone number. The data is verified against state licensing records, so bounce rates stay low.",
      },
      {
        question: "Can I integrate this with my CRM or outbound tool?",
        answer:
          "The CSV format works with any tool. Import directly into HubSpot, Salesforce, Close, Outreach, Salesloft, Apollo, Instantly, or Smartlead. No API integration needed — just upload the file.",
      },
      {
        question: "How does pricing compare to ZoomInfo or Apollo?",
        answer:
          "A single state costs $49. The full 50-state database is $149 — one-time, not a subscription. That's typically 80-90% less than what you'd pay for the same contacts on ZoomInfo, Apollo, or similar platforms.",
      },
    ],
    relatedBlogSlugs: [
      "proptech-sales-sell-software-real-estate-agents",
      "import-real-estate-contacts-hubspot",
      "b2b-real-estate-marketing",
    ],
  },
  {
    slug: "mortgage-lenders",
    name: "Mortgage Lenders & Title Companies",
    title: "Real Estate Agent Email List for Mortgage Lenders",
    headline: "Build Referral Partnerships with Agents at Scale",
    description:
      "Your business depends on agent referrals. The more agents who know your name and trust your service, the more deals come through your door. Instead of waiting for agents to come to you, reach out directly with verified contact data covering every licensed agent in the states you serve.",
    painPoints: [
      "Relying on a small network of referring agents for most of your volume",
      "Attending networking events and open houses hoping to meet new agents",
      "No systematic way to introduce your services to agents in your market",
      "Competitors locking up the top-producing agents before you get to them",
    ],
    useCases: [
      "Email agents in your service area to introduce your rates and programs",
      "Send market updates and rate sheets to stay top-of-mind with agents",
      "Invite agents to co-branded events, lunch-and-learns, or CE classes",
      "Build a drip campaign targeting agents you want referral relationships with",
    ],
    cta: "Start building agent relationships today",
    keywords: [
      "real estate agent email list for mortgage lenders",
      "realtor contacts for loan officers",
      "agent email list for title companies",
      "mortgage marketing to real estate agents",
      "realtor referral partnerships",
      "agent outreach for mortgage brokers",
    ],
    faqs: [
      {
        question: "Can I target agents in just my local market?",
        answer:
          "Yes. Buy individual state packs for $49 each, so you only pay for the markets you serve. If you operate in multiple states, the full database at $149 is usually the better deal.",
      },
      {
        question: "Is this data compliant with real estate marketing regulations?",
        answer:
          "The data comes from publicly available state licensing records. It's business contact information for licensed professionals, not consumer data. Standard business email outreach rules apply (CAN-SPAM compliance).",
      },
      {
        question: "How do loan officers typically use this data?",
        answer:
          "The most common approach: import the state CSV into your email tool, write a short intro email about your rates or a co-marketing opportunity, and follow up with value-add content like market reports. Agents respond well to loan officers who bring them something useful.",
      },
    ],
    relatedBlogSlugs: [
      "mortgage-lenders-contact-real-estate-agents",
      "real-estate-cold-email-templates",
      "cold-outreach-realtors-compliance",
    ],
  },
  {
    slug: "marketing-agencies",
    name: "Marketing Agencies",
    title: "Real Estate Agent Email List for Marketing Agencies",
    headline: "Scale Your Real Estate Clients' Outreach Overnight",
    description:
      "Your agency serves real estate clients — brokerages, PropTech companies, or real estate service providers. They need to reach agents, and you need reliable data to deliver results. Our database gives you clean, verified agent contacts you can use across campaigns without recurring per-contact fees eating into your margins.",
    painPoints: [
      "Clients expecting you to source contacts but unwilling to pay for expensive data subscriptions",
      "Manually building lists from LinkedIn or public directories for each campaign",
      "Poor deliverability from low-quality purchased lists",
      "Needing fresh data for every new client engagement",
    ],
    useCases: [
      "Run email campaigns for brokerage clients recruiting agents",
      "Build custom audiences for real estate ad campaigns",
      "Power direct mail campaigns targeting agents by state",
      "Provide data as a value-add in your agency retainer packages",
    ],
    cta: "Get campaign-ready agent data for your clients",
    keywords: [
      "real estate agent email list for agencies",
      "realtor database for marketing agencies",
      "agent contacts for email campaigns",
      "real estate marketing data",
      "bulk realtor email list",
      "agent outreach data for agencies",
    ],
    faqs: [
      {
        question: "Can I use this data for multiple clients?",
        answer:
          "Yes. Once purchased, the data is yours to use. There are no per-use restrictions. Many agencies buy the full database once and use it across multiple client engagements.",
      },
      {
        question: "How often is the data updated?",
        answer:
          "The database is refreshed regularly against state licensing records. Typical bounce rates run under 5%. For the freshest data, you can re-purchase periodically — at $149 for all 50 states, the cost is negligible compared to subscription-based alternatives.",
      },
      {
        question: "Can I white-label or resell this data?",
        answer:
          "The data is for your business use, including use on behalf of clients. You can incorporate it into campaigns and deliverables. If you want to resell the raw data itself, reach out to discuss licensing.",
      },
    ],
    relatedBlogSlugs: [
      "real-estate-marketing-strategies",
      "real-estate-cold-email-templates",
      "b2b-real-estate-marketing",
    ],
  },
  {
    slug: "brokerages",
    name: "Real Estate Brokerages",
    title: "Real Estate Agent Email List for Brokerages",
    headline: "Recruit Agents and Grow Your Brokerage Faster",
    description:
      "Growing a brokerage means recruiting agents. You need to reach licensed agents in your market with a compelling value proposition — better splits, better tools, better culture. Our database puts every licensed agent's contact information at your fingertips, so your recruiting team can run targeted outreach instead of hoping agents come to them.",
    painPoints: [
      "Recruiting pipeline depends on word-of-mouth and who you already know",
      "Competing with national franchises that have dedicated recruiting budgets",
      "No easy way to identify and contact agents at competing brokerages",
      "Paying recruiters or headhunters high fees per successful hire",
    ],
    useCases: [
      "Email agents in your state about your brokerage's value proposition",
      "Run recruitment campaigns targeting specific state markets you're entering",
      "Build awareness with agents through drip email sequences",
      "Invite agents to informational sessions or brokerage open houses",
    ],
    cta: "Start recruiting agents in your market",
    keywords: [
      "real estate agent email list for recruiting",
      "realtor database for brokerages",
      "agent recruitment email list",
      "recruit real estate agents",
      "brokerage recruiting contacts",
      "real estate agent recruiting data",
    ],
    faqs: [
      {
        question: "Can I find agents from specific competing brokerages?",
        answer:
          "Our data includes agent name, email, phone, and state. It doesn't include current brokerage affiliation. However, you can cross-reference with MLS data or public brokerage rosters to target specific firms.",
      },
      {
        question: "Is it legal to recruit agents from other brokerages via email?",
        answer:
          "Yes. Real estate agents are independent contractors, and recruiting them is a standard industry practice. Use professional, CAN-SPAM compliant outreach, and agents are free to explore opportunities.",
      },
      {
        question: "What's the best approach for brokerage recruiting emails?",
        answer:
          "Lead with your differentiator — commission splits, technology, culture, or support. Keep the first email short and specific. Agents get recruited constantly, so generic \"join our team\" emails get ignored. Be specific about what makes your brokerage different.",
      },
    ],
    relatedBlogSlugs: [
      "how-to-build-realtor-email-list",
      "real-estate-cold-email-templates",
      "real-estate-agent-email-list-all-states",
    ],
  },
  {
    slug: "lead-generation",
    name: "Lead Generation Companies",
    title: "Real Estate Agent Database for Lead Gen Companies",
    headline: "Source Verified Agent Contacts Without the Scraping",
    description:
      "You sell leads or build contact databases for clients who target real estate agents. The data sourcing is usually the most expensive and time-consuming part. Our pre-built database saves you the scraping, cleaning, and verification work — you get 553,000+ verified contacts ready to use or resell as part of your offering.",
    painPoints: [
      "Spending engineering time building and maintaining scrapers for state licensing sites",
      "High costs for data cleaning and email verification at scale",
      "State licensing sites changing formats and breaking your data pipeline",
      "Clients expecting fresh, complete data but your coverage has gaps",
    ],
    useCases: [
      "Use as a foundation for your own lead gen products targeting real estate",
      "Supplement your existing database with verified state licensing data",
      "Offer agent contact lists as an add-on to your existing services",
      "Build enriched profiles by combining our data with your own sources",
    ],
    cta: "Get the raw data your business needs",
    keywords: [
      "real estate agent database for lead gen",
      "bulk realtor email list",
      "real estate agent data provider",
      "wholesale agent contact data",
      "realtor lead list",
      "real estate agent email database bulk",
    ],
    faqs: [
      {
        question: "What's the data coverage like?",
        answer:
          "553,000+ licensed real estate agents across all 50 US states. Email coverage is near-complete. Approximately 40% of records include a direct phone number. Data is sourced from state licensing authorities.",
      },
      {
        question: "Can I use this data in my own products?",
        answer:
          "The data is yours once purchased. You can incorporate it into your products, enrich it with your own data sources, and use it as part of your service delivery. For raw resale licensing, contact us to discuss terms.",
      },
      {
        question: "How does this compare to scraping the data myself?",
        answer:
          "Building and maintaining scrapers for 50 state licensing sites costs thousands in engineering time, plus ongoing maintenance as sites change. Our database gives you the same result for $149, verified and formatted, with regular updates.",
      },
    ],
    relatedBlogSlugs: [
      "real-estate-contact-database-free-vs-paid",
      "realtor-database-download-guide",
      "find-real-estate-agent-email-addresses",
    ],
  },
] as const

export function getPersonaBySlug(slug: string): Persona | undefined {
  return PERSONAS.find((p) => p.slug === slug)
}
