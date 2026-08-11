export type BlogHeroMediaMode = "slider" | "scroll";

export interface BlogPost {
  id: string;
  title: string;
  title_sq: string | null;
  slug: string;
  excerpt: string;
  excerpt_sq: string | null;
  content: string;
  content_sq: string | null;
  hero_image_path: string;
  hero_image_url: string;
  hero_media_mode: BlogHeroMediaMode;
  hero_slider_image_paths: string[];
  hero_slider_image_urls: string[];
  author: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type BlogPostSummary = Pick<
  BlogPost,
  | "id"
  | "title"
  | "title_sq"
  | "slug"
  | "excerpt"
  | "excerpt_sq"
  | "content"
  | "content_sq"
  | "hero_image_url"
  | "author"
  | "created_at"
  | "updated_at"
>;
