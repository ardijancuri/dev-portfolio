"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleCookie } from "@/lib/i18n-actions";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({
  locale,
  labels,
  ariaLabel,
}: {
  locale: Locale;
  labels: Record<Locale, string>;
  ariaLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    startTransition(async () => {
      await setLocaleCookie(nextLocale);
      router.refresh();
    });
  };

  const nextLocale = locales.find((item) => item !== locale) ?? locale;

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${labels[nextLocale]}`}
      disabled={pending}
      onClick={() => setLocale(nextLocale)}
      className="inline-flex h-10 min-w-10 cursor-pointer items-center justify-center border-2 border-black bg-black px-3 text-xs font-bold uppercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
    >
      {labels[nextLocale]}
    </button>
  );
}
