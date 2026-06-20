"use client";

import { Rows3, Shuffle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import {
  READING_DENSITY_STORAGE_KEY,
  getNextReadingDensity,
  getRandomPostSlug,
  isReadingDensity,
  type NavPost,
  type ReadingDensity,
} from "@/lib/nav-tools";

const READING_DENSITY_CHANGE_EVENT = "pawn-reading-density-change";

const densityLabels: Record<ReadingDensity, string> = {
  comfortable: "舒适",
  standard: "标准",
  compact: "紧凑",
};

interface NavToolsProps {
  posts: NavPost[];
}

export function NavTools({ posts }: NavToolsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const densitySnapshot = useSyncExternalStore(
    subscribeToReadingDensity,
    getReadingDensitySnapshot,
    () => "standard",
  );
  const density = isReadingDensity(densitySnapshot) ? densitySnapshot : "standard";
  const currentSlug = useMemo(() => {
    const prefix = "/posts/";
    if (!pathname.startsWith(prefix)) return undefined;
    return decodeURIComponent(pathname.slice(prefix.length));
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.readingDensity = density;
  }, [density]);

  const cycleDensity = () => {
    const next = getNextReadingDensity(density);
    document.documentElement.dataset.readingDensity = next;
    try {
      window.localStorage.setItem(READING_DENSITY_STORAGE_KEY, next);
      window.dispatchEvent(new Event(READING_DENSITY_CHANGE_EVENT));
    } catch {
      // Ignore storage failures; the current page can still update immediately.
    }
  };

  const openRandomPost = () => {
    const slug = getRandomPostSlug(posts, currentSlug);
    if (slug) router.push(`/posts/${slug}`);
  };

  return (
    <div className="nav-tools flex shrink-0 items-center gap-2">
      <button
        className="nav-tool-button"
        type="button"
        aria-label={`阅读密度：${densityLabels[density]}，点击切换`}
        title={`阅读密度：${densityLabels[density]}`}
        onClick={cycleDensity}
      >
        <Rows3 size={18} />
        <span className="hidden text-xs font-bold xl:inline">{densityLabels[density]}</span>
      </button>
      <button
        className="nav-tool-button"
        type="button"
        aria-label="随机打开一篇笔记"
        title="随机一篇"
        onClick={openRandomPost}
      >
        <Shuffle size={18} />
      </button>
    </div>
  );
}

function getReadingDensitySnapshot() {
  try {
    return window.localStorage.getItem(READING_DENSITY_STORAGE_KEY) ?? "standard";
  } catch {
    return "standard";
  }
}

function subscribeToReadingDensity(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === READING_DENSITY_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(READING_DENSITY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(READING_DENSITY_CHANGE_EVENT, onStoreChange);
  };
}
