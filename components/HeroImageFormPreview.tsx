import type { BlogHeroMediaMode } from "@/lib/blog-types";

export default function HeroImageFormPreview({
  src,
  mode,
  previewLabel,
  websitePreviewLabel,
  scrollHint,
}: {
  src: string | null;
  mode: BlogHeroMediaMode;
  previewLabel: string;
  websitePreviewLabel: string;
  scrollHint: string;
}) {
  if (mode === "scroll") {
    return (
      <div className="flex aspect-square flex-col overflow-hidden border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-black">
          <span className="flex gap-1" aria-hidden="true">
            <i className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <i className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <i className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.65rem] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {websitePreviewLabel}
          </span>
          <span className="text-[0.65rem] text-zinc-400">{scrollHint}</span>
        </div>
        <div
          role="region"
          aria-label={websitePreviewLabel}
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black dark:bg-zinc-950 dark:focus-visible:outline-white"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="block h-auto w-full" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
              {previewLabel}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          {previewLabel}
        </div>
      )}
    </div>
  );
}
