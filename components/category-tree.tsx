"use client";

import { ChevronRight } from "lucide-react";

import type { CategoryNode } from "@/lib/types";

interface CategoryTreeProps {
  node: CategoryNode;
  activeCategory: string;
  expandedCategories: Set<string>;
  level?: number;
  onSelect: (category: CategoryNode) => void;
  onToggle: (category: string) => void;
}

export function CategoryTree({
  node,
  activeCategory,
  expandedCategories,
  level = 0,
  onSelect,
  onToggle,
}: CategoryTreeProps) {
  const isDirectory = node.kind !== "note";
  const isExpanded = expandedCategories.has(node.key);
  const childrenId = `category-children-${encodeURIComponent(node.key)}`;

  return (
    <>
      <div
        className="grid grid-cols-[28px_1fr] items-center gap-1"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {isDirectory ? (
          <button
            className="grid h-9 w-8 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-surface-strong hover:text-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            type="button"
            aria-label={`${isExpanded ? "收起" : "展开"}${node.label}`}
            aria-expanded={isExpanded}
            aria-controls={childrenId}
            title={`${isExpanded ? "收起" : "展开"}${node.label}`}
            onClick={() => onToggle(node.key)}
          >
            <ChevronRight
              className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              size={16}
            />
          </button>
        ) : (
          <span className="h-9 w-8" />
        )}
        <button
          className={`flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-1.5 text-left text-sm transition ${
            node.key === activeCategory
              ? "border-green bg-surface-strong text-green-dark"
              : "border-transparent text-muted hover:border-green hover:bg-surface-strong hover:text-green-dark"
          }`}
          type="button"
          onClick={() => onSelect(node)}
        >
          <span>{node.label}</span>
          <small className="text-xs">{node.count}</small>
        </button>
      </div>
      {isDirectory && isExpanded && node.children.length > 0 ? (
        <div className="grid gap-1" id={childrenId}>
          {node.children.map((child) => (
            <CategoryTree
              key={child.key}
              node={child}
              activeCategory={activeCategory}
              expandedCategories={expandedCategories}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
