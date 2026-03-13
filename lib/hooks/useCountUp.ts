"use client"

import { useEffect, useState } from "react"

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return

    let start: number | null = null
    let rafId: number

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      setValue(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, active, duration])

  return value
}
