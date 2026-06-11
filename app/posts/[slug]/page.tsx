import { ArrowLeft, Clock3, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getPostBySlug, normalizeObsidianMarkdown, posts } from "@/lib/content";
import { resolvePublishedImageSource } from "@/lib/content-image";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "study_website";
const basePath = process.env.NODE_ENV === "production" ? `/${repositoryName}` : "";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  return (
    <section className="mx-auto w-[min(1180px,calc(100%-36px))] py-8 sm:py-12">
      <Link
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-text transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
        href="/"
      >
        <ArrowLeft size={18} />
        返回文章索引
      </Link>
      <article className="rounded-lg border border-line bg-surface p-[clamp(22px,4vw,44px)] shadow-[0_14px_36px_rgba(23,32,28,0.08)]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-green-dark px-2 py-0.5 text-xs font-extrabold text-white">{post.type}</span>
          <time className="text-sm text-muted" dateTime={post.date}>{post.date}</time>
        </div>
        <h1 className="max-w-4xl text-3xl font-bold break-anywhere sm:text-4xl">{post.title}</h1>
        <div className="mt-3.5 flex flex-wrap gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-2"><Clock3 size={16} />{post.minutes} 分钟阅读</span>
          {post.source ? (
            <span className="inline-flex min-w-0 items-center gap-2 break-anywhere">
              <FolderOpen className="shrink-0" size={16} />{post.source}
            </span>
          ) : null}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {(post.categoryPath.length ? post.categoryPath : post.tags).map((tag) => (
            <span className="rounded-md border border-line px-2 py-1 text-xs text-blue" key={tag}>{tag}</span>
          ))}
        </div>
        <div className="note-body mt-8 max-w-4xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                const external = Boolean(href?.startsWith("http"));
                return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</a>;
              },
              img: ({ src, alt }) => {
                if (typeof src !== "string") return null;
                const image = resolvePublishedImageSource(src, basePath);
                return (
                  // Markdown images have dynamic dimensions, so a responsive native image is appropriate here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={alt ?? ""}
                    loading="lazy"
                    decoding="async"
                    style={image.width ? { width: `${image.width}px` } : undefined}
                  />
                );
              },
            }}
          >
            {normalizeObsidianMarkdown(post.body || "这篇笔记还没有可展示的正文。")}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  );
}
