"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import {
  ALLOWED_HERO_IMAGE_TYPES,
  BLOG_HERO_BUCKET,
  MAX_BLOG_EXCERPT_CHARS,
  MAX_HERO_IMAGE_BYTES,
  MAX_SCROLL_HERO_IMAGE_BYTES,
  MAX_HERO_SLIDER_IMAGES,
  MAX_PROJECT_LINK_LABEL_CHARS,
  MAX_PROJECT_LINK_URL_CHARS,
  extensionForMimeType,
  normalizeProjectLinkUrl,
  parseBlogHeroMediaMode,
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

function validateHeroImage(
  heroImage: File,
  errors: AdminErrors,
  maxBytes = MAX_HERO_IMAGE_BYTES
) {
  if (!ALLOWED_HERO_IMAGE_TYPES.includes(heroImage.type)) {
    return errors.heroType;
  }

  if (heroImage.size > maxBytes) {
    return maxBytes === MAX_SCROLL_HERO_IMAGE_BYTES
      ? errors.heroScrollSize
      : errors.heroSize;
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

function getHeroSliderImages(formData: FormData) {
  return formData
    .getAll("heroSliderImages")
    .filter(
      (value): value is File => value instanceof File && value.size > 0
    );
}

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function getProjectLinkFields(formData: FormData, errors: AdminErrors) {
  const label = optionalField(formData, "projectLinkLabel");
  const rawUrl = optionalField(formData, "projectLinkUrl");

  if (!label && !rawUrl) {
    return { label: null, url: null, error: null };
  }

  if (!label || !rawUrl) {
    return { label: null, url: null, error: errors.projectLinkIncomplete };
  }

  if (label.length > MAX_PROJECT_LINK_LABEL_CHARS) {
    return { label: null, url: null, error: errors.projectLinkLabelLength };
  }

  if (rawUrl.length > MAX_PROJECT_LINK_URL_CHARS) {
    return { label: null, url: null, error: errors.projectLinkUrlInvalid };
  }

  const normalizedUrl = normalizeProjectLinkUrl(rawUrl);

  if (!normalizedUrl) {
    return { label: null, url: null, error: errors.projectLinkUrlInvalid };
  }

  return { label, url: normalizedUrl, error: null };
}

function getOrderedExistingSliderImages({
  formData,
  currentPaths,
  currentUrls,
  errors,
}: {
  formData: FormData;
  currentPaths: string[];
  currentUrls: string[];
  errors: AdminErrors;
}) {
  const orderedPaths = getStringList(formData, "heroSliderImagePaths");
  const orderedUrls = getStringList(formData, "heroSliderImageUrls");
  const hasSubmittedOrder = orderedPaths.length > 0 || orderedUrls.length > 0;

  if (!hasSubmittedOrder) {
    return {
      paths: currentPaths,
      urls: currentUrls,
      shouldUpdate: false,
      error: null,
    };
  }

  if (
    orderedPaths.length !== orderedUrls.length ||
    orderedPaths.length > MAX_HERO_SLIDER_IMAGES
  ) {
    return {
      paths: currentPaths,
      urls: currentUrls,
      shouldUpdate: false,
      error: errors.heroSliderOrderInvalid,
    };
  }

  const currentPairs = new Set(
    currentPaths.map((path, index) => `${path}\u0000${currentUrls[index] ?? ""}`)
  );
  const submittedPairs = orderedPaths.map(
    (path, index) => `${path}\u0000${orderedUrls[index] ?? ""}`
  );

  if (
    submittedPairs.length !== currentPairs.size ||
    submittedPairs.some((pair) => !currentPairs.has(pair))
  ) {
    return {
      paths: currentPaths,
      urls: currentUrls,
      shouldUpdate: false,
      error: errors.heroSliderOrderInvalid,
    };
  }

  return {
    paths: orderedPaths,
    urls: orderedUrls,
    shouldUpdate: true,
    error: null,
  };
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
    .select("slug,hero_image_path,hero_slider_image_paths")
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

  const imagePaths = [
    post.hero_image_path,
    ...((post.hero_slider_image_paths as string[] | null) ?? []),
  ].filter(Boolean);

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .remove(imagePaths);

    if (storageError) {
      console.warn("Unable to remove deleted post hero images:", storageError);
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
  const heroMediaMode = parseBlogHeroMediaMode(formData.get("heroMediaMode"));
  const heroSliderImages =
    heroMediaMode === "slider" ? getHeroSliderImages(formData) : [];
  const removeHeroSliderImages =
    heroMediaMode === "scroll" ||
    formData.get("removeHeroSliderImages") === "on";
  const locale = await getLocale();
  const errors = getDictionary(locale).admin.errors;
  const projectLink = getProjectLinkFields(formData, errors);

  if (!postId) {
    return { error: errors.postIdRequired };
  }

  if (projectLink.error) {
    return { error: projectLink.error };
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

  if (heroSliderImages.length > MAX_HERO_SLIDER_IMAGES) {
    return { error: errors.heroSliderLimit };
  }

  for (const sliderImage of heroSliderImages) {
    const sliderImageError = validateHeroImage(sliderImage, errors);

    if (sliderImageError) {
      return { error: sliderImageError };
    }
  }

  const { supabase, userId } = await requireAdmin("/admin/blog");

  const { data: currentPost, error: loadError } = await supabase
    .from("blog_posts")
    .select("slug,hero_image_path,hero_slider_image_paths,hero_slider_image_urls")
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

  const updatePayload: Record<string, string | string[] | null> = {
    title,
    slug,
    excerpt,
    content,
    author,
    title_sq: titleSq,
    excerpt_sq: excerptSq,
    content_sq: contentSq,
    hero_media_mode: heroMediaMode,
    project_link_label: projectLink.label,
    project_link_url: projectLink.url,
  };

  let uploadedHeroPath: string | null = null;
  const uploadedSliderPaths: string[] = [];
  const currentSliderPaths =
    (currentPost.hero_slider_image_paths as string[] | null) ?? [];
  const currentSliderUrls =
    (currentPost.hero_slider_image_urls as string[] | null) ?? [];

  if (heroImage instanceof File && heroImage.size > 0) {
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

  if (heroSliderImages.length > 0) {
    const heroSliderImageUrls: string[] = [];

    for (const [index, sliderImage] of heroSliderImages.entries()) {
      const sliderExtension = extensionForMimeType(sliderImage.type);

      if (!sliderExtension) {
        if (uploadedHeroPath) {
          await supabase.storage
            .from(BLOG_HERO_BUCKET)
            .remove([uploadedHeroPath]);
        }

        if (uploadedSliderPaths.length > 0) {
          await supabase.storage
            .from(BLOG_HERO_BUCKET)
            .remove(uploadedSliderPaths);
        }

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
        if (uploadedHeroPath) {
          await supabase.storage
            .from(BLOG_HERO_BUCKET)
            .remove([uploadedHeroPath]);
        }

        if (uploadedSliderPaths.length > 0) {
          await supabase.storage
            .from(BLOG_HERO_BUCKET)
            .remove(uploadedSliderPaths);
        }

        return { error: sliderUploadError.message };
      }

      const {
        data: { publicUrl: sliderPublicUrl },
      } = supabase.storage
        .from(BLOG_HERO_BUCKET)
        .getPublicUrl(sliderImagePath);

      uploadedSliderPaths.push(sliderImagePath);
      heroSliderImageUrls.push(sliderPublicUrl);
    }

    updatePayload.hero_slider_image_paths = uploadedSliderPaths;
    updatePayload.hero_slider_image_urls = heroSliderImageUrls;
  } else if (removeHeroSliderImages) {
    updatePayload.hero_slider_image_paths = [];
    updatePayload.hero_slider_image_urls = [];
  } else {
    const orderedExistingSliderImages = getOrderedExistingSliderImages({
      formData,
      currentPaths: currentSliderPaths,
      currentUrls: currentSliderUrls,
      errors,
    });

    if (orderedExistingSliderImages.error) {
      if (uploadedHeroPath) {
        await supabase.storage.from(BLOG_HERO_BUCKET).remove([uploadedHeroPath]);
      }

      return { error: orderedExistingSliderImages.error };
    }

    if (orderedExistingSliderImages.shouldUpdate) {
      updatePayload.hero_slider_image_paths = orderedExistingSliderImages.paths;
      updatePayload.hero_slider_image_urls = orderedExistingSliderImages.urls;
    }
  }

  const { error: updateError } = await supabase
    .from("blog_posts")
    .update(updatePayload)
    .eq("id", postId);

  if (updateError) {
    if (uploadedHeroPath) {
      await supabase.storage.from(BLOG_HERO_BUCKET).remove([uploadedHeroPath]);
    }

    if (uploadedSliderPaths.length > 0) {
      await supabase.storage
        .from(BLOG_HERO_BUCKET)
        .remove(uploadedSliderPaths);
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

  const shouldRemoveExistingSliderImages =
    uploadedSliderPaths.length > 0 || removeHeroSliderImages;

  if (shouldRemoveExistingSliderImages && currentSliderPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BLOG_HERO_BUCKET)
      .remove(currentSliderPaths);

    if (storageError) {
      console.warn(
        "Unable to remove replaced post hero slider images:",
        storageError
      );
    }
  }

  revalidateBlogViews(slug, currentPost.slug);
  revalidatePath(`/admin/blog/${postId}/edit`);

  redirect("/admin/blog");
}
