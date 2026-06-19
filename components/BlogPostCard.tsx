import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog-types";
import { formatPostDate, getReadingTime } from "@/lib/blog-utils";

export default function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col border-2 border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg dark:border-zinc-800 dark:bg-black dark:hover:border-white"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt=""
            fill
            sizes="(min-width: 1536px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
            Blog
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-500">
          <span>{formatPostDate(post.created_at)}</span>
          <span>{getReadingTime(post.content)}</span>
        </div>
        <h3 className="mb-3 text-xl font-bold leading-tight text-black transition-colors group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-400 sm:text-2xl">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
