import type { Post } from "./types";

export function findNextPostInCategory(
  posts: Post[],
  slug: string,
): Post | undefined;

export function findPostsInSameCategory(posts: Post[], slug: string): Post[];
