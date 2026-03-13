"use client"

import { Loader2, ArrowRight } from "lucide-react"
import { useState } from "react"

interface BuyStateButtonProps {
  stateCode: string
  stateName: string
  className?: string
}

export function BuyStateButton({ stateCode, stateName, className }: BuyStateButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType: "state",
          stateCode,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`btn-primary justify-center text-[15px] py-3.5 ${className ?? ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Buy {stateName} Data <ArrowRight size={14} />
        </>
      )}
    </button>
  )
}
