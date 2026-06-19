import type { Metadata } from "next";
import AdminBlogForm from "@/components/AdminBlogForm";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "New Blog Post",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewBlogPostPage() {
  await requireAdmin("/admin/blog/new");

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
              New blog post
            </h1>
          </div>
          <LogoutButton />
        </div>

        <AdminBlogForm />
      </section>
    </main>
  );
}
