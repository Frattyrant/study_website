"use client";

import { ListFilter, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import siteBackground from "@/public/images/pawn-site-background.jpg";
import { AnimatedTagline } from "@/components/animated-tagline";
import { AnimatedTitle } from "@/components/animated-title";
import { ArticleCard } from "@/components/article-card";
import { CategoryTree } from "@/components/category-tree";
import { EmojiLoopGame } from "@/components/emoji-loop-game";
import { EmojiPile, type EmojiPileHandle } from "@/components/emoji-pile";
import {
  getNextVisibleCount,
  getVisibleItems,
  POST_PAGE_SIZE,
} from "@/lib/pagination";
import { postMatchesSearch } from "@/lib/search";
import type { CategoryNode, Post, VaultStats } from "@/lib/types";

interface ArticleExplorerProps {
  posts: Post[];
  stats: VaultStats;
}

export function ArticleExplorer({ posts, stats }: ArticleExplorerProps) {
  const emojiPileRef = useRef<EmojiPileHandle>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const categoryDrawerRef = useRef<HTMLDivElement>(null);
  const categoryCloseRef = useRef<HTMLButtonElement>(null);
  const [activeCategory, setActiveCategory] = useState(stats.categoryTree);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () =>
      new Set([
        stats.categoryTree.key,
        ...stats.categoryTree.children
          .filter((category) => category.kind === "module")
          .map((category) => category.key),
      ]),
  );
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(POST_PAGE_SIZE);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory.kind === "root" ||
        (activeCategory.kind === "note"
          ? post.slug === activeCategory.postSlug
          : post.category === activeCategory.key ||
            post.category.startsWith(`${activeCategory.key}/`));
      return matchesCategory && postMatchesSearch(post, query);
    });
  }, [activeCategory, posts, query]);

  const visiblePosts = useMemo(
    () => getVisibleItems(filteredPosts, visibleCount),
    [filteredPosts, visibleCount],
  );
  const remainingCount = Math.max(0, filteredPosts.length - visiblePosts.length);

  useEffect(() => {
    if (!categoryDrawerOpen) return;

    const categoryButton = categoryButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    document.body.style.overflow = "hidden";
    categoryCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoryDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = categoryDrawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setCategoryDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopMedia.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopMedia.removeEventListener("change", closeOnDesktop);
      categoryButton?.focus();
    };
  }, [categoryDrawerOpen]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const selectCategory = (category: CategoryNode) => {
    setActiveCategory(category);
    setVisibleCount(POST_PAGE_SIZE);
    setCategoryDrawerOpen(false);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(POST_PAGE_SIZE);
  };

  return (
    <section
      className="mx-auto mt-14 w-[min(1180px,calc(100%-36px))] pb-20"
      data-site-id="study-website"
      id="articles"
    >
      <div className="relative mb-6 min-h-80 overflow-hidden rounded-xl border border-line shadow-[0_18px_50px_rgba(23,32,28,0.14)]">
        <Image
          className="object-cover object-center"
          src={siteBackground}
          alt=""
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1180px"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,8,38,0.82),rgba(32,12,54,0.46)_58%,rgba(32,12,54,0.16))]" />
        <div className="relative z-10 flex min-h-80 items-end justify-between gap-8 p-[clamp(24px,5vw,56px)] max-md:flex-col max-md:items-stretch max-md:justify-end">
          <div className="text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-300">
              Notes
            </p>
            <AnimatedTitle />
            <AnimatedTagline />
          </div>
          <label className="flex min-h-12 w-full max-w-90 items-center gap-2.5 rounded-lg border border-white/35 bg-white/90 px-3.5 shadow-lg backdrop-blur-sm max-md:max-w-none">
            <Search className="shrink-0 text-slate-600" size={20} />
            <input
              className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500"
              type="search"
              placeholder="搜索笔记..."
              autoComplete="off"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mb-5.5 flex flex-wrap items-center gap-3" aria-label="笔记统计与 Emoji 小游戏">
        <div className="flex flex-wrap gap-2.5">
          <StatChip><strong>{stats.publishableNotes || posts.length}</strong> 篇笔记</StatChip>
          <StatChip><strong>{stats.focusCount}</strong> 个方向</StatChip>
          <StatChip>最近更新 <strong>{stats.latestDate?.slice(5) ?? "--"}</strong></StatChip>
        </div>
        <div className="ml-auto flex items-center gap-2 max-sm:mx-auto max-sm:w-full max-sm:justify-center">
          <EmojiLoopGame
            onEmojiSpawn={(emoji, origin) => emojiPileRef.current?.spawn(emoji, origin)}
          />
        </div>
      </div>

      <button
        className="mb-4 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left text-sm text-text transition hover:border-green hover:bg-surface-strong lg:hidden"
        type="button"
        ref={categoryButtonRef}
        aria-haspopup="dialog"
        aria-expanded={categoryDrawerOpen}
        aria-controls="mobile-category-drawer"
        onClick={() => setCategoryDrawerOpen(true)}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <ListFilter className="shrink-0 text-green-dark" size={18} />
          <span className="truncate">
            分类筛选：<strong>{activeCategory.label}</strong>
          </span>
        </span>
        <span className="shrink-0 text-muted">{filteredPosts.length} 篇</span>
      </button>

      {categoryDrawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            className="absolute inset-0 cursor-default bg-slate-950/55"
            type="button"
            aria-label="关闭分类筛选"
            onClick={() => setCategoryDrawerOpen(false)}
          />
          <div
            className="absolute inset-y-0 left-0 z-10 flex w-[min(340px,calc(100%-48px))] flex-col border-r border-line bg-surface shadow-[18px_0_48px_rgba(15,23,42,0.24)]"
            id="mobile-category-drawer"
            ref={categoryDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-category-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="font-bold" id="mobile-category-title">
                  分类筛选
                </h2>
                <p className="text-xs text-muted">{filteredPosts.length} 篇匹配笔记</p>
              </div>
              <button
                className="grid size-10 place-items-center rounded-lg border border-line text-muted transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
                type="button"
                ref={categoryCloseRef}
                aria-label="关闭分类筛选"
                onClick={() => setCategoryDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="category-tree-scroll min-h-0 flex-1 overflow-y-auto p-4">
              <CategoryTree
                node={stats.categoryTree}
                activeCategory={activeCategory.key}
                expandedCategories={expandedCategories}
                onSelect={selectCategory}
                onToggle={toggleCategory}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(210px,260px)_1fr]">
        <aside
          className="sticky top-24 hidden max-h-[calc(100dvh-7.5rem)] flex-col rounded-lg border border-line bg-surface p-4 lg:flex"
          aria-label="文章分类"
        >
          <p className="mb-3 shrink-0 text-sm font-extrabold text-muted">分类</p>
          <div className="category-tree-scroll grid min-h-0 gap-1 overflow-y-auto pr-1 max-lg:overflow-visible max-lg:pr-0">
            <CategoryTree
              node={stats.categoryTree}
              activeCategory={activeCategory.key}
              expandedCategories={expandedCategories}
              onSelect={selectCategory}
              onToggle={toggleCategory}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {filteredPosts.length ? (
            <div className="grid min-w-0 grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {visiblePosts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  searchQuery={query}
                  onOpen={() => emojiPileRef.current?.clear()}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
              404 NOT FOUND 
            </p>
          )}
          {remainingCount > 0 ? (
            <div className="mt-6 flex justify-center">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-green bg-surface px-5 py-2.5 font-bold text-green-dark transition hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    getNextVisibleCount(current, filteredPosts.length),
                  )
                }
              >
                加载更多（剩余 {remainingCount} 篇）
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <EmojiPile ref={emojiPileRef} />
    </section>
  );
}

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-9.5 items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted [&_strong]:text-green-dark">
      {children}
    </span>
  );
}
