"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultAuthor } from "@/lib/site";
import { requireAdmin } from "@/lib/admin";
import {
  ALLOWED_HERO_IMAGE_TYPES,
  BLOG_HERO_BUCKET,
  MAX_BLOG_EXCERPT_CHARS,
  MAX_HERO_IMAGE_BYTES,
  extensionForMimeType,
  slugifyTitle,
} from "@/lib/blog-utils";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export interface CreateBlogPostState {
  error?: string;
}

function optionalField(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function validateAlbanianFields({
  titleSq,
  excerptSq,
  contentSq,
  errors,
}: {
  titleSq: string | null;
  excerptSq: string | null;
  contentSq: string | null;
  errors: ReturnType<typeof getDictionary>["admin"]["errors"];
}) {
  const hasAnyTranslation = Boolean(titleSq || excerptSq || contentSq);

  if (!hasAnyTranslation) {
    return null;
  }

  if (!titleSq || !excerptSq || !contentSq) {
    return errors.translationIncomplete;
  }

  if (titleSq.length < 3 || titleSq.length > 160) {
    return errors.albanianTitleLength;
  }

  if (excerptSq.length < 10 || excerptSq.length > MAX_BLOG_EXCERPT_CHARS) {
    return `${errors.albanianExcerptLength} ${MAX_BLOG_EXCERPT_CHARS} ${errors.excerptLengthEnd}`;
  }

  if (contentSq.length < 20) {
    return errors.albanianContentLength;
  }

  return null;
}

export async function createBlogPost(
  _previousState: CreateBlogPostState,
  formData: FormData
): Promise<CreateBlogPostState> {
  const { supabase, userId } = await requireAdmin("/admin/blog/new");
  const locale = await getLocale();
  const errors = getDictionary(locale).admin.errors;

  const title = String(formData.get("title") ?? "").trim();
  const titleSq = optionalField(formData, "title_sq");
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const excerptSq = optionalField(formData, "excerpt_sq");
  const content = String(formData.get("content") ?? "").trim();
  const contentSq = optionalField(formData, "content_sq");
  const author = String(formData.get("author") ?? defaultAuthor).trim();
  const heroImage = formData.get("heroImage");

  if (title.length < 3 || title.length > 160) {
    return { error: errors.titleLength };
  }

  if (excerpt.length < 10 || excerpt.length > MAX_BLOG_EXCERPT_CHARS) {
    return {
      error: `${errors.excerptLength} ${MAX_BLOG_EXCERPT_CHARS} ${errors.excerptLengthEnd}`,
    };
  }

  if (content.length < 20) {
    return { error: errors.contentLength };
  }

  if (!author) {
    return { error: errors.authorRequired };
  }

  const translationError = validateAlbanianFields({
    titleSq,
    excerptSq,
    contentSq,
    errors,
  });

  if (translationError) {
    return { error: translationError };
  }

  if (!(heroImage instanceof File) || heroImage.size === 0) {
    return { error: errors.heroRequired };
  }

  if (!ALLOWED_HERO_IMAGE_TYPES.includes(heroImage.type)) {
    return { error: errors.heroType };
  }

  if (heroImage.size > MAX_HERO_IMAGE_BYTES) {
    return { error: errors.heroSize };
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
    return { error: errors.heroUnsupported };
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
    title_sq: titleSq,
    slug,
    excerpt,
    excerpt_sq: excerptSq,
    content,
    content_sq: contentSq,
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
