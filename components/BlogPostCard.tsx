import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog-types";
import { formatPostDate, getReadingTime } from "@/lib/blog-utils";
import MarkdownExcerpt from "@/components/MarkdownExcerpt";

export default function BlogPostCard({
  post,
  variant = "default",
}: {
  post: BlogPostSummary;
  variant?: "default" | "home";
}) {
  const isHomeVariant = variant === "home";

  const postHref = `/blog/${post.slug}`;

  return (
    <article
      className={
        isHomeVariant
          ? "group flex h-full flex-col border-2 border-zinc-200 bg-white transition-colors duration-200 hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white"
          : "group flex h-full flex-col border-2 border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg dark:border-zinc-800 dark:bg-black dark:hover:border-white"
      }
    >
      <Link
        href={postHref}
        className="relative aspect-[16/10] overflow-hidden border-b-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        aria-label={post.title}
      >
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt=""
            fill
            sizes="(min-width: 1536px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 92vw"
            className={
              isHomeVariant
                ? "object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                : "object-cover transition-transform duration-500 group-hover:scale-105"
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
            Blog
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-500">
          <span>{formatPostDate(post.created_at)}</span>
          <span>{getReadingTime(post.content)}</span>
        </div>
        <Link href={postHref} className="mb-3 block">
          <h3
            className={
              isHomeVariant
                ? "text-xl font-bold leading-tight text-black dark:text-white sm:text-2xl"
                : "text-xl font-bold leading-tight text-black transition-colors group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-400 sm:text-2xl"
            }
          >
            {post.title}
          </h3>
        </Link>
        <MarkdownExcerpt className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          {post.excerpt}
        </MarkdownExcerpt>
      </div>
    </article>
  );
}
