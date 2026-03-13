import type { Metadata } from "next"
import Link from "next/link"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Purchase Confirmed",
  robots: { index: false, follow: false },
}

export default function PurchaseSuccessPage() {
  return (
    <div className="bg-page min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="card max-w-lg w-full p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg border border-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-[24px] font-semibold text-ink">
          Purchase Confirmed!
        </h1>
        <p className="mt-3 text-[15px] text-tertiary leading-relaxed">
          Check your email for your download link. It will arrive within a few minutes.
        </p>
        <p className="mt-2 text-[14px] text-tertiary">
          The download link expires in 48 hours, so be sure to download your file soon.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/states" className="btn-primary">
            Browse More States <ArrowRight size={14} />
          </Link>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
