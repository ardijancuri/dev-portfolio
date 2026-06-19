import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditBlogPostForm from "@/components/EditBlogPostForm";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/admin";
import { getBlogPostById } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Edit Blog Post",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/blog/${id}/edit`);

  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-4 pt-32 text-black dark:bg-black dark:text-white sm:px-6 md:px-8 lg:px-12">
      <SiteHeader />
      <section className="mx-auto max-w-6xl py-12">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-zinc-200 pb-8 dark:border-zinc-800 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
              Admin
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Edit post
            </h1>
            <p className="mt-4 max-w-2xl truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">
              /blog/{post.slug}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/blog"
              className="border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
            >
              Manage posts
            </Link>
            <LogoutButton />
          </div>
        </div>

        <EditBlogPostForm post={post} />
      </section>
    </main>
  );
}
