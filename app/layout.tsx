import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ScrollRevealProvider } from "@/components/layout/ScrollRevealProvider"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
  metadataBase: new URL("https://usagentleads.com"),
  title: {
    default: "USAgentLeads — Real Estate Agent Contact Database",
    template: "%s | USAgentLeads",
  },
  description:
    "Buy verified US real estate agent contacts by state or nationwide. Name, email, phone. CSV download. Starting at $10.",
  keywords: [
    "realtor email list",
    "real estate agent database",
    "real estate agent email list",
    "realtor contacts usa",
  ],
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
    title: "USAgentLeads — Real Estate Agent Contact Database",
    description:
      "Buy verified US real estate agent contacts by state or nationwide. Name, email, phone. CSV download. Starting at $10.",
  },
  twitter: {
    card: "summary_large_image",
    title: "USAgentLeads — Real Estate Agent Contact Database",
    description:
      "Buy verified US real estate agent contacts by state or nationwide. CSV download. Starting at $10.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://usagentleads.com" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-page text-ink`}>
        <ScrollRevealProvider />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
