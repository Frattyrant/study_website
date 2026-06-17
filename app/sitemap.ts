import type { MetadataRoute } from "next";

import { posts, vaultStats } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const latestDate = vaultStats.latestDate
    ? new Date(`${vaultStats.latestDate}T00:00:00.000Z`)
    : new Date();

  return [
    {
      url: getSiteUrl("/"),
      lastModified: latestDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: getSiteUrl(`/posts/${post.slug}`),
      lastModified: new Date(`${post.date}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
