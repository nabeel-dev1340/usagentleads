"use client"

import { Loader2, ArrowRight } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function SubscribeButton({
  className,
  purchaseType = "subscription",
  label = "Subscribe",
}: {
  className?: string
  purchaseType?: "subscription" | "subscription_api"
  label?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login?next=/pricing"
        return
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType,
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
      onClick={handleSubscribe}
      disabled={loading}
      className={`btn-outline justify-center text-[15px] py-3.5 ${className ?? ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label} <ArrowRight size={14} />
        </>
      )}
    </button>
  )
}
