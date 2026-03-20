import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { ChevronRight } from "lucide-react"
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog"
import { generateBreadcrumbSchema, generateArticleSchema } from "@/lib/utils/seo"
import { mdxComponents } from "@/components/blog/MDXComponents"
import { BlogCover } from "@/components/blog/BlogCover"
import { ShareRow } from "@/components/blog/ShareRow"
import { BlogCard } from "@/components/blog/BlogCard"
import { BlogCTA } from "@/components/blog/BlogCTA"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const { meta } = post
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://usagentleads.com/blog/${meta.slug}`,
      languages: {
        "en-US": `https://usagentleads.com/blog/${meta.slug}`,
        "x-default": `https://usagentleads.com/blog/${meta.slug}`,
      },
    },
    openGraph: {
      title: `${meta.title} | USAgentLeads`,
      description: meta.description,
      url: `https://usagentleads.com/blog/${meta.slug}`,
      type: "article",
      publishedTime: meta.date,
      modifiedTime: meta.updatedAt || meta.date,
      authors: [meta.author],
      tags: meta.tags,
      images: [
        {
          url: `https://usagentleads.com${meta.coverImage}`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`https://usagentleads.com${meta.coverImage}`],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { meta, content } = post
  const related = getRelatedPosts(slug, meta.category)

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://usagentleads.com" },
    { name: "Blog", url: "https://usagentleads.com/blog" },
    { name: meta.title, url: `https://usagentleads.com/blog/${meta.slug}` },
  ])
  const articleSchema = generateArticleSchema(meta)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, articleSchema]) }}
      />

      <div className="bg-page min-h-screen">
        {/* Breadcrumb — full width */}
        <div className="mx-auto max-w-[720px] px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-[14px] text-tertiary pt-10 pb-6">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={14} className="text-muted" />
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
            <ChevronRight size={14} className="text-muted" />
            <span className="text-ink font-medium line-clamp-1">{meta.title}</span>
          </nav>
        </div>

        {/* Post header */}
        <div className="mx-auto max-w-[720px] px-4 sm:px-6">
          <span className="badge-info">{meta.category}</span>

          <h1
            className="text-[28px] sm:text-[36px] md:text-[40px] font-semibold text-ink
                       tracking-[-0.02em] leading-[1.15] mt-4"
          >
            {meta.title}
          </h1>

          <p className="text-[16px] sm:text-[17px] text-tertiary leading-relaxed mt-4 max-w-[600px]">
            {meta.description}
          </p>

          {/* Author & date bar */}
          <div className="flex items-center gap-3 text-[14px] font-mono text-muted border-t border-b border-border py-4 mt-6">
            <span>{meta.author}</span>
            <span>&middot;</span>
            <time dateTime={meta.date}>
              {new Date(meta.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>&middot;</span>
            <span>{meta.readingTime}</span>
          </div>

          {/* Cover image */}
          <div className="relative rounded-xl overflow-hidden my-8 aspect-[2/1]">
            <BlogCover
              src={meta.coverImage}
              alt={meta.title}
              category={meta.category}
              sizes="720px"
              priority
            />
          </div>

          {/* Article content */}
          <article className="prose">
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </article>

          {/* Share row */}
          <ShareRow title={meta.title} slug={meta.slug} />
        </div>

        {/* Related posts — full width */}
        {related.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 mb-4">
            <p className="label-eyebrow mb-6">Related Articles</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogCTA />
        </div>
      </div>
    </>
  )
}
