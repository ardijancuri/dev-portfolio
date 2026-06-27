"use client";

import { useEffect, useRef, useState } from "react";

export default function BlogHeroMedia({
  src,
  sliderSources = [],
  title,
}: {
  src: string;
  sliderSources?: string[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const slides = [src, ...sliderSources].filter(
    (slide, index, allSlides) => slide && allSlides.indexOf(slide) === index
  );
  const activeSlideIndex = Math.min(activeIndex, slides.length - 1);
  const activeSrc = slides[activeSlideIndex] ?? src;
  const hasMultipleSlides = slides.length > 1;

  const showSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const showPreviousSlide = () => {
    showSlide(activeSlideIndex - 1);
  };

  const showNextSlide = () => {
    showSlide(activeSlideIndex + 1);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (!hasMultipleSlides) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % slides.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultipleSlides, isOpen, slides.length]);

  return (
    <>
      <figure className="mx-auto max-w-5xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <div className="relative">
          <button
            type="button"
            aria-label={`Open ${title} hero image ${activeSlideIndex + 1}`}
            onClick={() => setIsOpen(true)}
            className="group block w-full cursor-zoom-in bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeSrc}
              src={activeSrc}
              alt={`${title} hero image ${activeSlideIndex + 1}`}
              loading="eager"
              decoding="async"
              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.01]"
            />
          </button>

          {hasMultipleSlides ? (
            <>
              <button
                type="button"
                aria-label="Previous hero image"
                onClick={showPreviousSlide}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-white/70 bg-black/45 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-5 sm:h-12 sm:w-12"
              >
                &lt;
              </button>
              <button
                type="button"
                aria-label="Next hero image"
                onClick={showNextSlide}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-white/70 bg-black/45 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:h-12 sm:w-12"
              >
                &gt;
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide}
                    type="button"
                    aria-label={`Show hero image ${index + 1}`}
                    aria-current={
                      index === activeSlideIndex ? "true" : undefined
                    }
                    onClick={() => showSlide(index)}
                    className={`h-2.5 w-8 border border-white/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      index === activeSlideIndex
                        ? "bg-white"
                        : "bg-black/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </figure>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image preview`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm sm:p-6"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              setIsOpen(false);
            }
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close image preview"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border-2 border-white/50 bg-black/40 text-xl font-semibold leading-none text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-6 sm:top-6"
          >
            X
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={`${title} hero image ${activeSlideIndex + 1}`}
            className="max-h-[88svh] max-w-full object-contain shadow-2xl"
          />
          {hasMultipleSlides ? (
            <>
              <button
                type="button"
                aria-label="Previous hero image"
                onClick={showPreviousSlide}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-white/50 bg-black/40 text-lg font-semibold text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:left-6"
              >
                &lt;
              </button>
              <button
                type="button"
                aria-label="Next hero image"
                onClick={showNextSlide}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-white/50 bg-black/40 text-lg font-semibold text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-6"
              >
                &gt;
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
