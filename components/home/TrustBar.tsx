"use client"

import { useInView } from "@/lib/hooks/useInView"
import { useCountUp } from "@/lib/hooks/useCountUp"

function StatItem({ value, suffix, label, active }: { value: number; suffix?: string; label: string; active: boolean }) {
  const count = useCountUp(value, active)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 py-2">
      <span className="font-mono text-[30px] font-semibold text-ink leading-none">
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

export function TrustBar() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref}
      className="bg-white border-y border-border py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center divide-x divide-border">
          <StatItem value={500847} label="Total Contacts" active={inView} />
          <StatItem value={50} label="US States" active={inView} />
          <TextStatItem value="Name · Email · Phone" label="Fields Per Record" active={inView} />
          <TextStatItem value="< 5 min" label="Avg. Delivery" active={inView} />
          <TextStatItem value="CAN-SPAM" label="Compliant" active={inView} />
        </div>
      </div>
    </section>
  )
}
