import type { MetadataRoute } from "next"
import { US_STATES } from "@/lib/utils/states"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://usagentleads.com"

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/states`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ]

  const statePages: MetadataRoute.Sitemap = US_STATES.map((state) => ({
    url: `${baseUrl}/states/${state.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...statePages]
}
