import { getBlogPosts } from "@/lib/blog";
import type { Locale } from "@/lib/i18n";
import BlogSliderTrack from "@/components/BlogSliderTrack";

export default async function BlogSlider({ locale }: { locale: Locale }) {
  const posts = await getBlogPosts(9);

  return <BlogSliderTrack posts={posts} locale={locale} />;
}
