import Script from "next/script"
import type { Metadata } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SupportWidget } from "@/components/layout/SupportWidget"
import { ScrollRevealProvider } from "@/components/layout/ScrollRevealProvider"
import { CURRENT_YEAR } from "@/lib/utils/states"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usagentleads.com"),
  title: {
    default: `553K+ Real Estate Agent Emails & Phones ${CURRENT_YEAR} — Instant Download`,
    template: "%s | USAgentLeads",
  },
  description:
    `${CURRENT_YEAR} verified database of 553K+ realtor emails and phone numbers across all 50 states. Download any state as CSV in under 60 seconds — from $49. Free sample available.`,
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "USAgentLeads",
    title: `553K+ Real Estate Agent Emails & Phones ${CURRENT_YEAR} — Instant Download`,
    description:
      `${CURRENT_YEAR} verified database of 553K+ realtor emails and phone numbers across all 50 states. Download any state as CSV in under 60 seconds — from $49. Free sample available.`,
    url: "https://www.usagentleads.com",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "553K+ Real Estate Agent Emails & Phones — Instant Download",
    description:
      "553K+ verified realtor emails and phone numbers across all 50 states. Download any state as CSV in under 60 seconds — from $49.",
    images: ["https://www.usagentleads.com/twitter-image"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.usagentleads.com",
    languages: {
      "en-US": "https://www.usagentleads.com",
      "x-default": "https://www.usagentleads.com",
    },
    types: {
      "application/rss+xml": "https://www.usagentleads.com/blog/feed.xml",
    },
  },
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
    "content-language": "en-US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-US" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://app.lemonsqueezy.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T91HEN5X72" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T91HEN5X72');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-page text-ink">
        <ScrollRevealProvider />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <SupportWidget />
        <Toaster />
      </body>
    </html>
  )
}
