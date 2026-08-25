import { ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import articleCardBridge from "@/public/images/article-card-bridge.webp";
import articleCardTower from "@/public/images/article-card-tower.webp";
import articleCardWater from "@/public/images/article-card-water.webp";
import { getHighlightSegments, getSearchPreview } from "@/lib/search";
import type { Post } from "@/lib/types";

export type ArticleCardVariant = "cover" | "right" | "left";

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
  const sideVariant = variant === "right" || variant === "left";
  const imageTextVariant = variant === "cover" || sideVariant;
  const tagClass = imageTextVariant
    ? "rounded-md border border-white/35 bg-white/16 px-2 py-1 text-xs font-bold text-white/90 backdrop-blur-sm"
    : "rounded-md border border-line bg-surface-strong px-2 py-1 text-xs font-bold text-blue";
  const contentAlignment = sideVariant ? "w-[56%] max-md:w-full" : "w-full";

  return (
    <Link
      className={`group relative flex min-h-[260px] min-w-0 overflow-hidden rounded-lg border border-line bg-surface text-left shadow-[0_12px_30px_rgba(23,32,28,0.08)] transition duration-200 hover:-translate-y-1 hover:border-green hover:shadow-[0_18px_42px_rgba(47,125,92,0.16)] focus-visible:outline-3 focus-visible:outline-green ${
        variant !== "cover"
          ? `${variant === "left" ? "article-card-left" : "article-card-right"} text-text max-sm:min-h-[300px]`
          : "article-card-cover text-white max-sm:min-h-[330px]"
      }`}
      href={`/posts/${post.slug}`}
      aria-label={`阅读 ${post.title}`}
      onClick={onOpen}
      style={
        {
          "--article-card-image": `url("${articleCardBridge.src}")`,
          "--article-card-right-image": `url("${articleCardTower.src}")`,
          "--article-card-left-image": `url("${articleCardWater.src}")`,
        } as CSSProperties
      }
    >
      <div className="article-card-gradient absolute inset-0" />
      <div className={`article-card-copy relative z-10 flex min-h-full flex-col p-5.5 sm:p-7 ${contentAlignment}`}>
        <div
          className="mb-5 flex flex-wrap items-center gap-1.5"
          aria-hidden="true"
        >
          <span
            className="rounded-sm border border-white/55 bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm"
          >
            {post.type}
          </span>
        </div>

        <h2
          className={`max-w-2xl text-2xl font-extrabold leading-tight break-anywhere max-sm:text-xl ${
            imageTextVariant
              ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.42)]"
              : "text-text"
          }`}
        >
          <HighlightedText query={searchQuery} value={post.title} />
        </h2>
        <p
          className={`mt-3 line-clamp-3 max-w-2xl text-sm break-anywhere sm:text-base ${
            imageTextVariant
              ? "text-white/88 drop-shadow-[0_1px_6px_rgba(0,0,0,0.38)]"
              : "text-muted"
          }`}
        >
          <HighlightedText query={searchQuery} value={preview.text} />
        </p>
        {post.source ? (
          <div
            className={`mt-4 flex min-w-0 items-center gap-2 text-xs ${
              imageTextVariant ? "text-white/78" : "text-muted"
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
            imageTextVariant
              ? "text-yellow-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.38)]"
              : "text-green-dark"
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
        {post.type}
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
