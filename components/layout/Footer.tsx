import Link from "next/link"
import { LogoIcon } from "@/components/ui/Logo"
import { US_STATES } from "@/lib/utils/states"

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {/* Top columns */}
        <div className="grid gap-8 sm:gap-10 grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2 text-[19px] font-semibold tracking-tight w-fit">
              <LogoIcon className="h-7 w-7 text-white" detailClassName="fill-ink stroke-ink" />
              <span>
                <span className="text-white">USAgent</span>
                <span className="text-accent-mid">Leads</span>
              </span>
            </Link>
            <p className="text-[14px] text-muted leading-relaxed max-w-55">
              Verified real estate agent contacts across all 50 US states.
            </p>
          </div>

          {/* Data */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-muted mb-4">Data</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/states" className="text-[15px] text-muted hover:text-white transition-colors">
                  Browse States
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[15px] text-muted hover:text-white transition-colors">
                  Full Database
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[15px] text-muted hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[15px] text-muted hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-[15px] text-muted hover:text-white transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[15px] text-muted hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-muted mb-4">Account</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dashboard" className="text-[15px] text-muted hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer nofollow" className="text-[15px] text-muted hover:text-white transition-colors">
                  Manage Subscription
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-muted mb-4">Legal</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-[15px] text-muted hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[15px] text-muted hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[15px] text-muted hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-border my-8" />

        {/* All 50 states SEO list */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-8">
          <p className="text-[12px] font-mono uppercase tracking-wider text-tertiary w-full mb-2">
            All States
          </p>
          {US_STATES.map((s) => (
            <Link
              key={s.code}
              href={`/states/${s.slug}`}
              className="text-[13px] font-mono text-tertiary hover:text-muted transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-border pt-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-[13px] text-tertiary">
            &copy; {new Date().getFullYear()} USAgentLeads. Not affiliated with NAR or any MLS.
          </p>
          <p className="text-[13px] text-tertiary">
            Built by{" "}
            <a
              href="https://beelodev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors font-medium"
            >
              BeeloDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
