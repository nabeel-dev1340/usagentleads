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
  name: "USAgentLeads",
  url: "https://www.usagentleads.com",
  inLanguage: "en-US",
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "USAgentLeads",
  url: "https://www.usagentleads.com",
  logo: "https://www.usagentleads.com/icon-512.png",
  image: "https://www.usagentleads.com/opengraph-image",
  description:
    "Verified real estate agent contact database covering all 50 US states. 553,778+ contacts with name, email, and phone.",
  sameAs: [] as string[],
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
}

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "USAgentLeads Real Estate Agent Database",
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
      reviewBody: "The full database at $99 is incredible value. We've used other providers charging $500+ for less data.",
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
