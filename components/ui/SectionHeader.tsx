interface SectionHeaderProps {
  eyebrow: string
  heading: string
  subtext?: string
  centered?: boolean
}

export function SectionHeader({ eyebrow, heading, subtext, centered = false }: SectionHeaderProps) {
  return (
    <div className={`section-header ${centered ? "text-center flex flex-col items-center" : ""}`}>
      <p className="label-eyebrow">{eyebrow}</p>
      <h2 className="section-heading">{heading}</h2>
      {subtext && (
        <p className={`section-sub ${centered ? "max-w-xl" : "max-w-[560px]"}`}>
          {subtext}
        </p>
      )}
    </div>
  )
}
