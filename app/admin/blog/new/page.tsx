import type { Metadata } from "next";
import Link from "next/link";
import AdminBlogForm from "@/components/AdminBlogForm";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/admin";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.admin.newMetaTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function NewBlogPostPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  await requireAdmin("/admin/blog/new");

  return (
    <main className="min-h-screen bg-white px-4 pt-32 text-black dark:bg-black dark:text-white sm:px-6 md:px-8 lg:px-12">
      <SiteHeader />
      <section className="mx-auto max-w-6xl py-12">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-zinc-200 pb-8 dark:border-zinc-800 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
              {t.admin.eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {t.admin.newPostHeading}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/blog"
              className="border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
            >
              {t.admin.managePosts}
            </Link>
            <LogoutButton label={t.admin.signOut} />
          </div>
        </div>

        <AdminBlogForm locale={locale} />
      </section>
    </main>
  );
}
