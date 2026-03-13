"use client"

import { useEffect } from "react"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide global navbar and footer on the dashboard
    const header = document.querySelector("header.sticky") as HTMLElement | null
    const footer = document.querySelector("footer") as HTMLElement | null
    const main = document.querySelector("main") as HTMLElement | null

    if (header) header.style.display = "none"
    if (footer) footer.style.display = "none"
    if (main) main.style.height = "100vh"

    return () => {
      if (header) header.style.display = ""
      if (footer) footer.style.display = ""
      if (main) main.style.height = ""
    }
  }, [])

  return <>{children}</>
}
