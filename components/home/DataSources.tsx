import Link from "next/link"
import { Globe, ShieldCheck, RefreshCw } from "lucide-react"

const sources = [
  "State licensing boards",
  "Public MLS directories",
  "Professional association registries",
  "Brokerage websites",
  "Realtor listing platforms",
]

const highlights = [
  {
    icon: Globe,
    title: "Publicly Available Data",
    description: "All records sourced from publicly accessible professional directories and licensing databases.",
  },
  {
    icon: ShieldCheck,
    title: "CAN-SPAM Compliant",
    description: "Business contact data from professional listings. You handle compliance as the sender.",
  },
  {
    icon: RefreshCw,
    title: "Regularly Updated",
    description: "We re-verify the full database annually and remove dead emails to keep bounce rates low.",
  },
]

export function DataSources() {
  return (
    <section className="bg-subtle py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">Transparency</p>
          <h2 className="section-heading">Where Our Data Comes From</h2>
          <p className="section-sub max-w-xl">
            No scraped social media. No purchased third-party lists. Just clean, public professional data.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 max-w-5xl mx-auto items-start">
          {/* Sources list */}
          <div className="flex-1 reveal">
            <div className="card p-7">
              <p className="text-[13px] font-mono font-semibold text-tertiary uppercase tracking-wider mb-5">
                Data Sources
              </p>
              <ul className="space-y-3.5">
                {sources.map((source) => (
                  <li key={source} className="flex items-center gap-3 text-[15px] text-body">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {source}
                  </li>
                ))}
              </ul>
              <Link href="/data-sources" className="mt-6 inline-flex text-[14px] font-medium text-accent hover:underline">
                See sourcing methodology
              </Link>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex-1 space-y-5 reveal">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-light border border-accent-mid flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink mb-1">{item.title}</h3>
                  <p className="text-[14px] text-tertiary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
