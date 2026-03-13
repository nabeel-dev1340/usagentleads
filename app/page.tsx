import { HeroSection } from "@/components/home/HeroSection"
import { TrustBar } from "@/components/home/TrustBar"
import { HowItWorks } from "@/components/home/HowItWorks"
import { PricingCards } from "@/components/home/PricingCards"
import { StatsCTA } from "@/components/home/StatsCTA"
import { FAQSection } from "@/components/home/FAQSection"

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "USAgentLeads",
  url: "https://usagentleads.com",
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "USAgentLeads",
  url: "https://usagentleads.com",
  description:
    "Verified US real estate agent contact data. CSV download. All 50 states.",
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, organizationSchema]),
        }}
      />
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <PricingCards />
      <StatsCTA />
      <FAQSection />
    </>
  )
}
