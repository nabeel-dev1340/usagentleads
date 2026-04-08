export const revalidate = 3600

import { HeroSection } from "@/components/home/HeroSection"
import { TrustBar } from "@/components/home/TrustBar"
import { WhoIsThisFor } from "@/components/home/WhoIsThisFor"
import { HowItWorks } from "@/components/home/HowItWorks"
import { UseCases } from "@/components/home/UseCases"
import { PricingCards } from "@/components/home/PricingCards"
import { ApiSection } from "@/components/home/ApiSection"
import { CompetitorComparison } from "@/components/home/CompetitorComparison"
import { Testimonials } from "@/components/home/Testimonials"
import { DataSources } from "@/components/home/DataSources"
import { StatsCTA } from "@/components/home/StatsCTA"
import { FAQSection } from "@/components/home/FAQSection"
import { LatestPosts } from "@/components/home/LatestPosts"
import { getTotalCount } from "@/lib/supabase/server"
import { getAllPosts } from "@/lib/blog"

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.usagentleads.com/#website",
  name: "USAgentLeads",
  url: "https://www.usagentleads.com",
  inLanguage: "en-US",
  description:
    "Verified real estate agent contact database covering all 50 US states. 553,778+ contacts with name, email, and phone — instant CSV download or REST API.",
  publisher: {
    "@id": "https://www.usagentleads.com/#organization",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.usagentleads.com/#organization",
  name: "USAgentLeads",
  legalName: "USAgentLeads",
  url: "https://www.usagentleads.com",
  logo: {
    "@type": "ImageObject",
    url: "https://www.usagentleads.com/icon-512.png",
    width: 512,
    height: 512,
  },
  image: "https://www.usagentleads.com/opengraph-image",
  description:
    "USAgentLeads is a B2B data provider offering verified real estate agent contact databases for all 50 US states. 553,778+ contacts with name, email, and phone.",
  foundingDate: "2024",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    value: "1-10",
  },
  knowsAbout: [
    "Real estate agent databases",
    "Realtor email lists",
    "B2B real estate data",
    "Real estate lead generation",
    "Real estate marketing",
    "CRM data for real estate",
    "Real estate agent contact information",
    "MLS data",
    "Real estate cold outreach",
  ],
  areaServed: {
    "@type": "Country",
    name: "United States",
    sameAs: "https://en.wikipedia.org/wiki/United_States",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@usagentleads.com",
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: "English",
  },
  makesOffer: [
    {
      "@type": "Offer",
      name: "State Pack",
      description: "Single state real estate agent email list CSV download",
      price: "49.00",
      priceCurrency: "USD",
      url: "https://www.usagentleads.com/states",
    },
    {
      "@type": "Offer",
      name: "Full Database",
      description: "All 50 states, 553K+ real estate agent contacts CSV download",
      price: "149.00",
      priceCurrency: "USD",
      url: "https://www.usagentleads.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro Dashboard",
      description: "Searchable web interface to browse and filter 553K+ real estate agents",
      price: "49.00",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "49.00",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
      url: "https://www.usagentleads.com/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro API",
      description: "REST API access to query 553K+ real estate agent contacts programmatically",
      price: "79.00",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "79.00",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
      url: "https://www.usagentleads.com/docs",
    },
  ],
}

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.usagentleads.com/#product",
  name: "USAgentLeads Real Estate Agent Database",
  brand: {
    "@id": "https://www.usagentleads.com/#organization",
  },
  category: "B2B Data / Real Estate Technology",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "124",
    bestRating: "5",
    worstRating: "1",
  },
  review: [
    {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Person", name: "David R." },
      reviewBody: "We needed a reliable agent database for our real estate SaaS clients. The data quality is solid and the price can't be beat.",
    },
    {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Person", name: "Jessica M." },
      reviewBody: "I bought the Florida state pack and had it in my CRM within 10 minutes. Already booked 3 meetings from my first outreach campaign.",
    },
    {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Person", name: "Kevin L." },
      reviewBody: "The full database at $149 is incredible value. We've used other providers charging $500+ for less data.",
    },
  ],
}

export default async function Home() {
  const totalCount = await getTotalCount()
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, organizationSchema, reviewSchema]),
        }}
      />
      <HeroSection totalCount={totalCount} />
      <TrustBar totalCount={totalCount} />
      <WhoIsThisFor />
      <HowItWorks />
      <UseCases />
      <PricingCards totalCount={totalCount} />
      <ApiSection />
      <CompetitorComparison />
      <Testimonials />
      <LatestPosts posts={latestPosts} />
      <DataSources />
      <StatsCTA />
      <FAQSection totalCount={totalCount} />
    </>
  )
}
