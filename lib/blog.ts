import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { BlogPost } from "@/types/blog"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

function calculateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function parseFrontmatter(slug: string): { meta: BlogPost; content: string } | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    meta: {
      title: data.title,
      description: data.description,
      date: data.date,
      updatedAt: data.updatedAt,
      slug: data.slug || slug,
      coverImage: data.coverImage,
      category: data.category,
      tags: data.tags || [],
      author: data.author || "USAgentLeads Team",
      published: data.published !== false,
      readingTime: calculateReadingTime(content),
      faqs: data.faqs || undefined,
    },
    content,
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const parsed = parseFrontmatter(slug)
      return parsed?.meta ?? null
    })
    .filter((post): post is BlogPost => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): { meta: BlogPost; content: string } | null {
  return parseFrontmatter(slug)
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set(posts.map((p) => p.category))
  return Array.from(categories).sort()
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit)
}
