"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  type EditBlogPostState,
  updateBlogPost,
} from "@/app/admin/blog/actions";
import HeroImageFormPreview from "@/components/HeroImageFormPreview";
import HeroMediaModeField from "@/components/HeroMediaModeField";
import SliderImageOrderList, {
  type SliderImageOrderItem,
} from "@/components/SliderImageOrderList";
import type { BlogHeroMediaMode, BlogPost } from "@/lib/blog-types";
import {
  MAX_BLOG_EXCERPT_CHARS,
  MAX_HERO_SLIDER_IMAGES,
  MAX_PROJECT_LINK_LABEL_CHARS,
  MAX_PROJECT_LINK_URL_CHARS,
} from "@/lib/blog-utils";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

const initialState: EditBlogPostState = {};

interface SliderUploadItem extends SliderImageOrderItem {
  file: File;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex < 0 ||
    fromIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function getExistingSliderItems(post: BlogPost): SliderImageOrderItem[] {
  return (post.hero_slider_image_urls ?? []).map((url, index) => ({
    id: `${post.hero_slider_image_paths?.[index] ?? url}-${index}`,
    url,
    path: post.hero_slider_image_paths?.[index] ?? "",
  }));
}

export default function EditBlogPostForm({
  post,
  locale = defaultLocale,
}: {
  post: BlogPost;
  locale?: Locale;
}) {
  const [state, formAction, pending] = useActionState(
    updateBlogPost,
    initialState
  );
  const t = getDictionary(locale).admin;
  const [previewUrl, setPreviewUrl] = useState(post.hero_image_url);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [heroMediaMode, setHeroMediaMode] = useState<BlogHeroMediaMode>(
    post.hero_media_mode ?? "slider"
  );
  const [existingSliderImages, setExistingSliderImages] = useState<
    SliderImageOrderItem[]
  >(getExistingSliderItems(post));
  const [replacementSliderImages, setReplacementSliderImages] = useState<
    SliderUploadItem[]
  >([]);
  const [removeSliderImages, setRemoveSliderImages] = useState(false);
  const displayedSliderImages =
    replacementSliderImages.length > 0
      ? replacementSliderImages
      : removeSliderImages
        ? []
        : existingSliderImages;

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    return () => {
      replacementSliderImages.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [replacementSliderImages]);

  const updatePreview = (file: File | null) => {
    const nextObjectUrl = file ? URL.createObjectURL(file) : null;
    setObjectUrl(nextObjectUrl);
    setPreviewUrl(nextObjectUrl ?? post.hero_image_url);
  };

  const updateSliderPreviews = (files: FileList | null) => {
    const nextItems = files
      ? Array.from(files)
          .slice(0, MAX_HERO_SLIDER_IMAGES)
          .map((file, index) => ({
            id: `${file.name}-${file.lastModified}-${index}`,
            file,
            url: URL.createObjectURL(file),
          }))
      : [];

    setReplacementSliderImages(nextItems);
    setRemoveSliderImages(false);
  };

  const moveSliderImage = (fromIndex: number, toIndex: number) => {
    if (replacementSliderImages.length > 0) {
      setReplacementSliderImages((items) =>
        moveItem(items, fromIndex, toIndex)
      );
      return;
    }

    setExistingSliderImages((items) => moveItem(items, fromIndex, toIndex));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.delete("heroSliderImages");
    if (heroMediaMode === "slider") {
      replacementSliderImages.forEach((item) => {
        formData.append("heroSliderImages", item.file);
      });
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="id" value={post.id} />

      <div className="space-y-6">
        <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <p className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
            {t.form.englishSection}
          </p>
        </div>

        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.title}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            minLength={3}
            maxLength={160}
            required
            defaultValue={post.title}
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.excerpt}
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            minLength={10}
            maxLength={MAX_BLOG_EXCERPT_CHARS}
            rows={6}
            required
            defaultValue={post.excerpt}
            className="w-full resize-y border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            {t.form.markdownHelp} {MAX_BLOG_EXCERPT_CHARS}{" "}
            {t.form.characters}
          </p>
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.content}
          </label>
          <textarea
            id="content"
            name="content"
            minLength={20}
            rows={18}
            required
            defaultValue={post.content}
            className="w-full resize-y border-2 border-zinc-200 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>

        <div className="border-b border-zinc-200 pb-3 pt-4 dark:border-zinc-800">
          <p className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-500">
            {t.form.albanianSection}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            {t.form.albanianHelp}
          </p>
        </div>

