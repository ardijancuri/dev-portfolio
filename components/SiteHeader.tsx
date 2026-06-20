import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default async function SiteHeader() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 px-4 py-4 backdrop-blur dark:bg-black/90 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6">
        <Link
          href="/"
          className="text-black transition-opacity hover:opacity-70 dark:text-white"
          aria-label={t.nav.home}
        >
          <svg
            className="h-8 w-9 sm:h-11 sm:w-12"
            viewBox="0 0 88 80"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M84.6736 0C78.6669 5.71521 72.448 13.859 71.9135 24.2362C71.3435 35.0719 76.3332 42.1423 82.3268 49.0801L88 55.6441C82.2206 48.9549 72.9434 40.4355 60.5261 39.8168C49.5652 39.2534 42.4131 44.1861 35.3952 50.1112L0 80C6.76651 74.2866 15.403 65.1357 16.0102 52.8399C16.5987 42.0244 11.5904 34.9338 5.61548 28.0181L0.0149001 21.5351C5.79428 28.2244 15.0715 36.7438 27.5075 37.3827C38.4683 37.9461 45.6036 32.9932 52.6197 27.0681L84.6736 0Z" />
          </svg>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:gap-6 sm:text-base lg:gap-8">
            <Link
              href="/blog"
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              {t.nav.blog}
            </Link>
            <Link
              href="/#projects"
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              {t.nav.projects}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher
              locale={locale}
              labels={{ en: t.nav.english, sq: t.nav.albanian }}
              ariaLabel={t.nav.language}
            />
            <ThemeToggle label={t.theme.toggle} />
          </div>
        </div>
      </div>
    </header>
  );
}
