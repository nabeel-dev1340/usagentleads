import Link from "next/link"
import { LogoIcon } from "@/components/ui/Logo"
import { US_STATES } from "@/lib/utils/states"

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {/* Top columns */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <LogoIcon className="h-7 w-7 text-white" />
              <span>
                <span className="text-white font-semibold text-[18px]">USAgent</span>
                <span className="text-accent-mid font-semibold text-[18px]">Leads</span>
              </span>
            </div>
            <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-[220px]">
              Verified real estate agent contacts across all 50 US states.
            </p>
          </div>

          {/* Data */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-[#9CA3AF] mb-4">Data</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/states" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Browse States
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Full Database
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-[#9CA3AF] mb-4">Account</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dashboard" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Manage Subscription
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[12px] font-mono uppercase tracking-wider text-[#9CA3AF] mb-4">Legal</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[15px] text-[#9CA3AF] hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1F2937] my-8" />

        {/* All 50 states SEO list */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-8">
          <p className="text-[12px] font-mono uppercase tracking-wider text-[#6B7280] w-full mb-2">
            All States
          </p>
          {US_STATES.map((s) => (
            <Link
              key={s.code}
              href={`/states/${s.slug}`}
              className="text-[13px] font-mono text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1F2937] pt-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-[13px] text-[#6B7280]">
            &copy; {new Date().getFullYear()} USAgentLeads. Not affiliated with NAR or any MLS.
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Built for marketers, lenders &amp; agencies.
          </p>
        </div>
      </div>
    </footer>
  )
}
