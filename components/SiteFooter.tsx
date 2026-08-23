import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export default function SiteFooter({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <footer className="bg-white px-4 py-8 dark:bg-black sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center text-sm text-zinc-500 dark:text-zinc-500 sm:flex-row sm:justify-between sm:text-left sm:text-base">
        <p className="text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Ardijan Curi.{" "}
          {t.home.footerRights}
        </p>
        <nav
          aria-label="Social links"
          className="flex items-center gap-0.5"
        >
          <a
            href="https://oninova.net"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Oninova"
            className="grid size-10 place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              fill="currentColor"
              viewBox="0 0 88 80"
            >
              <path d="M84.6736 0C78.6669 5.71521 72.448 13.859 71.9135 24.2362C71.3435 35.0719 76.3332 42.1423 82.3268 49.0801L88 55.6441C82.2206 48.9549 72.9434 40.4355 60.5261 39.8168C49.5652 39.2534 42.4131 44.1861 35.3952 50.1112L0 80C6.76651 74.2866 15.403 65.1357 16.0102 52.8399C16.5987 42.0244 11.5904 34.9338 5.61548 28.0181L0.0149001 21.5351C5.79428 28.2244 15.0715 36.7438 27.5075 37.3827C38.4683 37.9461 45.6036 32.9932 52.6197 27.0681L84.6736 0Z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/ardijan-curi/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="grid size-10 place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/ardijancuri"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid size-10 place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="mailto:ardijan@oninova.net"
            aria-label="Email"
            className="grid size-10 place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              <path
                d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
