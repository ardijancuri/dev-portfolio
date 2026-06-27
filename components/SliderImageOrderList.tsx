"use client";

export interface SliderImageOrderItem {
  id: string;
  url: string;
  path?: string;
}

export default function SliderImageOrderList({
  items,
  label,
  onMove,
  includeHiddenFields = false,
}: {
  items: SliderImageOrderItem[];
  label: string;
  onMove: (fromIndex: number, toIndex: number) => void;
  includeHiddenFields?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
        {label}
      </p>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[4rem_1fr] gap-3 border-2 border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-black"
          >
            <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`Hero slider preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                Slide {index + 1}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                  className="border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white"
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => onMove(index, index + 1)}
                  className="border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white"
                >
                  Move down
                </button>
              </div>
            </div>

            {includeHiddenFields ? (
              <>
                <input
                  type="hidden"
                  name="heroSliderImagePaths"
                  value={item.path ?? ""}
                />
                <input
                  type="hidden"
                  name="heroSliderImageUrls"
                  value={item.url}
                />
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
