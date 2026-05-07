"use client"

import dynamic from "next/dynamic"

const SupportWidget = dynamic(
  () => import("./SupportWidget").then(m => ({ default: m.SupportWidget })),
  { ssr: false },
)

export function SupportWidgetLazy() {
  return <SupportWidget />
}
