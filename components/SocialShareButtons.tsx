"use client";

import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";

type SocialShareButtonsProps = {
  title: string;
  url: string;
};

type IconProps = SVGProps<SVGSVGElement>;

const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center text-black transition-colors hover:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:text-white dark:hover:text-zinc-400 dark:focus-visible:outline-white";

const linkIconClassName = "h-6 w-6";
const xIconClassName = "h-5 w-5";
const copyIconClassName = "h-5 w-5";

function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.24 2h3.18l-6.94 7.93L22.64 22h-6.39l-5-6.54L5.53 22H2.35l7.42-8.48L1.94 2h6.55l4.52 5.98L18.24 2Zm-1.12 17.88h1.76L7.53 4.01H5.64l11.48 15.87Z" />
    </svg>
  );
}

function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.13 5.08c-2.81 0-4.74 1.72-4.74 4.86v2.39H6.3v3.65h3.09V22h3.8v-6.02h3.02l.57-3.65h-3.59V10.2c0-1.05.29-1.77 1.81-1.77h1.93V5.17c-.94-.06-1.87-.09-2.8-.09Z" />
    </svg>
  );
}

function LinkIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5.03" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.22-1.22" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

export default function SocialShareButtons({
  title,
  url,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const shareLinks = [
    {
      ariaLabel: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XIcon,
      iconClassName: xIconClassName,
    },
    {
      ariaLabel: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedInIcon,
      iconClassName: linkIconClassName,
    },
    {
      ariaLabel: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
      iconClassName: linkIconClassName,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="flex items-center divide-x divide-zinc-200 dark:divide-zinc-800"
      aria-label="Share this post"
    >
      {shareLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.ariaLabel}
          title={link.ariaLabel}
          className={iconButtonClass}
        >
          <link.Icon className={link.iconClassName} />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Copied post link" : "Copy post link"}
        title={copied ? "Copied" : "Copy post link"}
        className={`${iconButtonClass} cursor-pointer`}
      >
        {copied ? (
          <CheckIcon className={copyIconClassName} />
        ) : (
          <LinkIcon className={copyIconClassName} />
        )}
      </button>
    </div>
  );
}
