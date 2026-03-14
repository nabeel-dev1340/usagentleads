import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/auth/", "/purchase-success", "/login"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/llms.txt"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/llms.txt"],
      },
    ],
    sitemap: "https://usagentleads.com/sitemap.xml",
  }
}
