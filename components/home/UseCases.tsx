import { Mail, Target, Database, BarChart3 } from "lucide-react"

const useCases = [
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Import directly into Mailchimp, SendGrid, or any ESP. Launch campaigns in minutes with verified agent emails.",
  },
  {
    icon: Target,
    title: "Lead Generation",
    description: "Build targeted prospect lists by state. Perfect for B2B outreach to real estate professionals.",
  },
  {
    icon: Database,
    title: "CRM Enrichment",
    description: "Bulk-import into HubSpot, Salesforce, Pipedrive, or any CRM that accepts CSV. Clean, formatted, ready to go.",
  },
  {
    icon: BarChart3,
    title: "Market Research",
    description: "Analyze agent distribution by state, identify underserved markets, and size your total addressable market.",
  },
]

export function UseCases() {
  return (
    <section className="bg-white py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">Use Cases</p>
          <h2 className="section-heading">What You Can Do With This Data</h2>
          <p className="section-sub max-w-xl">
            CRM-ready CSV files that work with every major platform.
          </p>
        </div>

        {/* CRM logos strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-14">
          {["HubSpot", "Salesforce", "Mailchimp", "Pipedrive", "SendGrid", "Google Sheets", "Excel"].map((name) => (
            <span key={name} className="text-[13px] font-mono font-medium text-muted uppercase tracking-wider">
              {name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto reveal-stagger">
          {useCases.map((item) => (
            <div key={item.title} className="card p-7">
              <div className="w-10 h-10 rounded-xl bg-accent-light border border-accent-mid flex items-center justify-center mb-5">
                <item.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-[17px] font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-[14px] text-tertiary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
