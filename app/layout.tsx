import Script from "next/script"
import type { Metadata } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ScrollRevealProvider } from "@/components/layout/ScrollRevealProvider"
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
    "realtors email",
    "realtor contacts usa",
    "buy real estate agent list",
    "realtor mailing list",
    "real estate agent phone numbers",
    "licensed realtor database",
    "real estate agent CSV download",
    "realtor lead list USA",
    "real estate email database",
    "list of real estate agents email addresses",
    "find real estate agent emails and phone numbers",
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
  alternates: {
    canonical: "https://usagentleads.com",
    languages: {
      "en-US": "https://usagentleads.com",
      "x-default": "https://usagentleads.com",
    },
    types: {
      "application/rss+xml": "https://usagentleads.com/blog/feed.xml",
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
        <Toaster />
      </body>
    </html>
  )
}
