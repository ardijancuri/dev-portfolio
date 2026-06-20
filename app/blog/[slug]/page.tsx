import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import MarkdownExcerpt from "@/components/MarkdownExcerpt";
import SiteHeader from "@/components/SiteHeader";
import { getBlogPostBySlug } from "@/lib/blog";
import {
  formatPostDate,
  getReadingTime,
  stripMarkdownText,
} from "@/lib/blog-utils";
import { getDictionary, getLocalizedPost } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { siteName, siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: t.post.notFound,
    };
  }

  const localizedPost = getLocalizedPost(post, locale);
  const plainExcerpt = stripMarkdownText(localizedPost.excerpt);

  return {
    title: localizedPost.title,
    description: plainExcerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      siteName,
      locale: t.meta.ogLocale,
      title: localizedPost.title,
      description: plainExcerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      images: post.hero_image_url
        ? [
            {
              url: post.hero_image_url,
              alt: localizedPost.title,
            },
          ]
        : undefined,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: localizedPost.title,
      description: plainExcerpt,
      images: post.hero_image_url ? [post.hero_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const localizedPost = getLocalizedPost(post, locale);

  return (
    <main className="min-h-screen bg-white pt-24 text-black dark:bg-black dark:text-white">
      <SiteHeader />
      <article>
        <header className="px-4 pb-10 pt-12 sm:px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
            >
              {t.post.backToBlog}
            </Link>
            <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
              {formatPostDate(post.created_at, locale)} / {getReadingTime(localizedPost.content, locale)}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {localizedPost.title}
            </h1>
            <MarkdownExcerpt className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {localizedPost.excerpt}
            </MarkdownExcerpt>
            <p className="mt-5 text-sm font-medium text-zinc-500 dark:text-zinc-500">
              {t.post.by} {post.author}
            </p>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <figure className="mx-auto max-w-5xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.hero_image_url}
              alt=""
              loading="eager"
              decoding="async"
              className="h-auto w-full"
            />
          </figure>
        </div>

        <div className="px-4 py-12 sm:px-6 md:px-8 lg:px-12">
          <div className="blog-markdown mx-auto max-w-3xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {localizedPost.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
