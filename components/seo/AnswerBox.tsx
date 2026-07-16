import type { ReactNode } from "react"
import { Zap } from "lucide-react"

/**
 * AEO (answer engine optimization) block: a concise, self-contained answer
 * placed near the top of a page so featured snippets and AI search engines can
 * lift it verbatim. Keep content to 2–4 factual sentences that stand alone
 * without the surrounding page.
 */
export function AnswerBox({
  children,
  label = "Quick Answer",
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <aside className="card p-5 sm:p-6 bg-accent-light/40 border-accent/30 mb-10">
      <p className="flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-accent mb-2.5">
        <Zap size={12} strokeWidth={2.5} />
        {label}
      </p>
      <div className="text-[15px] text-body leading-[1.8]">{children}</div>
    </aside>
  )
}
