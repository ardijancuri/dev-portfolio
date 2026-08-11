import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import BlogHeroMedia from "@/components/BlogHeroMedia";
import MarkdownExcerpt from "@/components/MarkdownExcerpt";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SocialShareButtons from "@/components/SocialShareButtons";
import { getAdjacentBlogPosts, getBlogPostBySlug } from "@/lib/blog";
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
  const adjacentPosts = await getAdjacentBlogPosts(slug);

  if (!post) {
    notFound();
  }

  const localizedPost = getLocalizedPost(post, locale);
  const previousPost = adjacentPosts.previous
    ? getLocalizedPost(adjacentPosts.previous, locale)
    : null;
  const nextPost = adjacentPosts.next
    ? getLocalizedPost(adjacentPosts.next, locale)
    : null;
  const hasPreviousAndNext = Boolean(
    adjacentPosts.previous && adjacentPosts.next,
  );
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <>
      <main className="min-h-screen bg-white pt-24 text-black dark:bg-black dark:text-white">
        <SiteHeader />
        <article>
          <header className="px-4 pb-10 pt-12 sm:px-6 md:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/blog"
                  className="inline-flex border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-800 dark:text-white dark:hover:border-white dark:focus-visible:outline-white"
                >
                  {t.post.backToBlog}
                </Link>
                <SocialShareButtons
                  title={localizedPost.title}
                  url={postUrl}
                />
              </div>
              <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
                {formatPostDate(post.created_at, locale)} /{" "}
                {getReadingTime(localizedPost.content, locale)}
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">
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
            {post.project_link_label && post.project_link_url ? (
              <div className="mx-auto mb-5 flex max-w-5xl">
                <a
                  href={post.project_link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border-2 border-black bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:focus-visible:outline-white"
                >
                  {post.project_link_label}
                </a>
              </div>
            ) : null}
            <BlogHeroMedia
              src={post.hero_image_url}
              sliderSources={post.hero_slider_image_urls}
              title={localizedPost.title}
              mode={post.hero_media_mode}
              websitePreviewLabel={t.post.websitePreview}
              scrollHint={t.post.scrollToExplore}
            />
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

            {adjacentPosts.previous || adjacentPosts.next ? (
              <nav
                aria-label="Adjacent blog posts"
                className="mx-auto mt-14 grid max-w-3xl gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:grid-cols-2 sm:gap-0"
              >
                {adjacentPosts.previous && previousPost ? (
                  <Link
                    href={`/blog/${adjacentPosts.previous.slug}`}
                    className={`group flex flex-col text-left transition-colors ${
                      hasPreviousAndNext ? "sm:pr-8" : ""
                    }`}
                  >
                    <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-500">
                      {t.post.previous}
                    </span>
                    <span className="mt-4 text-xl font-bold leading-tight text-black transition-colors group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-400">
                      {previousPost.title}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {adjacentPosts.next && nextPost ? (
                  <Link
                    href={`/blog/${adjacentPosts.next.slug}`}
                    className={`group flex flex-col text-left transition-colors sm:text-right ${
                      hasPreviousAndNext
                        ? "border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"
                        : ""
                    }`}
                  >
                    <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-500">
                      {t.post.next}
                    </span>
                    <span className="mt-4 text-xl font-bold leading-tight text-black transition-colors group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-400">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>
        </article>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
