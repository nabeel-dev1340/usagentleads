import Script from "next/script"
import type { Metadata } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SupportWidgetLazy } from "@/components/layout/SupportWidgetLazy"
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
  metadataBase: new URL("https://www.usagentleads.com"),
  title: {
    default: `USA Realtors Email & Phone Database — 889K+ Real Estate Agents`,
    template: "%s | USAgentLeads",
  },
  description:
    `Built for marketers, agencies, and investors who need accurate, affordable USA realtor contact data. 889K+ verified emails & phone numbers across all 50 states — download by state from $49.`,
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
    title: `USA Realtors Email & Phone Database — 889K+ Real Estate Agents`,
    description:
      `Built for marketers, agencies, and investors who need accurate, affordable USA realtor contact data. 889K+ verified emails & phone numbers across all 50 states — download by state from $49.`,
    url: "https://www.usagentleads.com",
    images: [{ url: "https://www.usagentleads.com/opengraph-image", width: 1200, height: 630, alt: "USAgentLeads - Real Estate Agent Contact Database" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "USA Realtors Email & Phone Database — 889K+ Real Estate Agents",
    description:
      "Built for marketers, agencies, and investors who need accurate, affordable USA realtor contact data. 889K+ verified emails & phone numbers across all 50 states — download by state from $49.",
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T91HEN5X72" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T91HEN5X72');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1626548381755558');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-page text-ink">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1626548381755558&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ScrollRevealProvider />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <SupportWidgetLazy />
        <Toaster />
      </body>
    </html>
  )
}
