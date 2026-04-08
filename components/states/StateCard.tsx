import Link from "next/link"
import type { USState } from "@/types"
import { formatAgentCount } from "@/lib/utils/states"
import { ArrowRight } from "lucide-react"

export function StateCard({ state }: { state: USState; index?: number }) {
  return (
    <Link
      href={`/states/${state.slug}`}
      className="card-interactive p-6 flex flex-col group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[16px] font-semibold text-ink">{state.name}</h3>
          <span className="badge-state mt-1.5 inline-block">{state.code}</span>
        </div>
        <span className="font-mono text-[16px] font-semibold text-accent">$49</span>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Agent count */}
      <p className="font-mono text-[26px] font-semibold text-ink leading-none">
        ~{formatAgentCount(state.agentCount)}
      </p>
      <p className="text-[13px] text-tertiary mt-1 font-mono">verified contacts</p>

      {/* CTA */}
      <div className="btn-outline w-full justify-center mt-5 text-[14px] py-2.5">
        Buy CSV <ArrowRight size={14} />
      </div>
    </Link>
  )
}
