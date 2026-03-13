import type { Metadata } from "next"
import type { USState } from "@/types"

const BASE_URL = "https://usagentleads.com"

export function generateStateMetadata(state: USState): Metadata {
  const count = state.agentCount.toLocaleString()
  return {
    title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts`,
    description: `Download a verified list of ${count}+ ${state.name} real estate agents with name, email, and phone. Instant CSV delivery. $10 one-time.`,
    alternates: {
      canonical: `${BASE_URL}/states/${state.slug}`,
    },
    openGraph: {
      title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts | USAgentLeads`,
      description: `Download a verified list of ${count}+ ${state.name} real estate agents with name, email, and phone. Instant CSV delivery. $10 one-time.`,
      url: `${BASE_URL}/states/${state.slug}`,
      type: "website",
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: "USAgentLeads — Real Estate Agent Contact Database" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts`,
      description: `Download a verified list of ${count}+ ${state.name} real estate agents. Instant CSV delivery. $10 one-time.`,
      images: [`${BASE_URL}/twitter-image`],
    },
  }
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateProductSchema(state: USState) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${state.name} Real Estate Agent Email List`,
    description: `Verified list of ${state.agentCount.toLocaleString()}+ ${state.name} real estate agents with name, email, and phone.`,
    offers: {
      "@type": "Offer",
      price: "10.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }
}

export function generateFAQSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}
