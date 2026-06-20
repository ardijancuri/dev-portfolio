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
import { defaultAuthor } from "@/lib/site";

export interface EditBlogPostState {
  error?: string;
}

export interface DeleteBlogPostState {
  error?: string;
}

function validatePostFields({
  title,
  excerpt,
  content,
  author,
}: {
  title: string;
  excerpt: string;
  content: string;
  author: string;
}) {
  if (title.length < 3 || title.length > 160) {
    return "Title must be between 3 and 160 characters.";
  }

  if (excerpt.length < 10 || excerpt.length > MAX_BLOG_EXCERPT_CHARS) {
    return `Excerpt must be between 10 and ${MAX_BLOG_EXCERPT_CHARS} characters.`;
  }

  if (content.length < 20) {
    return "Markdown content must be at least 20 characters.";
  }

  if (!author) {
    return "Author is required.";
  }

  return null;
}

function validateHeroImage(heroImage: File) {
  if (!ALLOWED_HERO_IMAGE_TYPES.includes(heroImage.type)) {
    return "Hero image must be a JPG, PNG, WebP, or GIF file.";
  }

  if (heroImage.size > MAX_HERO_IMAGE_BYTES) {
    return "Hero image must be 5 MB or smaller.";
  }

  if (!extensionForMimeType(heroImage.type)) {
    return "Unsupported hero image file type.";
  }

  return null;
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

  if (!id) {
    return { error: "Post id is required." };
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
    return { error: "Post not found." };
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
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? defaultAuthor).trim();
  const heroImage = formData.get("heroImage");

  if (!postId) {
    return { error: "Post id is required." };
  }

  const fieldError = validatePostFields({ title, excerpt, content, author });

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
    return { error: "Post not found." };
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

  const updatePayload: Record<string, string> = {
    title,
    slug,
    excerpt,
    content,
    author,
  };

  let uploadedHeroPath: string | null = null;

  if (heroImage instanceof File && heroImage.size > 0) {
    const heroError = validateHeroImage(heroImage);

    if (heroError) {
      return { error: heroError };
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
