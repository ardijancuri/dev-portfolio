"use client";

import type { BlogHeroMediaMode } from "@/lib/blog-types";

export default function HeroMediaModeField({
  mode,
  onChange,
  label,
  help,
  sliderLabel,
  scrollLabel,
}: {
  mode: BlogHeroMediaMode;
  onChange: (mode: BlogHeroMediaMode) => void;
  label: string;
  help: string;
  sliderLabel: string;
  scrollLabel: string;
}) {
  const isScrollMode = mode === "scroll";

  return (
    <div className="border-y border-zinc-200 py-4 dark:border-zinc-800">
      <input type="hidden" name="heroMediaMode" value={mode} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            id="hero-media-mode-label"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {label}
          </p>
          <p
            id="hero-media-mode-help"
            className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500"
          >
            {help}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isScrollMode}
          aria-labelledby="hero-media-mode-label"
          aria-describedby="hero-media-mode-help"
          onClick={() => {
            onChange(isScrollMode ? "slider" : "scroll");
          }}
          className="flex shrink-0 flex-col items-end gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white"
        >
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isScrollMode
                ? "bg-black dark:bg-white"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
                isScrollMode
                  ? "translate-x-6 bg-white dark:bg-black"
                  : "translate-x-1 bg-white"
              }`}
            />
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {isScrollMode ? scrollLabel : sliderLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
