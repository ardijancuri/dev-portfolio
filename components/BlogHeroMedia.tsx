"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const DRAG_THRESHOLD_PX = 6;

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const figureRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const slides = [src, ...sliderSources].filter(
    (slide, index, allSlides) => slide && allSlides.indexOf(slide) === index
  );
  const slideCount = Math.max(slides.length, 1);
  const activeSlideIndex = Math.min(activeIndex, slideCount - 1);
  const activeSrc = slides[activeSlideIndex] ?? src;
  const hasMultipleSlides = slides.length > 1;
  const progressWidth = `${scrollProgress * 100}%`;

  const getNormalizedSlideIndex = useCallback(
    (index: number) => ((index % slideCount) + slideCount) % slideCount,
    [slideCount]
  );

  const showSlide = useCallback(
    (index: number) => {
      const nextIndex = getNormalizedSlideIndex(index);

      setActiveIndex(nextIndex);
    },
    [getNormalizedSlideIndex, setActiveIndex]
  );

  const handleCarouselScroll = () => {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const carousel = carouselRef.current;
      scrollFrameRef.current = null;

      if (!carousel) {
        return;
      }

      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      setScrollProgress(
        maxScrollLeft > 0
          ? Math.min(1, Math.max(0, carousel.scrollLeft / maxScrollLeft))
          : 0
      );
    });
  };

  const beginMouseDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = event.currentTarget.scrollLeft;
  };

  const moveMouseDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    const dragDistance = event.clientX - dragStartXRef.current;

    if (Math.abs(dragDistance) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
      event.preventDefault();
    }

    event.currentTarget.scrollLeft =
      dragStartScrollLeftRef.current - dragDistance;
  };

  const endMouseDrag = () => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;

    if (didDragRef.current) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
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
        showSlide(activeSlideIndex - 1);
      }

      if (event.key === "ArrowRight") {
        showSlide(activeSlideIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSlideIndex, hasMultipleSlides, isOpen, showSlide]);

  useLayoutEffect(() => {
    const updateStartInset = () => {
      const figure = figureRef.current;

      if (!figure) {
        return;
      }

      const startInset = Math.max(0, figure.getBoundingClientRect().left);
      figure.style.setProperty("--hero-start-inset", `${startInset}px`);
      figure.style.setProperty(
        "--hero-viewport-width",
        `${document.documentElement.clientWidth}px`
      );
    };

    updateStartInset();
    window.addEventListener("resize", updateStartInset);

    return () => {
      window.removeEventListener("resize", updateStartInset);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <figure
        ref={figureRef}
        className="mx-auto max-w-5xl [--hero-start-inset:1rem] [--hero-viewport-width:100%]"
      >
        <div
          ref={viewportRef}
          className="overflow-hidden"
          style={{
            marginLeft: "calc(var(--hero-start-inset) * -1)",
            width: "var(--hero-viewport-width)",
          }}
        >
          <div
            ref={carouselRef}
            role="region"
            aria-label={`${title} hero images`}
            className="scrollbar-hide flex cursor-grab select-none gap-4 overflow-x-auto active:cursor-grabbing"
            style={{
              paddingLeft: "var(--hero-start-inset)",
              paddingRight: "max(1rem, var(--hero-start-inset))",
              scrollBehavior: "auto",
              touchAction: "pan-x pan-y pinch-zoom",
            }}
            onMouseDown={beginMouseDrag}
            onMouseMove={moveMouseDrag}
            onMouseUp={endMouseDrag}
            onMouseLeave={endMouseDrag}
            onScroll={handleCarouselScroll}
          >
            {slides.map((slide, index) => {
              return (
                <button
                  key={slide}
                  type="button"
                  aria-label={`Open ${title} hero image ${index + 1}`}
                  onClick={(event) => {
                    if (suppressClickRef.current) {
                      event.preventDefault();
                      return;
                    }

                    setActiveIndex(index);
                    setIsOpen(true);
                  }}
                  className="group block flex-none cursor-zoom-in bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white"
                  style={{
                    width: "min(86vw, 70rem)",
                  }}
                >
                  <span className="relative block overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide}
                      alt={`${title} hero image ${index + 1}`}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="relative z-10 h-auto w-full transition duration-500 group-hover:scale-[1.01]"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {hasMultipleSlides ? (
          <div
            className="mt-5"
            style={{
              marginLeft: "calc(var(--hero-start-inset) * -1)",
              width: "var(--hero-viewport-width)",
            }}
          >
            <div
              style={{
                paddingLeft: "var(--hero-start-inset)",
                paddingRight: "max(1rem, var(--hero-start-inset))",
              }}
            >
              <div className="h-px overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-black dark:bg-white"
                  style={{
                    width: progressWidth,
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
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
            onClick={() => {
              setIsOpen(false);
            }}
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
                onClick={() => {
                  showSlide(activeSlideIndex - 1);
                }}
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-4xl font-light leading-none text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:left-6"
              >
                &lt;
              </button>
              <button
                type="button"
                aria-label="Next hero image"
                onClick={() => {
                  showSlide(activeSlideIndex + 1);
                }}
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-4xl font-light leading-none text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-6"
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
