import type { MDXComponents as MDXComponentsType } from "mdx/types"
import { Info, Lightbulb, AlertTriangle } from "lucide-react"

function Callout({
  type = "tip",
  title,
  children,
}: {
  type?: "tip" | "info" | "warning"
  title?: string
  children: React.ReactNode
}) {
  const styles = {
    tip: {
      wrapper: "bg-accent-light border-accent-mid",
      icon: <Lightbulb size={18} className="text-accent shrink-0 mt-0.5" />,
      defaultTitle: "Pro Tip",
    },
    info: {
      wrapper: "bg-blue-50 border-blue-200",
      icon: <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />,
      defaultTitle: "Note",
    },
    warning: {
      wrapper: "bg-amber-50 border-amber-200",
      icon: <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />,
      defaultTitle: "Warning",
    },
  }

  const s = styles[type]

  return (
    <div className={`${s.wrapper} border rounded-xl p-5 my-6`}>
      <div className="flex items-start gap-3">
        {s.icon}
        <div>
          <p className="font-semibold text-ink text-[15px] mb-1">{title || s.defaultTitle}</p>
          <div className="text-[15px] text-body leading-relaxed [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Table({ children, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  )
}

export const mdxComponents: MDXComponentsType = {
  Callout,
  table: Table,
}
