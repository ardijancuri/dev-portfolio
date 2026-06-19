import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUserId, isAdminUser } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo?.startsWith("/")
    ? params.redirectTo
    : "/admin/blog";
  const userId = await getCurrentUserId();

  if (userId && (await isAdminUser(userId))) {
    redirect(redirectTo);
  }

  return (
    <main className="min-h-screen bg-white px-4 pt-32 text-black dark:bg-black dark:text-white sm:px-6 md:px-8 lg:px-12">
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-5xl items-center gap-10 py-12 md:grid-cols-[1fr_28rem]">
        <div>
          <p className="mb-4 text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
            Admin
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Publish from the portfolio.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Sign in with the approved owner account to create, edit, and remove
            blog posts.
          </p>
        </div>

        <div className="border-2 border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          {params.error === "admin" && (
            <p className="mb-5 border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
              Your session is valid, but this account is not approved for blog
              publishing.
            </p>
          )}
          <LoginForm redirectTo={redirectTo} />
        </div>
      </section>
    </main>
  );
}
