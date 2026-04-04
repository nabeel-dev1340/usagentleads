import Link from "next/link"
import { Megaphone, Building2, GraduationCap, Landmark, Laptop, Users } from "lucide-react"

const audiences = [
  {
    icon: Megaphone,
    title: "Marketing Agencies",
    description: "Run targeted email campaigns for real estate clients at scale.",
    href: "/for/marketing-agencies",
  },
  {
    icon: Laptop,
    title: "SaaS & PropTech",
    description: "Reach agents who need your tools — CRM, websites, lead gen, and more.",
    href: "/for/saas-companies",
  },
  {
    icon: Landmark,
    title: "Mortgage & Title",
    description: "Connect with active agents to build referral partnerships.",
    href: "/for/mortgage-lenders",
  },
  {
    icon: GraduationCap,
    title: "Coaches & Trainers",
    description: "Promote courses, certifications, and coaching programs directly.",
    href: "/for/coaches",
  },
  {
    icon: Building2,
    title: "Brokerages",
    description: "Recruit agents or market services to agents in specific states.",
    href: "/for/brokerages",
  },
  {
    icon: Users,
    title: "Lead Gen Companies",
    description: "Build and resell verified agent contact lists for your clients.",
    href: "/for/lead-generation",
  },
]

export function WhoIsThisFor() {
  return (
    <section className="bg-white py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">Built For</p>
          <h2 className="section-heading">Who Is This For?</h2>
          <p className="section-sub max-w-xl">
            Companies in these industries use our data for outreach every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto reveal-stagger">
          {audiences.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="card-interactive p-6 flex gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-light border border-accent-mid flex items-center justify-center shrink-0">
                <item.icon size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-ink mb-1 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-[14px] text-tertiary leading-relaxed">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
