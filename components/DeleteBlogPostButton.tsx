"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlogPost } from "@/app/admin/blog/actions";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export default function DeleteBlogPostButton({
  postId,
  title,
  locale = defaultLocale,
}: {
  postId: string;
  title: string;
  locale?: Locale;
}) {
  const router = useRouter();
  const t = getDictionary(locale).admin;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);

    if (
      !window.confirm(
        `${t.deleteConfirmStart} "${title}"? ${t.deleteConfirmEnd}`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogPost(postId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="w-full border-2 border-zinc-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-red-400 dark:hover:border-red-400 sm:w-auto"
      >
        {pending ? t.deleting : t.delete}
      </button>
      {error && (
        <p className="max-w-52 text-xs leading-relaxed text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
