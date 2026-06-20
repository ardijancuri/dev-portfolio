import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export default function SiteFooter({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <footer className="bg-white px-4 py-8 dark:bg-black sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12">
      <div className="mx-auto max-w-5xl text-center text-sm text-zinc-500 dark:text-zinc-500 sm:text-base">
        <p>
          &copy; {new Date().getFullYear()} Ardijan Curi.{" "}
          {t.home.footerRights}
        </p>
      </div>
    </footer>
  );
}
