import { ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import articleCardBridge from "@/public/images/article-card-bridge.webp";
import articleCardTower from "@/public/images/article-card-tower.webp";
import { getHighlightSegments, getSearchPreview } from "@/lib/search";
import type { Post } from "@/lib/types";

export type ArticleCardVariant = "cover" | "side";

interface ArticleCardProps {
  post: Post;
  searchQuery?: string;
  variant?: ArticleCardVariant;
  onOpen?: () => void;
}

export function ArticleCard({
  post,
  searchQuery = "",
  variant = "cover",
  onOpen,
}: ArticleCardProps) {
  const preview = getSearchPreview(post, searchQuery);
  const sideVariant = variant === "side";
  const tagClass = sideVariant
    ? "rounded-md border border-line bg-surface-strong px-2 py-1 text-xs font-bold text-blue"
    : "rounded-md border border-white/35 bg-white/16 px-2 py-1 text-xs font-bold text-white/90 backdrop-blur-sm";

  return (
    <Link
      className={`group relative flex min-h-[260px] min-w-0 overflow-hidden rounded-lg border border-line bg-surface text-left shadow-[0_12px_30px_rgba(23,32,28,0.08)] transition duration-200 hover:-translate-y-1 hover:border-green hover:shadow-[0_18px_42px_rgba(47,125,92,0.16)] focus-visible:outline-3 focus-visible:outline-green ${
        sideVariant
          ? "article-card-side text-text max-sm:min-h-[300px]"
          : "article-card-cover text-white max-sm:min-h-[330px]"
      }`}
      href={`/posts/${post.slug}`}
      aria-label={`阅读 ${post.title}`}
      onClick={onOpen}
      style={
        {
          "--article-card-image": `url("${articleCardBridge.src}")`,
          "--article-card-side-image": `url("${articleCardTower.src}")`,
        } as CSSProperties
      }
    >
      {sideVariant ? (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--surface)_0%,var(--surface)_54%,color-mix(in_srgb,var(--surface)_70%,transparent)_72%,transparent_100%)]" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,15,13,0.74),rgba(10,15,13,0.36)_48%,rgba(10,15,13,0.12)),linear-gradient(180deg,rgba(255,248,232,0.2),rgba(8,14,12,0.22))]" />
      )}
      <div className="relative z-10 flex min-h-full w-full flex-col p-5.5 sm:p-7">
        <div
          className="mb-5 flex flex-wrap items-center gap-1.5"
          aria-hidden="true"
        >
          <span
            className={
              sideVariant
                ? "rounded-sm border border-line bg-surface-strong px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-green-dark"
                : "rounded-sm border border-white/55 bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm"
            }
          >
            {post.type}
          </span>
          <time
            className={
              sideVariant
                ? "rounded-sm border border-line bg-surface-strong px-1.5 py-0.5 text-[10px] font-bold text-muted"
                : "rounded-sm border border-white/45 bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
            }
            dateTime={post.date}
          >
            {post.date.slice(5)}
          </time>
        </div>

        <h2
          className={`max-w-2xl text-2xl font-extrabold leading-tight break-anywhere max-sm:text-xl ${
            sideVariant
              ? "text-text"
              : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.42)]"
          }`}
        >
          <HighlightedText query={searchQuery} value={post.title} />
        </h2>
        <p
          className={`mt-3 line-clamp-3 max-w-2xl text-sm break-anywhere sm:text-base ${
            sideVariant
              ? "text-muted"
              : "text-white/88 drop-shadow-[0_1px_6px_rgba(0,0,0,0.38)]"
          }`}
        >
          <HighlightedText query={searchQuery} value={preview.text} />
        </p>
        {post.source ? (
          <div
            className={`mt-4 flex min-w-0 items-center gap-2 text-xs ${
              sideVariant ? "text-muted" : "text-white/78"
            }`}
          >
            <FolderOpen className="shrink-0" size={15} />
            <span className="truncate">{post.source}</span>
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          {(post.categoryPath.length ? post.categoryPath : post.tags).slice(0, 4).map((tag) => (
            <span className={tagClass} key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <span
          className={`mt-4 inline-flex items-center gap-2 font-extrabold ${
            sideVariant
              ? "text-green-dark"
              : "text-yellow-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.38)]"
          }`}
        >
          阅读笔记
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            size={18}
          />
        </span>
      </div>
      <span
        className="sr-only"
        aria-hidden={false}
      >
        {post.type} {post.date}
      </span>
    </Link>
  );
}

function HighlightedText({ value, query }: { value: string; query: string }) {
  return getHighlightSegments(value, query).map((segment, index) =>
    segment.highlighted ? (
      <mark
        className="rounded-sm bg-yellow-300 px-0.5 text-slate-950 shadow-[0_0_12px_rgba(253,224,71,0.42)] dark:bg-yellow-200"
        key={`${index}-${segment.text}`}
      >
        {segment.text}
      </mark>
    ) : (
      segment.text
    ),
  );
}
