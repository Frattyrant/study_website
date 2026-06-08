import type { Post } from "@/lib/types";

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN");
}

export function getSearchTerms(query: string) {
  return normalizeSearchText(query)
    .match(/[\p{Script=Han}]+|[a-z0-9]+/gu)
    ?.filter(Boolean) ?? [];
}

export function buildPostSearchIndex(post: Post) {
  return normalizeSearchText([
    post.title,
    post.type,
    post.summary,
    post.source ?? "",
    post.body,
    ...post.tags,
    ...post.categoryPath,
  ].join(" "));
}

export function postMatchesSearch(post: Post, query: string) {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return true;

  const index = buildPostSearchIndex(post);
  return terms.every((term) => index.includes(term));
}
