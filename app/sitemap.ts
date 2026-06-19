import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
