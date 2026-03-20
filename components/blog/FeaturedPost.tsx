import Link from "next/link"
import type { BlogPost } from "@/types/blog"
import { BlogCover } from "./BlogCover"

export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group card-interactive overflow-hidden block mb-8"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-0">
        {/* Cover image */}
        <div className="relative overflow-hidden aspect-[16/9] lg:aspect-auto lg:min-h-[320px]">
          <BlogCover
            src={post.coverImage}
            alt={post.title}
            category={post.category}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="badge-info">{post.category}</span>
            <span className="text-[13px] font-mono text-accent font-medium">Latest</span>
          </div>

          <h2 className="text-[22px] sm:text-[28px] font-semibold text-ink leading-[1.2] tracking-[-0.02em] group-hover:text-accent transition-colors mb-3">
            {post.title}
          </h2>

          <p className="text-[15px] text-tertiary leading-relaxed line-clamp-3 mb-6">
            {post.description}
          </p>

          <div className="flex items-center gap-4">
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

          <p className="mt-6 text-[14px] font-medium text-accent group-hover:underline">
            Read article &rarr;
          </p>
        </div>
      </div>
    </Link>
  )
}
