"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";

import siteBackground from "@/public/images/pawn-site-background.jpg";
import { ArticleCard } from "@/components/article-card";
import { CategoryTree } from "@/components/category-tree";
import type { Post, VaultStats } from "@/lib/types";

interface ArticleExplorerProps {
  posts: Post[];
  stats: VaultStats;
}

export function ArticleExplorer({ posts, stats }: ArticleExplorerProps) {
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

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory.kind === "root" ||
        (activeCategory.kind === "note"
          ? post.slug === activeCategory.postSlug
          : post.category === activeCategory.key ||
            post.category.startsWith(`${activeCategory.key}/`));
      const searchable = [
        post.title,
        post.type,
        post.summary,
        post.source ?? "",
        ...post.categoryPath,
      ]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, posts, query]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <section className="mx-auto mt-14 w-[min(1180px,calc(100%-36px))] pb-20" id="articles">
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
            <h1 className="text-3xl font-bold drop-shadow-sm sm:text-5xl">
              pawn的个人学习网站
            </h1>
            <p className="mt-4 max-w-2xl text-white/85">记录学习 IT 的过程</p>
          </div>
          <label className="flex min-h-12 w-full max-w-90 items-center gap-2.5 rounded-lg border border-white/35 bg-white/90 px-3.5 shadow-lg backdrop-blur-sm max-md:max-w-none">
            <Search className="shrink-0 text-slate-600" size={20} />
            <input
              className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500"
              type="search"
              placeholder="搜索笔记..."
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mb-5.5 flex flex-wrap gap-2.5" aria-label="笔记统计">
        <StatChip><strong>{stats.publishableNotes || posts.length}</strong> 篇笔记</StatChip>
        <StatChip><strong>{stats.focusCount}</strong> 个方向</StatChip>
        <StatChip>最近更新 <strong>{stats.latestDate?.slice(5) ?? "--"}</strong></StatChip>
      </div>

      <div className="grid grid-cols-[minmax(210px,260px)_1fr] items-start gap-6 max-lg:grid-cols-1">
        <aside className="sticky top-24 rounded-lg border border-line bg-surface p-4 max-lg:static" aria-label="文章分类">
          <p className="mb-3 text-sm font-extrabold text-muted">分类</p>
          <div className="grid gap-1">
            <CategoryTree
              node={stats.categoryTree}
              activeCategory={activeCategory.key}
              expandedCategories={expandedCategories}
              onSelect={setActiveCategory}
              onToggle={toggleCategory}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {filteredPosts.length ? (
            <div className="grid min-w-0 grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {filteredPosts.map((post) => <ArticleCard key={post.slug} post={post} />)}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
              404 NOT FOUND 
            </p>
          )}
        </div>
      </div>
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
