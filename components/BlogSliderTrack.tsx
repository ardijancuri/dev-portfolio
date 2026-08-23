"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { BlogPostSummary } from "@/lib/blog-types";
import { getDictionary, type Locale } from "@/lib/i18n";
import BlogPostCard from "@/components/BlogPostCard";

export default function BlogSliderTrack({
  posts,
  locale,
}: {
  posts: BlogPostSummary[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const momentumFrameRef = useRef<number | null>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    setCanScrollBack(track.scrollLeft > 1);
    setCanScrollForward(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    );
  }, []);

  const stopMomentum = useCallback(() => {
    if (momentumFrameRef.current !== null) {
      window.cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  }, []);

  const startMomentum = useCallback(
    (track: HTMLDivElement) => {
      stopMomentum();

      if (
        Math.abs(dragVelocityRef.current) < 0.04 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      let previousTime = performance.now();

      const glide = (currentTime: number) => {
        const elapsed = Math.min(currentTime - previousTime, 32);
        const previousScrollLeft = track.scrollLeft;
        previousTime = currentTime;
        track.scrollLeft += dragVelocityRef.current * elapsed;

        const reachedEdge =
          Math.abs(track.scrollLeft - previousScrollLeft) < 0.1;

        dragVelocityRef.current *= Math.pow(
          0.94,
          elapsed / (1000 / 60),
        );

        if (Math.abs(dragVelocityRef.current) < 0.015 || reachedEdge) {
          momentumFrameRef.current = null;
          return;
        }

        momentumFrameRef.current = window.requestAnimationFrame(glide);
      };

      momentumFrameRef.current = window.requestAnimationFrame(glide);
    },
    [stopMomentum],
  );

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    updateControls();

    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(track);

    return () => {
      resizeObserver.disconnect();
      stopMomentum();
    };
  }, [posts.length, stopMomentum, updateControls]);

  const moveSlider = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>("[data-blog-slide]");

    if (!track || !firstSlide) {
      return;
    }

    stopMomentum();

    const styles = window.getComputedStyle(firstSlide);
    const slideSpacing = Number.parseFloat(styles.marginRight) || 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.scrollBy({
      left:
        direction *
        (firstSlide.getBoundingClientRect().width + slideSpacing),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    stopMomentum();
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = event.currentTarget.scrollLeft;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;
    dragVelocityRef.current = 0;
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) {
      return;
    }

    const distance = event.clientX - dragStartXRef.current;

    if (!hasDraggedRef.current && Math.abs(distance) < 6) {
      return;
    }

    if (!hasDraggedRef.current) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    event.preventDefault();
    event.currentTarget.scrollLeft = dragStartScrollLeftRef.current - distance;

    const elapsed = Math.max(event.timeStamp - dragLastTimeRef.current, 1);
    const pointerDistance = event.clientX - dragLastXRef.current;
    const instantaneousVelocity = Math.max(
      -3,
      Math.min(3, -pointerDistance / elapsed),
    );

    dragVelocityRef.current =
      dragVelocityRef.current * 0.65 + instantaneousVelocity * 0.35;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;
  };

  const finishMouseDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) {
      return;
    }

    isMouseDownRef.current = false;
    setIsDragging(false);

    if (hasDraggedRef.current) {
      if (event.timeStamp - dragLastTimeRef.current > 80) {
        dragVelocityRef.current = 0;
      }

      startMomentum(event.currentTarget);

      window.setTimeout(() => {
        hasDraggedRef.current = false;
      }, 0);
    }
  };

  const preventClickAfterDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!hasDraggedRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    hasDraggedRef.current = false;
  };

  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-200 px-5 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        {t.blog.empty}
      </div>
    );
  }

  return (
    <div className="blog-slider-bleed">
      <div
        ref={trackRef}
        id="latest-writing-slider"
        className={`scrollbar-hide flex overflow-x-auto pb-2 ${
          isDragging
            ? "cursor-grabbing select-none"
            : "cursor-grab"
        }`}
        onScroll={updateControls}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishMouseDrag}
        onMouseLeave={finishMouseDrag}
        onClickCapture={preventClickAfterDrag}
        onDragStart={(event) => event.preventDefault()}
        role="region"
        aria-label={t.home.blogSliderLabel}
      >
        <div
          aria-hidden="true"
          className="blog-slider-start-spacer"
        />
        {posts.map((post, index) => (
          <div
            key={post.id}
            data-blog-slide
            className={`blog-slider-card ${
              index === posts.length - 1 ? "blog-slider-card-last" : ""
            }`}
          >
            <BlogPostCard post={post} variant="home" locale={locale} />
          </div>
        ))}
        <div
          aria-hidden="true"
          className="blog-slider-end-spacer"
        />
      </div>

      <div
        className={`blog-slider-controls mt-5 flex justify-end gap-2 sm:mt-6 ${
          canScrollBack || canScrollForward ? "visible" : "invisible"
        }`}
        aria-hidden={!canScrollBack && !canScrollForward}
      >
        <button
          type="button"
          className="grid size-12 cursor-pointer place-items-center rounded-full bg-zinc-100 text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-200 dark:hover:bg-zinc-300"
          onClick={() => moveSlider(-1)}
          disabled={!canScrollBack}
          aria-label={t.home.previousPosts}
          aria-controls="latest-writing-slider"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          className="grid size-12 cursor-pointer place-items-center rounded-full bg-zinc-100 text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-200 dark:hover:bg-zinc-300"
          onClick={() => moveSlider(1)}
          disabled={!canScrollForward}
          aria-label={t.home.nextPosts}
          aria-controls="latest-writing-slider"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
