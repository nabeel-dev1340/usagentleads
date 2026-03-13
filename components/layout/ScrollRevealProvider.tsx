"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollRevealProvider() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    // Small delay to let the DOM settle after client-side navigation
    const timeout = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-stagger:not(.visible)')
      if (els.length === 0) return

      observer = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer?.unobserve(e.target)
          }
        }),
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      )
      els.forEach(el => observer!.observe(el))
    }, 50)

    return () => {
      clearTimeout(timeout)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
