import type { Post } from "./types";

export function findNextPostInCategory(
  posts: Post[],
  slug: string,
): Post | undefined;
