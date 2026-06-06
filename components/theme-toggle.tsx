"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      className="grid size-11 cursor-pointer place-items-center rounded-lg border border-line bg-surface text-text transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
      type="button"
      aria-label={isDark ? "切换到亮色主题" : "切换到暗色主题"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
