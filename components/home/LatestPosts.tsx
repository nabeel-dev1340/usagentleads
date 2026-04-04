import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { BlogPost } from "@/types/blog"

export function LatestPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="bg-white py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">Blog</p>
          <h2 className="section-heading">Latest from the Blog</h2>
          <p className="section-sub max-w-xl">
            Strategies, templates, and guides for reaching real estate agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto reveal-stagger">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-interactive p-6 flex flex-col group"
            >
              <span className="badge-info w-fit mb-3">{post.category}</span>
              <h3 className="text-[17px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-[14px] text-tertiary leading-relaxed line-clamp-2 mb-0 flex-1">
                {post.description}
              </p>
              <div className="border-t border-border mt-4 pt-4">
                <p className="text-[13px] font-mono text-muted">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="mx-2">&middot;</span>
                  {post.readingTime}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 reveal">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-accent hover:underline"
          >
            View all articles
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
