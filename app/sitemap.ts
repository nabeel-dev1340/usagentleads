import type { MetadataRoute } from "next"
import { US_STATES } from "@/lib/utils/states"
import { getAllPosts } from "@/lib/blog"

const BASE_URL = "https://www.usagentleads.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: "2025-03-25",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/states`,
      lastModified: "2025-03-25",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: "2025-03-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: "2025-03-25",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: "2025-02-01",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: "2025-03-25",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: "2025-01-01",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const statePages: MetadataRoute.Sitemap = US_STATES.map((state) => ({
    url: `${BASE_URL}/states/${state.slug}`,
    lastModified: "2025-03-25",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const posts = getAllPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...statePages, ...blogPages]
}
