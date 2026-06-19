import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DeleteBlogPostButton from "@/components/DeleteBlogPostButton";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/admin";
import { getBlogPosts } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog-utils";

export const metadata: Metadata = {
  title: "Blog Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPage() {
  await requireAdmin("/admin/blog");
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-white px-4 pt-32 text-black dark:bg-black dark:text-white sm:px-6 md:px-8 lg:px-12">
      <SiteHeader />
      <section className="mx-auto max-w-7xl py-12">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-zinc-200 pb-8 dark:border-zinc-800 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
              Admin
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Blog posts
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Review published posts, update Markdown content, replace hero
              images, or remove posts from the live blog.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              New post
            </Link>
            <LogoutButton />
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="border-y border-zinc-200 dark:border-zinc-800">
            {posts.map((post) => (
              <article
                key={post.id}
                className="grid gap-5 border-b border-zinc-200 py-6 last:border-b-0 dark:border-zinc-800 md:grid-cols-[10rem_1fr_auto] md:items-center"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 md:aspect-square">
                  {post.hero_image_url ? (
                    <Image
                      src={post.hero_image_url}
                      alt=""
                      fill
                      sizes="10rem"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                      Blog
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-500">
                    <span>Published {formatPostDate(post.created_at)}</span>
                    <span>Updated {formatPostDate(post.updated_at)}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">
                    /blog/{post.slug}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 md:justify-end">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
                  >
                    Edit
                  </Link>
                  <DeleteBlogPostButton postId={post.id} title={post.title} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-200 px-5 py-10 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
            No posts published yet.
          </div>
        )}
      </section>
    </main>
  );
}
