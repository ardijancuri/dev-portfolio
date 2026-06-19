import type { BlogPostSummary } from "@/lib/blog-types";
import BlogPostCard from "@/components/BlogPostCard";

export default function BlogSliderTrack({
  posts,
}: {
  posts: BlogPostSummary[];
}) {
  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-200 px-5 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        No posts published yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} variant="home" />
      ))}
    </div>
  );
}
