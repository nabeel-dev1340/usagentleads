"use client"

import { useInView } from "@/lib/hooks/useInView"
import { useCountUp } from "@/lib/hooks/useCountUp"

function StatItem({ value, suffix, label, active }: { value: number; suffix?: string; label: string; active: boolean }) {
  const count = useCountUp(value, active)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 py-2">
      <span className="font-mono text-[22px] sm:text-[30px] font-semibold text-ink leading-none">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-[13px] font-mono uppercase tracking-wide text-body mt-1">{label}</span>
    </div>
  )
}

function TextStatItem({ value, label, active }: { value: string; label: string; active: boolean }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
      style={{
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <span className="text-[16px] font-medium text-ink">{value}</span>
      <span className="text-[13px] font-mono uppercase tracking-wide text-body mt-1">{label}</span>
    </div>
  )
}

export function TrustBar({ totalCount }: { totalCount: number }) {
  const { ref, inView } = useInView()
  const count = totalCount > 0 ? totalCount : 500000

  return (
    <section
      ref={ref}
      className="bg-white border-y border-border py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-0 sm:divide-x sm:divide-border">
          <StatItem value={count} label="Total Contacts" active={inView} />
          <StatItem value={50} label="US States" active={inView} />
          <TextStatItem value="Name · Email · Phone" label="Fields Per Record" active={inView} />
          <TextStatItem value="90%+" label="Deliverability" active={inView} />
          <TextStatItem value="CAN-SPAM" label="Compliant" active={inView} />
        </div>
      </div>
    </section>
  )
}
