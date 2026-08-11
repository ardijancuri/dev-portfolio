import type { Locale } from "@/lib/i18n";
import type { BlogHeroMediaMode } from "@/lib/blog-types";

export const BLOG_HERO_BUCKET = "blog-heroes";
export const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_SCROLL_HERO_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_HERO_SLIDER_IMAGES = 5;
export const MAX_BLOG_EXCERPT_CHARS = 800;
export const ALLOWED_HERO_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function parseBlogHeroMediaMode(value: unknown): BlogHeroMediaMode {
  return value === "scroll" ? "scroll" : "slider";
}

export function formatPostDate(date: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getReadingTime(content: string, locale: Locale = "en") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} ${
    locale === "sq" ? "min lexim" : "min read"
  }`;
}

export function stripMarkdownText(content: string) {
  return content
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[`*_~>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function extensionForMimeType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}
