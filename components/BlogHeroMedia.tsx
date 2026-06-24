"use client";

import { useEffect, useRef, useState } from "react";

export default function BlogHeroMedia({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <figure className="mx-auto max-w-5xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <button
          type="button"
          aria-label={`Open ${title} hero image`}
          onClick={() => setIsOpen(true)}
          className="group block w-full cursor-zoom-in bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </button>
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
            src={src}
            alt=""
            className="max-h-[88svh] max-w-full object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </>
  );
}
