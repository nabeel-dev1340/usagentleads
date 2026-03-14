import type { Metadata } from "next"
import type { USState } from "@/types"

const BASE_URL = "https://usagentleads.com"

export function generateStateMetadata(state: USState, cities?: string[]): Metadata {
  const count = state.agentCount.toLocaleString()
  const cityText = cities?.length ? ` Covers ${cities.slice(0, 3).join(", ")} and more.` : ""
  return {
    title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts`,
    description: `Download a verified list of ${count}+ ${state.name} real estate agents with name, email, and phone.${cityText} Instant CSV delivery. $10 one-time.`,
    keywords: [
      `${state.name} real estate agent list`,
      `${state.code} realtor email list`,
      `buy ${state.name} agent contacts`,
      `${state.name} realtor database`,
      `${state.name} real estate agent email addresses`,
    ],
    alternates: {
      canonical: `${BASE_URL}/states/${state.slug}`,
      languages: {
        "en-US": `${BASE_URL}/states/${state.slug}`,
        "x-default": `${BASE_URL}/states/${state.slug}`,
      },
    },
    other: {
      "geo.region": `US-${state.code}`,
      "geo.placename": state.name,
    },
    openGraph: {
      title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts | USAgentLeads`,
      description: `Download a verified list of ${count}+ ${state.name} real estate agents with name, email, and phone.${cityText} Instant CSV delivery. $10 one-time.`,
      url: `${BASE_URL}/states/${state.slug}`,
      type: "website",
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: "USAgentLeads — Real Estate Agent Contact Database" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${state.name} Real Estate Agent Email List — ${count}+ Contacts`,
      description: `Download a verified list of ${count}+ ${state.name} real estate agents.${cityText} Instant CSV delivery. $10 one-time.`,
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
    image: "https://usagentleads.com/opengraph-image",
    brand: {
      "@type": "Brand",
      name: "USAgentLeads",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "124",
      bestRating: "5",
      worstRating: "1",
    },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: "James H.",
      },
      reviewBody: "Accurate and up-to-date agent contacts. Saved me hours of manual research.",
    },
    offers: {
      "@type": "Offer",
      price: "10.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://usagentleads.com/states/${state.slug}`,
      priceValidUntil: "2027-12-31",
      seller: {
        "@type": "Organization",
        name: "USAgentLeads",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: "0",
            maxValue: "0",
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: "0",
            maxValue: "0",
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    },
  }
}

export function generateDatasetSchema(state: USState) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${state.name} Real Estate Agent Contact List`,
    description: `Verified contact data for ${state.agentCount.toLocaleString()}+ licensed real estate agents in ${state.name}, including name, email, and phone number.`,
    url: `${BASE_URL}/states/${state.slug}`,
    creator: {
      "@type": "Organization",
      name: "USAgentLeads",
      url: BASE_URL,
    },
    spatialCoverage: {
      "@type": "Place",
      name: state.name,
      geo: {
        "@type": "GeoShape",
        addressCountry: "US",
      },
    },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${BASE_URL}/states/${state.slug}`,
    },
    variableMeasured: ["Full Name", "Email Address", "Phone Number", "State"],
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
