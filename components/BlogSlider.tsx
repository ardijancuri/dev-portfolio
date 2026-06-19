import { getBlogPosts } from "@/lib/blog";
import BlogSliderTrack from "@/components/BlogSliderTrack";

export default async function BlogSlider() {
  const posts = await getBlogPosts(4);

  return <BlogSliderTrack posts={posts} />;
}
