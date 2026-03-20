import type { Metadata } from "next"
import { getAllPosts, getAllCategories } from "@/lib/blog"
import { BlogGrid } from "@/components/blog/BlogGrid"

export const metadata: Metadata = {
  title: "Real Estate Marketing Blog — Tips, Strategies & Insights",
  description:
    "Actionable marketing strategies, email templates, and lead generation tips for real estate professionals and companies targeting the real estate industry.",
  alternates: {
    canonical: "https://usagentleads.com/blog",
    languages: {
      "en-US": "https://usagentleads.com/blog",
      "x-default": "https://usagentleads.com/blog",
    },
  },
  openGraph: {
    title: "Real Estate Marketing Blog | USAgentLeads",
    description:
      "Actionable marketing strategies, email templates, and lead generation tips for real estate professionals.",
    url: "https://usagentleads.com/blog",
    type: "website",
    images: [
      {
        url: "https://usagentleads.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "USAgentLeads Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Marketing Blog | USAgentLeads",
    description:
      "Actionable marketing strategies, email templates, and lead generation tips for real estate professionals.",
    images: ["https://usagentleads.com/twitter-image"],
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  return (
    <div className="bg-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="pt-20 pb-12 border-b border-border">
          <p className="label-eyebrow mb-3">Blog</p>
          <h1 className="section-heading">Real Estate Marketing Insights</h1>
          <p className="section-sub mt-3 max-w-[540px]">
            Strategies, templates, and guides to help you reach real estate
            professionals and grow your business.
          </p>
        </div>

        <BlogGrid posts={posts} categories={categories} />
      </div>
    </div>
  )
}
