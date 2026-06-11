"use client";

import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import type { MarkdownHeading } from "@/lib/markdown-headings";

interface ArticleReadingLayoutProps {
  children: ReactNode;
  contentId: string;
  headings: MarkdownHeading[];
}

export function ArticleReadingLayout({
  children,
  contentId,
  headings,
}: ArticleReadingLayoutProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));
    const isAtPageBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;

    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const rect = content.getBoundingClientRect();
      const start = window.scrollY + rect.top - 96;
      const end = start + content.offsetHeight - window.innerHeight + 128;
      const distance = Math.max(1, end - start);
      setProgress(Math.min(1, Math.max(0, (window.scrollY - start) / distance)));
      if (isAtPageBottom() && elements.at(-1)?.id) {
        setActiveId(elements.at(-1)!.id);
      }
    };
    const scheduleProgressUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
    window.addEventListener("resize", scheduleProgressUpdate);

    const observer = new IntersectionObserver(
      (entries) => {
        if (isAtPageBottom() && elements.at(-1)?.id) {
          setActiveId(elements.at(-1)!.id);
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] },
    );
    elements.forEach((element) => observer.observe(element));

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleProgressUpdate);
      window.removeEventListener("resize", scheduleProgressUpdate);
      observer.disconnect();
    };
  }, [contentId, headings]);

  const openHeading = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    setActiveId(id);
  };

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-[72px] z-30 h-1 bg-transparent"
        aria-hidden="true"
      >
        <span
          className="block h-full origin-left bg-green transition-transform duration-150"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {headings.length ? (
        <details className="mb-5 rounded-lg border border-line bg-surface-strong lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 font-bold">
            <span className="inline-flex items-center gap-2">
              <ListTree size={18} />
              本文目录
            </span>
            <ChevronDown className="toc-chevron transition-transform" size={18} />
          </summary>
          <TableOfContents
            activeId={activeId}
            headings={headings}
            onOpen={openHeading}
          />
        </details>
      ) : null}

      <div
        className={
          headings.length
            ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px]"
            : ""
        }
      >
        {children}
        {headings.length ? (
          <aside className="category-tree-scroll sticky top-24 hidden max-h-[calc(100dvh-7.5rem)] overflow-y-auto rounded-lg border border-line bg-surface-strong p-4 lg:block">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold">
              <ListTree size={17} />
              本文目录
            </p>
            <TableOfContents
              activeId={activeId}
              headings={headings}
              onOpen={openHeading}
            />
          </aside>
        ) : null}
      </div>
    </>
  );
}

function TableOfContents({
  activeId,
  headings,
  onOpen,
}: {
  activeId: string;
  headings: MarkdownHeading[];
  onOpen: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <nav className="grid gap-1 px-2 pb-3 lg:px-0 lg:pb-0" aria-label="本文目录">
      {headings.map((heading) => (
        <a
          className={`rounded-md border-l-2 py-1.5 pr-2 text-sm transition ${
            activeId === heading.id
              ? "border-green bg-surface text-green-dark"
              : "border-transparent text-muted hover:border-line hover:bg-surface hover:text-text"
          }`}
          href={`#${heading.id}`}
          key={heading.id}
          aria-current={activeId === heading.id ? "location" : undefined}
          style={{ paddingLeft: `${8 + (heading.level - 2) * 12}px` }}
          onClick={(event) => onOpen(event, heading.id)}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
