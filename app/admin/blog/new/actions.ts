"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultAuthor } from "@/lib/site";
import { requireAdmin } from "@/lib/admin";
import {
  ALLOWED_HERO_IMAGE_TYPES,
  BLOG_HERO_BUCKET,
  MAX_HERO_IMAGE_BYTES,
  extensionForMimeType,
  slugifyTitle,
} from "@/lib/blog-utils";

export interface CreateBlogPostState {
  error?: string;
}

export async function createBlogPost(
  _previousState: CreateBlogPostState,
  formData: FormData
): Promise<CreateBlogPostState> {
  const { supabase, userId } = await requireAdmin("/admin/blog/new");

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? defaultAuthor).trim();
  const heroImage = formData.get("heroImage");

  if (title.length < 3 || title.length > 160) {
    return { error: "Title must be between 3 and 160 characters." };
  }

  if (excerpt.length < 10 || excerpt.length > 300) {
    return { error: "Excerpt must be between 10 and 300 characters." };
  }

  if (content.length < 20) {
    return { error: "Markdown content must be at least 20 characters." };
  }

  if (!author) {
    return { error: "Author is required." };
  }

  if (!(heroImage instanceof File) || heroImage.size === 0) {
    return { error: "Hero image is required." };
  }

  if (!ALLOWED_HERO_IMAGE_TYPES.includes(heroImage.type)) {
    return { error: "Hero image must be a JPG, PNG, WebP, or GIF file." };
  }

  if (heroImage.size > MAX_HERO_IMAGE_BYTES) {
    return { error: "Hero image must be 5 MB or smaller." };
  }

  let slug = slugifyTitle(title);

  if (!slug) {
    slug = `post-${Date.now().toString(36)}`;
  }

  const { data: existingPost } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existingPost) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const extension = extensionForMimeType(heroImage.type);

  if (!extension) {
    return { error: "Unsupported hero image file type." };
  }

  const heroPath = `${userId}/${Date.now()}-${slug}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BLOG_HERO_BUCKET)
    .upload(heroPath, heroImage, {
      cacheControl: "31536000",
      contentType: heroImage.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BLOG_HERO_BUCKET).getPublicUrl(heroPath);

  const { error: insertError } = await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt,
    content,
    hero_image_path: heroPath,
    hero_image_url: publicUrl,
    author,
    created_by: userId,
  });

  if (insertError) {
    await supabase.storage.from(BLOG_HERO_BUCKET).remove([heroPath]);
    return { error: insertError.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  redirect(`/blog/${slug}`);
}
