import type { Metadata } from "next";
import Link from "next/link";
import BlogPostCard from "@/components/BlogPostCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getBlogPosts } from "@/lib/blog";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { siteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.blog.title,
    description: t.meta.blogDescription,
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    openGraph: {
      locale: t.meta.ogLocale,
      title: t.blog.title,
      description: t.meta.blogDescription,
      url: `${siteUrl}/blog`,
    },
  };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const posts = await getBlogPosts();

  return (
    <>
      <main className="min-h-screen bg-white px-4 pt-32 text-black dark:bg-black dark:text-white sm:px-6 md:px-8 lg:px-12">
        <SiteHeader />
        <section className="mx-auto max-w-7xl py-12">
          <div className="mb-12 flex flex-col gap-5 border-b border-zinc-200 pb-8 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
                {t.blog.title}
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                {t.blog.heroTitle}
              </h1>
            </div>
            <Link
              href="/"
              className="w-fit border-2 border-zinc-200 px-5 py-3 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
            >
              {t.blog.backHome}
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-zinc-200 px-5 py-10 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              {t.blog.empty}
            </div>
          )}
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
