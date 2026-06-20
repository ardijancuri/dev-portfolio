"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import { defaultAuthor } from "@/lib/site";

export interface EditBlogPostState {
  error?: string;
}

export interface DeleteBlogPostState {
  error?: string;
}

type AdminErrors = ReturnType<typeof getDictionary>["admin"]["errors"];

function validatePostFields({
  title,
  excerpt,
  content,
  author,
  titleSq,
  excerptSq,
  contentSq,
  errors,
}: {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  titleSq: string | null;
  excerptSq: string | null;
  contentSq: string | null;
  errors: AdminErrors;
}) {
  if (title.length < 3 || title.length > 160) {
    return errors.titleLength;
  }

  if (excerpt.length < 10 || excerpt.length > MAX_BLOG_EXCERPT_CHARS) {
    return `${errors.excerptLength} ${MAX_BLOG_EXCERPT_CHARS} ${errors.excerptLengthEnd}`;
  }

  if (content.length < 20) {
    return errors.contentLength;
  }

  if (!author) {
    return errors.authorRequired;
  }

  const hasAnyTranslation = Boolean(titleSq || excerptSq || contentSq);

  if (hasAnyTranslation) {
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
  }

  return null;
}

function validateHeroImage(heroImage: File, errors: AdminErrors) {
  if (!ALLOWED_HERO_IMAGE_TYPES.includes(heroImage.type)) {
    return errors.heroType;
  }

  if (heroImage.size > MAX_HERO_IMAGE_BYTES) {
    return errors.heroSize;
  }

  if (!extensionForMimeType(heroImage.type)) {
    return errors.heroUnsupported;
  }

  return null;
}

function optionalField(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function revalidateBlogViews(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

export async function deleteBlogPost(
  postId: string
): Promise<DeleteBlogPostState> {
  const id = String(postId ?? "").trim();
  const locale = await getLocale();
  const errors = getDictionary(locale).admin.errors;

  if (!id) {
    return { error: errors.postIdRequired };
  }

  const { supabase } = await requireAdmin("/admin/blog");

  const { data: post, error: loadError } = await supabase
    .from("blog_posts")
    .select("slug,hero_image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return { error: loadError.message };
  }

  if (!post) {
    return { error: errors.notFound };
  }

  const { error: deleteError } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (post.hero_image_path) {
    const { error: storageError } = await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .remove([post.hero_image_path]);

    if (storageError) {
      console.warn("Unable to remove deleted post hero image:", storageError);
    }
  }

  revalidateBlogViews(post.slug);

  return {};
}

export async function updateBlogPost(
  _previousState: EditBlogPostState,
  formData: FormData
): Promise<EditBlogPostState> {
  const postId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const titleSq = optionalField(formData, "title_sq");
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const excerptSq = optionalField(formData, "excerpt_sq");
  const content = String(formData.get("content") ?? "").trim();
  const contentSq = optionalField(formData, "content_sq");
  const author = String(formData.get("author") ?? defaultAuthor).trim();
  const heroImage = formData.get("heroImage");
  const locale = await getLocale();
  const errors = getDictionary(locale).admin.errors;

  if (!postId) {
    return { error: errors.postIdRequired };
  }

  const fieldError = validatePostFields({
    title,
    excerpt,
    content,
    author,
    titleSq,
    excerptSq,
    contentSq,
    errors,
  });

  if (fieldError) {
    return { error: fieldError };
  }

  const { supabase, userId } = await requireAdmin("/admin/blog");

  const { data: currentPost, error: loadError } = await supabase
    .from("blog_posts")
    .select("slug,hero_image_path")
    .eq("id", postId)
    .maybeSingle();

  if (loadError) {
    return { error: loadError.message };
  }

  if (!currentPost) {
    return { error: errors.notFound };
  }

  let slug = slugifyTitle(title);

  if (!slug) {
    slug = `post-${Date.now().toString(36)}`;
  }

  const { data: conflictingPost, error: slugError } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .neq("id", postId)
    .maybeSingle();

  if (slugError) {
    return { error: slugError.message };
  }

  if (conflictingPost) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const updatePayload: Record<string, string | null> = {
    title,
    slug,
    excerpt,
    content,
    author,
    title_sq: titleSq,
    excerpt_sq: excerptSq,
    content_sq: contentSq,
  };

  let uploadedHeroPath: string | null = null;

  if (heroImage instanceof File && heroImage.size > 0) {
    const heroError = validateHeroImage(heroImage, errors);

    if (heroError) {
      return { error: heroError };
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

    uploadedHeroPath = heroPath;
    updatePayload.hero_image_path = heroPath;
    updatePayload.hero_image_url = publicUrl;
  }

  const { error: updateError } = await supabase
    .from("blog_posts")
    .update(updatePayload)
    .eq("id", postId);

  if (updateError) {
    if (uploadedHeroPath) {
      await supabase.storage.from(BLOG_HERO_BUCKET).remove([uploadedHeroPath]);
    }

    return { error: updateError.message };
  }

  if (
    uploadedHeroPath &&
    currentPost.hero_image_path &&
    currentPost.hero_image_path !== uploadedHeroPath
  ) {
    const { error: storageError } = await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .remove([currentPost.hero_image_path]);

    if (storageError) {
      console.warn("Unable to remove replaced post hero image:", storageError);
    }
  }

  revalidateBlogViews(slug, currentPost.slug);
  revalidatePath(`/admin/blog/${postId}/edit`);

  redirect("/admin/blog");
}
