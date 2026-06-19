export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  hero_image_path: string;
  hero_image_url: string;
  author: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type BlogPostSummary = Pick<
  BlogPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "hero_image_url"
  | "author"
  | "created_at"
>;
