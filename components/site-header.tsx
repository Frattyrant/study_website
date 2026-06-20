import Link from "next/link";

import { NavTools } from "@/components/nav-tools";
import { ThemeToggle } from "@/components/theme-toggle";
import { posts } from "@/lib/content";

const navPosts = posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  categoryPath: post.categoryPath,
}));

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 grid min-h-18 grid-cols-[auto_minmax(0,560px)_auto_auto_auto] items-center gap-3 border-b border-line bg-bg/90 px-[clamp(12px,4vw,64px)] py-3.5 backdrop-blur-xl max-lg:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] max-sm:gap-2">
      <Link className="inline-flex min-w-0 items-center gap-3" href="/" aria-label="返回文章索引">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-green-dark to-blue font-extrabold text-white">
          PW
        </span>
        <span className="min-w-0 max-sm:hidden">
          <strong className="block">pawn的个人学习网站</strong>
          <small className="block text-xs text-muted max-sm:hidden">HAH</small>
        </span>
      </Link>
      <div id="site-header-search" className="min-w-0" />
      <NavTools posts={navPosts} />
      <div id="site-header-card-layout" className="shrink-0" />
      <ThemeToggle />
    </header>
  );
}
