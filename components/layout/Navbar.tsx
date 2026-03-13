"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Menu, X, LogOut, LayoutDashboard, CreditCard } from "lucide-react"
import { LogoIcon } from "@/components/ui/Logo"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
  }

  const navLinks = [
    { href: "/states", label: "Browse States" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  const initials = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "border-b border-border bg-white/80 backdrop-blur-md"
            : "border-b border-transparent bg-white"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-[19px] font-semibold tracking-tight">
            <LogoIcon className="h-7 w-7 text-accent" />
            <span>
              <span className="text-ink">USAgent</span>
              <span className="text-accent">Leads</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-tertiary transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-mono font-medium text-white"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-body transition-colors hover:bg-subtle hover:text-ink"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <a
                        href="https://app.lemonsqueezy.com/my-orders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-body transition-colors hover:bg-subtle hover:text-ink"
                      >
                        <CreditCard className="h-4 w-4" />
                        Manage Subscription
                      </a>
                      <div className="my-1 h-px bg-border" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-body transition-colors hover:bg-subtle hover:text-danger"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="btn-primary text-[14px] px-5 py-2.5"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-tertiary transition-colors hover:text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2 text-[19px] font-semibold tracking-tight" onClick={() => setMobileOpen(false)}>
              <LogoIcon className="h-7 w-7 text-accent" />
              <span>
                <span className="text-ink">USAgent</span>
                <span className="text-accent">Leads</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-tertiary transition-colors hover:text-ink"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center gap-8 pt-24">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[22px] font-medium text-ink transition-colors hover:text-accent"
                style={{
                  animation: `fade-in-up 0.4s ease-out forwards`,
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px w-16 bg-border" />
            <div
              style={{
                animation: `fade-in-up 0.4s ease-out forwards`,
                animationDelay: `${navLinks.length * 80}ms`,
                animationFillMode: "backwards",
              }}
            >
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false) }}
                  className="text-lg text-tertiary transition-colors hover:text-ink"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { handleSignIn(); setMobileOpen(false) }}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
