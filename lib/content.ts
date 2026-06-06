import content from "@/data/content.json";
import type { ContentData, Post } from "@/lib/types";

const data = content as ContentData;

export const posts = data.posts;
export const vaultStats = data.vaultStats;

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function normalizeObsidianMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[\[([^\]]+)]]/g, "$1")
    .replace(/\[\[([^|\]]+)\|([^\]]+)]]/g, "$2")
    .replace(/\[\[([^\]]+)]]/g, "$1");
}
