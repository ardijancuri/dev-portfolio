import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost, BlogPostSummary } from "@/lib/blog-types";

const postSelect =
  "id,title,slug,excerpt,content,hero_image_path,hero_image_url,author,created_by,created_at,updated_at";

export const getBlogPosts = cache(async (limit?: number) => {
  if (!hasSupabaseEnv()) {
    return [] as BlogPostSummary[];
  }

  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(postSelect)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load blog posts:", error.message);
    return [] as BlogPostSummary[];
  }

  return (data ?? []) as BlogPostSummary[];
});

export const getBlogPostBySlug = cache(async (slug: string) => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(postSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Unable to load blog post "${slug}":`, error.message);
    return null;
  }

  return data as BlogPost | null;
});
