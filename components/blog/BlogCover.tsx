"use client"

import Image from "next/image"
import { useState } from "react"

const GRADIENTS: Record<string, string> = {
  "Lead Generation": "from-blue-600 to-indigo-700",
  "Email Marketing": "from-violet-600 to-purple-700",
  "Technology": "from-cyan-600 to-blue-700",
  "Marketing": "from-emerald-600 to-teal-700",
  "Industry Trends": "from-orange-500 to-rose-600",
  "Data & Analytics": "from-sky-600 to-indigo-600",
}

const ICONS: Record<string, string> = {
  "Lead Generation": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "Email Marketing": "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "Technology": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "Marketing": "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
  "Industry Trends": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "Data & Analytics": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
}

function GradientPlaceholder({ category }: { category: string }) {
  const gradient = GRADIENTS[category] || "from-blue-600 to-indigo-700"
  const iconPath = ICONS[category] || ICONS["Lead Generation"]

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 200">
          <defs>
            <pattern id={`dots-${category.replace(/\s/g, "")}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#dots-${category.replace(/\s/g, "")})`} />
        </svg>
      </div>

      {/* Icon + label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <svg
          className="w-10 h-10 sm:w-14 sm:h-14 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        <span className="text-white/50 text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.15em]">
          {category}
        </span>
      </div>
    </div>
  )
}

export function BlogCover({
  src,
  alt,
  category,
  priority = false,
  sizes,
  className = "object-cover",
}: {
  src?: string
  alt: string
  category: string
  priority?: boolean
  sizes?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <GradientPlaceholder category={category} />
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
      {/* Fallback underneath in case image is loading */}
    </>
  )
}
