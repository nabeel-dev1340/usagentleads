import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getAllPosts, getAllCategories } from "@/lib/blog"
import { BlogCard } from "@/components/blog/BlogCard"
import { generateBreadcrumbSchema } from "@/lib/utils/seo"

interface Props {
  params: Promise<{ category: string }>
}

const CATEGORY_MAP: Record<string, string> = {
  "email-marketing": "Email Marketing",
  "lead-generation": "Lead Generation",
  "marketing": "Marketing",
  "technology": "Technology",
  "market-data": "Market Data",
}

function slugToCategory(slug: string): string | undefined {
  return CATEGORY_MAP[slug]
}

function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({ category: categoryToSlug(cat) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const categoryName = slugToCategory(slug)
  if (!categoryName) return {}

  return {
    title: `${categoryName} for Real Estate | Blog`,
    description: `Articles about ${categoryName.toLowerCase()} for real estate professionals and companies targeting agents. Tips, strategies, and guides from USAgentLeads.`,
    alternates: {
      canonical: `https://www.usagentleads.com/blog/category/${slug}`,
    },
    openGraph: {
      title: `${categoryName} for Real Estate | Blog | USAgentLeads`,
      description: `Articles about ${categoryName.toLowerCase()} for real estate professionals and companies targeting agents.`,
      url: `https://www.usagentleads.com/blog/category/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const categoryName = slugToCategory(slug)
  if (!categoryName) notFound()

  const allPosts = getAllPosts()
  const posts = allPosts.filter((p) => categoryToSlug(p.category) === slug)

  if (posts.length === 0) notFound()

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.usagentleads.com" },
    { name: "Blog", url: "https://www.usagentleads.com/blog" },
    { name: categoryName, url: `https://www.usagentleads.com/blog/category/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="bg-page min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={14} className="text-muted" />
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
            <ChevronRight size={14} className="text-muted" />
            <span className="text-ink font-medium">{categoryName}</span>
          </nav>

          {/* Header */}
          <div className="pb-12 border-b border-border">
            <p className="label-eyebrow mb-3">{categoryName}</p>
            <h1 className="section-heading">{categoryName} for Real Estate</h1>
            <p className="section-sub mt-3 max-w-lg">
              Articles, guides, and strategies about {categoryName.toLowerCase()} for real estate professionals.
            </p>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
