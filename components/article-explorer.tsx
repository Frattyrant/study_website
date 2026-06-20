"use client";

import { ListFilter, PanelLeft, PanelRight, Rows3, Search, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import siteBackground from "@/public/images/pawn-site-background.webp";
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
import {
  addSearchHistoryEntry,
  SEARCH_HISTORY_CHANGE_EVENT,
  parseSearchHistory,
  removeSearchHistoryEntry,
  SEARCH_HISTORY_STORAGE_KEY,
  serializeSearchHistory,
} from "@/lib/search-history";
import type { CategoryNode, Post, VaultStats } from "@/lib/types";
import type { ArticleCardVariant } from "@/components/article-card";

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
  const searchHost = useSyncExternalStore(
    subscribeToHeaderSearchHost,
    getHeaderSearchHostSnapshot,
    () => null,
  );
  const cardLayoutHost = useSyncExternalStore(
    subscribeToHeaderCardLayoutHost,
    getHeaderCardLayoutHostSnapshot,
    () => null,
  );
  const [cardVariant, setCardVariant] = useState<ArticleCardVariant>("cover");
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchHistorySnapshot = useSyncExternalStore(
    subscribeToSearchHistory,
    getSearchHistorySnapshot,
    () => "",
  );
  const searchHistory = useMemo(
    () => parseSearchHistory(searchHistorySnapshot),
    [searchHistorySnapshot],
  );

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

  const persistSearchHistory = (nextHistory: string[]) => {
    try {
      window.localStorage.setItem(
        SEARCH_HISTORY_STORAGE_KEY,
        serializeSearchHistory(nextHistory),
      );
      window.dispatchEvent(new Event(SEARCH_HISTORY_CHANGE_EVENT));
    } catch {
      // Local storage can be unavailable in privacy modes; search still works.
    }
  };

  const rememberSearchQuery = (value: string) => {
    persistSearchHistory(addSearchHistoryEntry(searchHistory, value));
  };

  const removeSearchHistory = (value: string) => {
    persistSearchHistory(removeSearchHistoryEntry(searchHistory, value));
  };

  return (
    <>
      {searchHost
        ? createPortal(
            <HeaderSearch
              query={query}
              searchHistory={searchHistory}
              searchPanelOpen={searchPanelOpen}
              onFocus={() => setSearchPanelOpen(true)}
              onPanelOpenChange={setSearchPanelOpen}
              onQueryChange={updateQuery}
              onRememberSearch={rememberSearchQuery}
              onRemoveSearch={removeSearchHistory}
              onClearSearchHistory={() => persistSearchHistory([])}
            />,
            searchHost,
          )
        : null}
      {cardLayoutHost
        ? createPortal(
            <CardLayoutToggle
              variant={cardVariant}
              onToggle={() => setCardVariant(getNextCardVariant)}
            />,
            cardLayoutHost,
          )
        : null}
      <section
      className="mx-auto mt-14 w-[min(1180px,calc(100%-36px))] pb-20"
      data-site-id="study-website"
      id="articles"
    >
      <div className="relative mb-6 min-h-80 overflow-hidden rounded-xl border border-line shadow-[0_18px_50px_rgba(23,32,28,0.14)]">
        <Image
          className="object-cover object-center max-md:object-top"
          src={siteBackground}
          alt=""
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1180px"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,8,38,0.38),rgba(32,12,54,0.18)_58%,rgba(255,255,255,0.04))]" />
        <div className="relative z-10 flex min-h-80 items-end p-[clamp(24px,5vw,56px)] max-md:items-start max-md:pt-9">
          <div className="text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-300">
              Notes
            </p>
            <AnimatedTitle />
            <AnimatedTagline />
          </div>
          <div className="hidden">
            <label className="flex min-h-12 items-center gap-2.5 rounded-lg border border-white/35 bg-white/90 px-3.5 shadow-lg backdrop-blur-sm">
            <Search className="shrink-0 text-slate-600" size={20} />
            <input
              className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500"
              type="search"
              placeholder="搜索笔记..."
              autoComplete="off"
              value={query}
              onBlur={() => rememberSearchQuery(query)}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") rememberSearchQuery(query);
              }}
            />
            </label>
            {searchHistory.length > 0 ? (
              <div
                className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-white/80"
                aria-label="最近搜索"
              >
                <span className="font-bold">最近搜索</span>
                {searchHistory.map((item) => (
                  <span
                    className="inline-flex max-w-full items-center overflow-hidden rounded-full border border-white/30 bg-white/15 backdrop-blur-sm"
                    key={item}
                  >
                    <button
                      className="min-w-0 truncate px-2.5 py-1 text-left transition hover:bg-white/15"
                      type="button"
                      onClick={() => {
                        updateQuery(item);
                        rememberSearchQuery(item);
                      }}
                    >
                      {item}
                    </button>
                    <button
                      className="grid size-6 shrink-0 place-items-center text-white/75 transition hover:bg-white/20 hover:text-white"
                      type="button"
                      aria-label={`删除搜索记录 ${item}`}
                      onClick={() => removeSearchHistory(item)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
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
            className="absolute inset-y-0 left-0 z-10 flex w-[min(195px,100%)] flex-col bg-surface shadow-[0_18px_48px_rgba(15,23,42,0.24)]"
            id="mobile-category-drawer"
            ref={categoryDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-category-title"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <div>
                <h2 className="text-[12px] font-bold" id="mobile-category-title">
                  分类筛选
                </h2>
                <p className="text-[12px] text-muted">{filteredPosts.length} 篇匹配笔记</p>
              </div>
              <button
                className="grid size-7 place-items-center rounded-lg border border-line text-muted transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
                type="button"
                ref={categoryCloseRef}
                aria-label="关闭分类筛选"
                onClick={() => setCategoryDrawerOpen(false)}
              >
                <X size={12} />
              </button>
            </div>
            <div className="category-tree-scroll min-h-0 flex-1 overflow-y-auto p-2">
              <CategoryTree
                node={stats.categoryTree}
                activeCategory={activeCategory.key}
                expandedCategories={expandedCategories}
                compact
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
            <div className="grid min-w-0 grid-cols-1 gap-4">
              {visiblePosts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  searchQuery={query}
                  variant={cardVariant}
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
    </>
  );
}

function getSearchHistorySnapshot() {
  try {
    return window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribeToSearchHistory(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SEARCH_HISTORY_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SEARCH_HISTORY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SEARCH_HISTORY_CHANGE_EVENT, onStoreChange);
  };
}

function getHeaderSearchHostSnapshot() {
  return document.getElementById("site-header-search");
}

function subscribeToHeaderSearchHost(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

function getHeaderCardLayoutHostSnapshot() {
  return document.getElementById("site-header-card-layout");
}

function subscribeToHeaderCardLayoutHost(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

function CardLayoutToggle({
  onToggle,
  variant,
}: {
  onToggle: () => void;
  variant: ArticleCardVariant;
}) {
  const config =
    variant === "cover"
      ? {
          Icon: PanelRight,
          label: "切换电线杆背景",
          title: "切换电线杆背景",
        }
      : variant === "right"
        ? {
            Icon: PanelLeft,
            label: "切换溪流背景",
            title: "切换溪流背景",
          }
        : {
            Icon: Rows3,
            label: "切换为桥水背景",
            title: "切换为桥水背景",
          };
  const Icon = config.Icon;

  return (
    <button
      className="grid size-11 cursor-pointer place-items-center rounded-lg border border-line bg-surface text-text transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
      type="button"
      aria-label={config.label}
      title={config.title}
      onClick={onToggle}
    >
      <Icon size={20} />
    </button>
  );
}

function getNextCardVariant(current: ArticleCardVariant): ArticleCardVariant {
  if (current === "cover") return "right";
  if (current === "right") return "left";
  return "cover";
}

interface HeaderSearchProps {
  query: string;
  searchHistory: string[];
  searchPanelOpen: boolean;
  onFocus: () => void;
  onPanelOpenChange: (open: boolean) => void;
  onQueryChange: (value: string) => void;
  onRememberSearch: (value: string) => void;
  onRemoveSearch: (value: string) => void;
  onClearSearchHistory: () => void;
}

function HeaderSearch({
  query,
  searchHistory,
  searchPanelOpen,
  onFocus,
  onPanelOpenChange,
  onQueryChange,
  onRememberSearch,
  onRemoveSearch,
  onClearSearchHistory,
}: HeaderSearchProps) {
  const showPanel = searchPanelOpen;

  return (
    <div
      className="relative mx-auto w-full max-w-xl"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onPanelOpenChange(false);
          const input = event.currentTarget.querySelector("input");
          onRememberSearch(input?.value ?? query);
        }
      }}
    >
      <label className="flex min-h-10 items-center overflow-hidden rounded-lg border border-line bg-surface-strong/95 shadow-sm transition focus-within:border-green focus-within:bg-surface">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
          type="search"
          placeholder="搜索笔记..."
          autoComplete="off"
          value={query}
          onFocus={onFocus}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onRememberSearch(event.currentTarget.value);
          }}
        />
        <span className="grid h-10 w-12 shrink-0 place-items-center border-l border-line bg-surface text-text">
          <Search size={20} />
        </span>
      </label>
      {showPanel ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-lg border border-line bg-surface p-4 shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-text">搜索历史</p>
            <button
              className="text-xs text-muted transition hover:text-green-dark"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClearSearchHistory}
            >
              清空
            </button>
          </div>
          {searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item) => (
                <span
                  className="inline-flex max-w-full items-center overflow-hidden rounded-md bg-surface-strong text-sm text-text"
                  key={item}
                >
                  <button
                    className="min-w-0 truncate px-3 py-1.5 text-left transition hover:text-green-dark"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onQueryChange(item);
                      onRememberSearch(item);
                      onPanelOpenChange(false);
                    }}
                  >
                    {item}
                  </button>
                  <button
                    className="grid size-7 shrink-0 place-items-center text-muted transition hover:bg-surface hover:text-green-dark"
                    type="button"
                    aria-label={`删除搜索记录 ${item}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onRemoveSearch(item)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">暂无搜索记录</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-9.5 items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted [&_strong]:text-green-dark">
      {children}
    </span>
  );
}