        <div>
          <label
            htmlFor="title_sq"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.albanianTitle}
          </label>
          <input
            id="title_sq"
            name="title_sq"
            type="text"
            minLength={3}
            maxLength={160}
            defaultValue={post.title_sq ?? ""}
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>

        <div>
          <label
            htmlFor="excerpt_sq"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.albanianExcerpt}
          </label>
          <textarea
            id="excerpt_sq"
            name="excerpt_sq"
            minLength={10}
            maxLength={MAX_BLOG_EXCERPT_CHARS}
            rows={6}
            defaultValue={post.excerpt_sq ?? ""}
            className="w-full resize-y border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            {t.form.markdownHelp} {MAX_BLOG_EXCERPT_CHARS}{" "}
            {t.form.characters}
          </p>
        </div>

        <div>
          <label
            htmlFor="content_sq"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.albanianContent}
          </label>
          <textarea
            id="content_sq"
            name="content_sq"
            minLength={20}
            rows={18}
            defaultValue={post.content_sq ?? ""}
            className="w-full resize-y border-2 border-zinc-200 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>
      </div>

      <aside className="space-y-6">
        <div>
          <label
            htmlFor="author"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.author}
          </label>
          <input
            id="author"
            name="author"
            type="text"
            defaultValue={post.author}
            required
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>

        <div className="space-y-4 border-y border-zinc-200 py-4 dark:border-zinc-800">
          <div>
            <label
              htmlFor="projectLinkLabel"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t.form.projectLinkLabel}
            </label>
            <input
              id="projectLinkLabel"
              name="projectLinkLabel"
              type="text"
              maxLength={MAX_PROJECT_LINK_LABEL_CHARS}
              defaultValue={post.project_link_label ?? ""}
              placeholder={t.form.projectLinkLabelPlaceholder}
              className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="projectLinkUrl"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t.form.projectLinkUrl}
            </label>
            <input
              id="projectLinkUrl"
              name="projectLinkUrl"
              type="url"
              maxLength={MAX_PROJECT_LINK_URL_CHARS}
              defaultValue={post.project_link_url ?? ""}
              placeholder={t.form.projectLinkUrlPlaceholder}
              className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white"
            />
          </div>

          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            {t.form.projectLinkHelp}
          </p>
        </div>

        <HeroMediaModeField
          mode={heroMediaMode}
          onChange={setHeroMediaMode}
          label={t.form.heroMediaMode}
          help={t.form.heroMediaModeHelp}
          sliderLabel={t.form.imageSlider}
          scrollLabel={t.form.scrollableWebsite}
        />

        <div>
          <label
            htmlFor="heroImage"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {heroMediaMode === "scroll"
              ? t.form.replaceFullPageScreenshot
              : t.form.replaceHeroImage}
          </label>
          <input
            id="heroImage"
            name="heroImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              updatePreview(event.target.files?.[0] ?? null);
            }}
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:border-zinc-800 dark:bg-black dark:text-white dark:file:bg-white dark:file:text-black"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            {heroMediaMode === "scroll"
              ? t.form.replaceFullPageScreenshotHelp
              : t.form.replaceHeroHelp}
          </p>
        </div>

        <HeroImageFormPreview
          src={previewUrl}
          mode={heroMediaMode}
          previewLabel={t.form.preview}
          websitePreviewLabel={t.form.websitePreview}
          scrollHint={t.form.scrollPreview}
        />

        {heroMediaMode === "slider" ? (
          <>
            <div>
              <label
                htmlFor="heroSliderImages"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t.form.replaceHeroSliderImages}
              </label>
              <input
                id="heroSliderImages"
                name="heroSliderImages"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(event) => {
                  const files = event.currentTarget.files;
                  const tooMany = files
                    ? files.length > MAX_HERO_SLIDER_IMAGES
                    : false;

                  event.currentTarget.setCustomValidity(
                    tooMany ? t.errors.heroSliderLimit : ""
                  );

                  if (tooMany) {
                    event.currentTarget.reportValidity();
                    setReplacementSliderImages([]);
                    event.currentTarget.value = "";
                    return;
                  }

                  updateSliderPreviews(files);
                }}
                className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:border-zinc-800 dark:bg-black dark:text-white dark:file:bg-white dark:file:text-black"
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                {t.form.replaceHeroSliderHelp}
              </p>
            </div>

            {(post.hero_slider_image_urls ?? []).length > 0 &&
            replacementSliderImages.length === 0 ? (
              <label
                className={`grid cursor-pointer grid-cols-[1.25rem_1fr] gap-3 border-2 p-3 text-sm transition-colors ${
                  removeSliderImages
                    ? "border-black bg-zinc-50 text-black dark:border-white dark:bg-zinc-950 dark:text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <input
                  name="removeHeroSliderImages"
                  type="checkbox"
                  checked={removeSliderImages}
                  onChange={(event) => {
                    const shouldRemove = event.currentTarget.checked;
                    setRemoveSliderImages(shouldRemove);
                  }}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center border-2 ${
                    removeSliderImages
                      ? "border-black bg-black dark:border-white dark:bg-white"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-black"
                  } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black dark:peer-focus-visible:outline-white`}
                >
                  {removeSliderImages ? (
                    <span className="h-2 w-2 bg-white dark:bg-black" />
                  ) : null}
                </span>
                <span>{t.form.removeHeroSliderImages}</span>
              </label>
            ) : null}

            <SliderImageOrderList
              items={displayedSliderImages}
              label={t.form.selectedSliderImages}
              onMove={moveSliderImage}
              includeHiddenFields={
                replacementSliderImages.length === 0 && !removeSliderImages
              }
            />
          </>
        ) : null}

        {state.error && (
          <p className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? t.form.saving : t.form.save}
        </button>
      </aside>
    </form>
  );
}
