import Link from "next/link"
import type { BlogPost } from "@/types/blog"
import { BlogCover } from "./BlogCover"

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group card-interactive overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <BlogCover
          src={post.coverImage}
          alt={post.title}
          category={post.category}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="badge-info w-fit mb-3">{post.category}</span>

        <h3 className="text-[18px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-2">
          {post.title}
        </h3>

        <p className="text-[14px] text-tertiary leading-relaxed line-clamp-2 mb-0">
          {post.description}
        </p>

        {/* Meta */}
        <div className="border-t border-border mt-auto pt-4">
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
      </div>
    </Link>
  )
}
