import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUserId, isAdminUser } from "@/lib/admin";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.login.title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
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
            {t.login.eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            {t.login.heading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {t.login.description}
          </p>
        </div>

        <div className="border-2 border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          {params.error === "admin" && (
            <p className="mb-5 border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
              {t.login.adminError}
            </p>
          )}
          <LoginForm redirectTo={redirectTo} locale={locale} />
        </div>
      </section>
    </main>
  );
}
