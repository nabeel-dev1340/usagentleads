"use client"

import Link from "next/link"
import { US_STATES } from "@/lib/utils/states"
import { Globe, LogOut, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardSidebarProps {
  activeState?: string
  onStateSelect: (stateCode: string) => void
}

export function DashboardSidebar({ activeState, onStateSelect }: DashboardSidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col bg-white border-r border-border">
      {/* Header */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="text-[19px] font-semibold tracking-tight">
          <span className="text-ink">USAgent</span>
          <span className="text-accent">Leads</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <p className="label-eyebrow px-3 mb-3">States</p>

        <button
          onClick={() => onStateSelect("")}
          className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] mb-0.5 transition-all duration-150 ${
            !activeState
              ? "bg-accent-light text-accent font-medium border-l-2 border-accent -ml-px pl-[11px]"
              : "text-tertiary hover:text-ink hover:bg-subtle"
          }`}
        >
          <Globe size={14} className="shrink-0" />
          All States
          <span className="ml-auto font-mono text-[13px] text-tertiary">500K+</span>
        </button>

        <div className="space-y-0.5 mt-1">
          {US_STATES.map((state) => (
            <button
              key={state.code}
              onClick={() => onStateSelect(state.code)}
              className={`flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-[14px] transition-all duration-150 ${
                activeState === state.code
                  ? "bg-accent-light text-accent font-medium border-l-2 border-accent -ml-px pl-[11px]"
                  : "text-tertiary hover:text-ink hover:bg-subtle"
              }`}
            >
              <span>{state.name}</span>
              <span className="font-mono text-[13px] text-tertiary">{state.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 mt-auto border-t border-border pt-4">
        <span className="badge-active mb-3 block">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Pro — Active
        </span>
        <a
          href="https://app.lemonsqueezy.com/my-orders"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-tertiary hover:text-ink transition-colors flex items-center gap-1.5 mb-2"
        >
          <ExternalLink size={13} /> Manage Subscription
        </a>
        <button
          onClick={handleSignOut}
          className="text-[13px] text-tertiary hover:text-danger transition-colors flex items-center gap-1.5"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )
}
