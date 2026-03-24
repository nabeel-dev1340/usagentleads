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
import { getTotalCount } from "@/lib/supabase/server"

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "USAgentLeads",
  url: "https://usagentleads.com",
  inLanguage: "en-US",
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "USAgentLeads",
  url: "https://usagentleads.com",
  logo: "https://usagentleads.com/icon-512.png",
  image: "https://usagentleads.com/opengraph-image",
  description:
    "Verified US real estate agent contact data. CSV download. All 50 states.",
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

export default async function Home() {
  const totalCount = await getTotalCount()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, organizationSchema]),
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
      <DataSources />
      <StatsCTA />
      <FAQSection totalCount={totalCount} />
    </>
  )
}
