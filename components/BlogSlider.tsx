import { getBlogPosts } from "@/lib/blog";
import BlogSliderTrack from "@/components/BlogSliderTrack";

export default async function BlogSlider() {
  const posts = await getBlogPosts(8);

  return <BlogSliderTrack posts={posts} />;
}
