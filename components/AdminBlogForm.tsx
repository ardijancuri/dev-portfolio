"use client";

import { useActionState, useEffect, useState } from "react";
import {
  type CreateBlogPostState,
  createBlogPost,
} from "@/app/admin/blog/new/actions";
import { MAX_BLOG_EXCERPT_CHARS } from "@/lib/blog-utils";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";
import { defaultAuthor } from "@/lib/site";

const initialState: CreateBlogPostState = {};

export default function AdminBlogForm({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const [state, formAction, pending] = useActionState(
    createBlogPost,
    initialState
  );
  const t = getDictionary(locale).admin;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updatePreview = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
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
            defaultValue={defaultAuthor}
            required
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-black outline-none transition-colors focus:border-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
          />
        </div>

        <div>
          <label
            htmlFor="heroImage"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.form.heroImage}
          </label>
          <input
            id="heroImage"
            name="heroImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            onChange={(event) => {
              updatePreview(event.target.files?.[0] ?? null);
            }}
            className="w-full border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:border-zinc-800 dark:bg-black dark:text-white dark:file:bg-white dark:file:text-black"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            {t.form.heroHelp}
          </p>
        </div>

        <div className="aspect-[16/10] overflow-hidden border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
              {t.form.preview}
            </div>
          )}
        </div>

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
          {pending ? t.form.publishing : t.form.publish}
        </button>
      </aside>
    </form>
  );
}
