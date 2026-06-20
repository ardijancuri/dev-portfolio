import type { BlogPostSummary } from "@/lib/blog-types";
import { getDictionary, type Locale } from "@/lib/i18n";
import BlogPostCard from "@/components/BlogPostCard";

export default function BlogSliderTrack({
  posts,
  locale,
}: {
  posts: BlogPostSummary[];
  locale: Locale;
}) {
  const t = getDictionary(locale);

  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-200 px-5 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        {t.blog.empty}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} variant="home" locale={locale} />
      ))}
    </div>
  );
}
