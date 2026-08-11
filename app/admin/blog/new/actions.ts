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
  MAX_SCROLL_HERO_IMAGE_BYTES,
  MAX_HERO_SLIDER_IMAGES,
  extensionForMimeType,
  parseBlogHeroMediaMode,
  slugifyTitle,
} from "@/lib/blog-utils";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export interface CreateBlogPostState {
  error?: string;
}

type AdminErrors = ReturnType<typeof getDictionary>["admin"]["errors"];

function optionalField(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function getHeroSliderImages(formData: FormData) {
  return formData
    .getAll("heroSliderImages")
    .filter(
      (value): value is File => value instanceof File && value.size > 0
    );
}

function validateHeroImage(
  image: File,
  errors: AdminErrors,
  maxBytes = MAX_HERO_IMAGE_BYTES
) {
  if (!ALLOWED_HERO_IMAGE_TYPES.includes(image.type)) {
    return errors.heroType;
  }

  if (image.size > maxBytes) {
    return maxBytes === MAX_SCROLL_HERO_IMAGE_BYTES
      ? errors.heroScrollSize
      : errors.heroSize;
  }

  if (!extensionForMimeType(image.type)) {
    return errors.heroUnsupported;
  }

  return null;
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
  const heroMediaMode = parseBlogHeroMediaMode(formData.get("heroMediaMode"));
  const heroSliderImages =
    heroMediaMode === "slider" ? getHeroSliderImages(formData) : [];

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

  const heroError = validateHeroImage(
    heroImage,
    errors,
    heroMediaMode === "scroll"
      ? MAX_SCROLL_HERO_IMAGE_BYTES
      : MAX_HERO_IMAGE_BYTES
  );

  if (heroError) {
    return { error: heroError };
  }

  if (heroSliderImages.length > MAX_HERO_SLIDER_IMAGES) {
    return { error: errors.heroSliderLimit };
  }

  for (const sliderImage of heroSliderImages) {
    const sliderImageError = validateHeroImage(sliderImage, errors);

    if (sliderImageError) {
      return { error: sliderImageError };
    }
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

  const heroSliderImagePaths: string[] = [];
  const heroSliderImageUrls: string[] = [];

  for (const [index, sliderImage] of heroSliderImages.entries()) {
    const sliderExtension = extensionForMimeType(sliderImage.type);

    if (!sliderExtension) {
      await supabase.storage
        .from(BLOG_HERO_BUCKET)
        .remove([heroPath, ...heroSliderImagePaths]);
      return { error: errors.heroUnsupported };
    }

    const sliderImagePath = `${userId}/${Date.now()}-${slug}-slider-${
      index + 1
    }.${sliderExtension}`;
    const { error: sliderUploadError } = await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .upload(sliderImagePath, sliderImage, {
        cacheControl: "31536000",
        contentType: sliderImage.type,
        upsert: false,
      });

    if (sliderUploadError) {
      await supabase.storage
        .from(BLOG_HERO_BUCKET)
        .remove([heroPath, ...heroSliderImagePaths]);
      return { error: sliderUploadError.message };
    }

    const {
      data: { publicUrl: sliderPublicUrl },
    } = supabase.storage
      .from(BLOG_HERO_BUCKET)
      .getPublicUrl(sliderImagePath);

    heroSliderImagePaths.push(sliderImagePath);
    heroSliderImageUrls.push(sliderPublicUrl);
  }

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
    hero_media_mode: heroMediaMode,
    hero_slider_image_paths: heroSliderImagePaths,
    hero_slider_image_urls: heroSliderImageUrls,
    author,
    created_by: userId,
  });

  if (insertError) {
    await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .remove([heroPath, ...heroSliderImagePaths]);
    return { error: insertError.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  redirect(`/blog/${slug}`);
}
