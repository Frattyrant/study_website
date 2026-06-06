import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-6 border-b border-line bg-bg/90 px-[clamp(18px,4vw,64px)] py-3.5 backdrop-blur-xl">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="返回文章索引">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-green-dark to-blue font-extrabold text-white">
          PW
        </span>
        <span>
          <strong className="block">pawn的个人学习网站</strong>
          <small className="block text-xs text-muted max-sm:hidden">HAH</small>
        </span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
