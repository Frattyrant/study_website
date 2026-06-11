import { ArrowRight, Clock3, FolderOpen } from "lucide-react";
import Link from "next/link";

import { getHighlightSegments, getSearchPreview } from "@/lib/search";
import type { Post } from "@/lib/types";

interface ArticleCardProps {
  post: Post;
  searchQuery?: string;
  onOpen?: () => void;
}

export function ArticleCard({ post, searchQuery = "", onOpen }: ArticleCardProps) {
  const preview = getSearchPreview(post, searchQuery);

  return (
    <Link
      className="flex min-h-66 min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface p-5.5 text-left text-text transition duration-200 hover:-translate-y-1 hover:border-green hover:shadow-[0_14px_36px_rgba(47,125,92,0.13)] focus-visible:outline-3 focus-visible:outline-green"
      href={`/posts/${post.slug}`}
      aria-label={`阅读 ${post.title}`}
      onClick={onOpen}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-green-dark px-2 py-0.5 text-xs font-extrabold text-white">
          {post.type}
        </span>
        <time className="text-sm text-muted" dateTime={post.date}>
          {post.date}
        </time>
      </div>
      <h2 className="text-lg font-bold break-anywhere">
        <HighlightedText query={searchQuery} value={post.title} />
      </h2>
      <p className="my-3 text-muted break-anywhere">
        <HighlightedText query={searchQuery} value={preview.text} />
      </p>
      <div className="mt-auto flex items-center gap-2 text-sm text-muted">
        <Clock3 size={16} />
        <span>{post.minutes} 分钟阅读</span>
      </div>
      {post.source ? (
        <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted">
          <FolderOpen className="shrink-0" size={16} />
          <span className="truncate">{post.source}</span>
        </div>
      ) : null}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {(post.categoryPath.length ? post.categoryPath : post.tags).map((tag) => (
          <span className="rounded-md border border-line px-2 py-1 text-xs text-blue" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <span className="mt-4.5 inline-flex items-center gap-2 font-extrabold text-green-dark">
        阅读笔记
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}

function HighlightedText({ value, query }: { value: string; query: string }) {
  return getHighlightSegments(value, query).map((segment, index) =>
    segment.highlighted ? (
      <mark
        className="rounded-sm bg-yellow-300 px-0.5 text-slate-950 dark:bg-yellow-200"
        key={`${index}-${segment.text}`}
      >
        {segment.text}
      </mark>
    ) : (
      segment.text
    ),
  );
}
