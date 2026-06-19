"use client";

import { ChevronRight } from "lucide-react";

import type { CategoryNode } from "@/lib/types";

interface CategoryTreeProps {
  node: CategoryNode;
  activeCategory: string;
  expandedCategories: Set<string>;
  compact?: boolean;
  level?: number;
  onSelect: (category: CategoryNode) => void;
  onToggle: (category: string) => void;
}

export function CategoryTree({
  node,
  activeCategory,
  expandedCategories,
  compact = false,
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
        className={`grid items-center ${
          compact ? "grid-cols-[20px_1fr] gap-0.5" : "grid-cols-[28px_1fr] gap-1"
        }`}
        style={{ paddingLeft: `${level * (compact ? 8 : 16)}px` }}
      >
        {isDirectory ? (
          <button
            className={`grid cursor-pointer place-items-center text-muted transition hover:bg-surface-strong hover:text-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${
              compact ? "h-6 w-5 rounded-md" : "h-9 w-8 rounded-lg"
            }`}
            type="button"
            aria-label={`${isExpanded ? "收起" : "展开"}${node.label}`}
            aria-expanded={isExpanded}
            aria-controls={childrenId}
            title={`${isExpanded ? "收起" : "展开"}${node.label}`}
            onClick={() => onToggle(node.key)}
          >
            <ChevronRight
              className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              size={compact ? 10 : 16}
            />
          </button>
        ) : (
          <span className={compact ? "h-6 w-5" : "h-9 w-8"} />
        )}
        <button
          className={`flex w-full cursor-pointer items-center justify-between rounded-lg border text-left transition ${
            compact
              ? "min-h-6 gap-1.5 px-1.5 py-1 text-[12px] leading-snug"
              : "min-h-9 gap-3 px-2.5 py-1.5 text-sm"
          } ${
            node.key === activeCategory
              ? "border-green bg-surface-strong text-green-dark"
              : "border-transparent text-muted hover:border-green hover:bg-surface-strong hover:text-green-dark"
          }`}
          type="button"
          style={
            compact
              ? {
                  fontSize: "12px",
                  lineHeight: 1.25,
                }
              : undefined
          }
          onClick={() => onSelect(node)}
        >
          <span className="min-w-0">{node.label}</span>
          <small
            className={compact ? "text-[12px]" : "text-xs"}
            style={compact ? { fontSize: "12px", lineHeight: 1.2 } : undefined}
          >
            {node.count}
          </small>
        </button>
      </div>
      {isDirectory && isExpanded && node.children.length > 0 ? (
        <div className={compact ? "grid gap-0.5" : "grid gap-1"} id={childrenId}>
          {node.children.map((child) => (
            <CategoryTree
              key={child.key}
              node={child}
              activeCategory={activeCategory}
              expandedCategories={expandedCategories}
              compact={compact}
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
