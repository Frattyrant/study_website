import type { MetadataRoute } from "next";

import { posts } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: getSiteUrl(`/posts/${post.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
