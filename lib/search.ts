import type { Post } from "@/lib/types";

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN");
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export interface SearchPreview {
  text: string;
  source: "summary" | "body";
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
    stripMarkdownForSearch(post.body),
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

export function getHighlightSegments(value: string, query: string): HighlightSegment[] {
  const terms = [...new Set(getSearchTerms(query))].sort((a, b) => b.length - a.length);
  if (!value || terms.length === 0) {
    return [{ text: value, highlighted: false }];
  }

  const normalizedValue = normalizeSearchText(value);
  const ranges: Array<[number, number]> = [];

  for (const term of terms) {
    let index = normalizedValue.indexOf(term);
    while (index >= 0) {
      ranges.push([index, index + term.length]);
      index = normalizedValue.indexOf(term, index + Math.max(term.length, 1));
    }
  }

  if (ranges.length === 0) {
    return [{ text: value, highlighted: false }];
  }

  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) {
      previous[1] = Math.max(previous[1], range[1]);
    } else {
      merged.push([...range]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: value.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: value.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < value.length) {
    segments.push({ text: value.slice(cursor), highlighted: false });
  }
  return segments;
}

function stripMarkdownForSearch(value: string) {
  return value
    .replace(/```[^\n]*\n?/g, " ")
    .replace(/!\[\[([^\]]+)]]/g, " ")
    .replace(/!\[([^\]]*)]\([^)]*\)/g, " ")
    .replace(/\[\[([^|\]]+)\|([^\]]+)]]/g, "$2")
    .replace(/\[\[([^\]]+)]]/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[#>*+\-\d.\s]+/gm, "")
    .replace(/[*_~`|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchPreview(
  post: Pick<Post, "summary" | "body">,
  query: string,
): SearchPreview {
  const terms = getSearchTerms(query);
  if (terms.length === 0) {
    return { text: post.summary, source: "summary" };
  }

  const normalizedSummary = normalizeSearchText(post.summary);
  if (terms.some((term) => normalizedSummary.includes(term))) {
    return { text: post.summary, source: "summary" };
  }

  const body = stripMarkdownForSearch(post.body);
  const normalizedBody = normalizeSearchText(body);
  const firstMatch = terms
    .map((term) => ({ index: normalizedBody.indexOf(term), length: term.length }))
    .filter((match) => match.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!firstMatch) {
    return { text: post.summary, source: "summary" };
  }

  const start = Math.max(0, firstMatch.index - 55);
  const end = Math.min(body.length, firstMatch.index + firstMatch.length + 95);
  return {
    text: `${start > 0 ? "..." : ""}${body.slice(start, end).trim()}${end < body.length ? "..." : ""}`,
    source: "body",
  };
}
