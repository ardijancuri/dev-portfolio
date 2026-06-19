"use client";

import { useRef } from "react";
import type { BlogPostSummary } from "@/lib/blog-types";
import BlogPostCard from "@/components/BlogPostCard";

export default function BlogSliderTrack({
  posts,
}: {
  posts: BlogPostSummary[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "previous" | "next") => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const distance = direction === "next" ? track.clientWidth : -track.clientWidth;
    track.scrollBy({ left: distance, behavior: "smooth" });
  };

  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-200 px-5 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        No posts published yet.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll("previous")}
          className="flex h-10 w-10 items-center justify-center border-2 border-zinc-200 text-black transition-colors hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
          aria-label="Previous blog posts"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll("next")}
          className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white transition-colors hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          aria-label="Next blog posts"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide grid auto-cols-[100%] grid-flow-col gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory sm:auto-cols-[calc((100%_-_1rem)/2)] lg:auto-cols-[calc((100%_-_2rem)/3)] 2xl:auto-cols-[calc((100%_-_3rem)/4)]"
      >
        {posts.map((post) => (
          <div key={post.id} className="snap-start">
            <BlogPostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
