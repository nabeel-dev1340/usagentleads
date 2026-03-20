"use client"

import { useState } from "react"
import type { BlogPost } from "@/types/blog"
import { BlogCard } from "./BlogCard"
import { FeaturedPost } from "./FeaturedPost"

interface BlogGridProps {
  posts: BlogPost[]
  categories: string[]
}

export function BlogGrid({ posts, categories }: BlogGridProps) {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  const [featured, ...rest] = filtered

  return (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mt-8 mb-10">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all duration-150 cursor-pointer ${
              activeCategory === cat
                ? "bg-accent text-white shadow-sm"
                : "bg-white border border-border text-body hover:border-accent hover:text-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {featured && <FeaturedPost post={featured} />}

      {/* Card grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-tertiary text-[15px]">No posts in this category yet.</p>
        </div>
      )}
    </>
  )
}
