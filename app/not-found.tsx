import type { Metadata } from "next"
import Link from "next/link"
import { Home, MapPin, BookOpen, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="bg-page min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-lg px-4 py-28 text-center">
        <p className="font-mono text-[64px] font-bold text-accent mb-4">404</p>
        <h1 className="text-[24px] font-semibold text-ink mb-3">
          Page Not Found
        </h1>
        <p className="text-[15px] text-tertiary mb-10">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border bg-white hover:border-accent hover:bg-accent-light transition-all text-[14px] font-medium text-ink"
          >
            <Home size={15} />
            Home
          </Link>
          <Link
            href="/states"
            className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border bg-white hover:border-accent hover:bg-accent-light transition-all text-[14px] font-medium text-ink"
          >
            <MapPin size={15} />
            Browse States
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border bg-white hover:border-accent hover:bg-accent-light transition-all text-[14px] font-medium text-ink"
          >
            <BookOpen size={15} />
            Blog
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border bg-white hover:border-accent hover:bg-accent-light transition-all text-[14px] font-medium text-ink"
          >
            <CreditCard size={15} />
            Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
