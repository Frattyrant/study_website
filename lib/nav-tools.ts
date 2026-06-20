import type { Post } from "@/lib/types";

export const READING_DENSITY_STORAGE_KEY = "pawn-reading-density-v1";

export const READING_DENSITIES = ["comfortable", "standard", "compact"] as const;

export type ReadingDensity = (typeof READING_DENSITIES)[number];

export interface NavPost {
  slug: string;
  title: string;
  categoryPath: string[];
}

export function getNextReadingDensity(
  current: ReadingDensity = "standard",
): ReadingDensity {
  const currentIndex = READING_DENSITIES.indexOf(current);
  const safeIndex = currentIndex >= 0 ? currentIndex : 1;
  return READING_DENSITIES[(safeIndex + 1) % READING_DENSITIES.length];
}

export function isReadingDensity(value: string): value is ReadingDensity {
  return READING_DENSITIES.includes(value as ReadingDensity);
}

export function getRandomPostSlug(
  posts: Pick<Post, "slug">[],
  currentSlug?: string,
  random: () => number = Math.random,
): string | undefined {
  if (posts.length === 0) return undefined;
  if (posts.length === 1) return posts[0].slug;

  const candidates = currentSlug
    ? posts.filter((post) => post.slug !== currentSlug)
    : posts;
  const pool = candidates.length > 0 ? candidates : posts;
  const randomValue = random();
  const safeRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  return pool[Math.floor(safeRandom * pool.length)]?.slug;
}
