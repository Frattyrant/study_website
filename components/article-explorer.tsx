"use client";

import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { ArticleCard } from "@/components/article-card";
import { CategoryTree } from "@/components/category-tree";
import type { Post, VaultStats } from "@/lib/types";

interface ArticleExplorerProps {
  posts: Post[];
  stats: VaultStats;
}

export function ArticleExplorer({ posts, stats }: ArticleExplorerProps) {
  const [activeCategory, setActiveCategory] = useState(stats.categoryTree.key);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === stats.categoryTree.key ||
        post.category === activeCategory ||
        post.category.startsWith(`${activeCategory}/`);
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
  }, [activeCategory, posts, query, stats.categoryTree.key]);

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
      <div className="mb-6 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase text-green">Articles</p>
          <h1 className="text-3xl font-bold sm:text-4xl">pawn的个人学习网站</h1>
          <p className="mt-4 max-w-3xl text-muted">
            记录学习IT过程
          </p>
        </div>
        <label className="flex min-h-12 w-full max-w-90 items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 max-sm:max-w-none">
          <Search className="shrink-0 text-muted" size={20} />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none"
            type="search"
            placeholder="想搜啥?"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="mb-5.5 flex flex-wrap gap-2.5" aria-label="笔记统计">
        <StatChip><strong>{posts.length}</strong> 篇文章</StatChip>
        <StatChip><strong>{stats.totalNotes || posts.length}</strong> 篇笔记</StatChip>
        <StatChip><strong>{stats.focusCount}</strong> 个方向</StatChip>
        <StatChip>最近更新 <strong>{stats.latestDate?.slice(5) ?? "--"}</strong></StatChip>
      </div>

      <div className="grid grid-cols-[minmax(210px,260px)_1fr] items-start gap-6 max-lg:grid-cols-1">
        <aside className="sticky top-24 rounded-lg border border-line bg-surface p-4 max-lg:static" aria-label="文章分类">
          <p className="mb-3 text-sm font-extrabold text-muted">分类</p>
          <div className="grid gap-1">
            <CategoryTree
              node={stats.categoryTree}
              activeCategory={activeCategory}
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
