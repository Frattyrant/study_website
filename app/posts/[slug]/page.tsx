import { ArrowLeft, ArrowRight, Clock3, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ArticleReadingLayout } from "@/components/article-reading-layout";
import {
  getNextPostInCategory,
  getPostBySlug,
  getPostsInSameCategory,
  normalizeObsidianMarkdown,
  posts,
} from "@/lib/content";
import { resolvePublishedImageSource } from "@/lib/content-image";
import {
  createHeadingIdAllocator,
  extractMarkdownHeadings,
} from "@/lib/markdown-headings";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/site";

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
  if (!post) return {};

  const url = getSiteUrl(`/posts/${post.slug}`);
  const keywords = [
    ...post.categoryPath,
    ...post.tags,
    post.type,
    "技术笔记",
    "个人知识库",
  ].filter(Boolean);

  return {
    title: post.title,
    description: post.summary || SITE_DESCRIPTION,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: SITE_LOCALE,
      url,
      siteName: SITE_NAME,
      title: post.title,
      description: post.summary || SITE_DESCRIPTION,
      publishedTime: `${post.date}T00:00:00.000Z`,
      modifiedTime: `${post.date}T00:00:00.000Z`,
      tags: keywords,
      images: [
        {
          url: getSiteUrl("/images/pawn-site-background.webp"),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary || SITE_DESCRIPTION,
      images: [getSiteUrl("/images/pawn-site-background.webp")],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();
  const nextPost = getNextPostInCategory(post.slug);
  const sameCategoryPosts = getPostsInSameCategory(post.slug);

  const markdown = normalizeObsidianMarkdown(
    post.body || "这篇笔记还没有可展示的正文。",
  );
  const headings = extractMarkdownHeadings(markdown);
  const allocateHeadingId = createHeadingIdAllocator();
  const articleUrl = getSiteUrl(`/posts/${post.slug}`);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.summary || SITE_DESCRIPTION,
    datePublished: `${post.date}T00:00:00.000Z`,
    dateModified: `${post.date}T00:00:00.000Z`,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: getSiteUrl("/"),
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: getSiteUrl("/"),
    },
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    inLanguage: "zh-CN",
    keywords: [...post.categoryPath, ...post.tags].join(", "),
    articleSection: post.categoryPath.join(" / ") || post.category,
  };
  const heading = (level: 2 | 3 | 4) =>
    function MarkdownHeading({ children }: { children?: ReactNode }) {
      return (
        <HeadingTag id={allocateHeadingId(getNodeText(children))} level={level}>
          {children}
        </HeadingTag>
      );
    };

  return (
    <section className="mx-auto w-[min(1180px,calc(100%-36px))] py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-text transition hover:border-green hover:bg-surface-strong hover:text-green-dark"
        href="/"
      >
        <ArrowLeft size={18} />
        返回文章索引
      </Link>
      <article className="rounded-lg border border-line bg-surface p-[clamp(22px,4vw,44px)] shadow-[0_14px_36px_rgba(23,32,28,0.08)]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-green-dark px-2 py-0.5 text-xs font-extrabold text-white">
            {post.type}
          </span>
          <time className="text-sm text-muted" dateTime={post.date}>
            {post.date}
          </time>
        </div>
        <h1 className="max-w-4xl text-3xl font-bold break-anywhere sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3.5 flex flex-wrap gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {post.minutes} 分钟阅读
          </span>
          {post.source ? (
            <span className="inline-flex min-w-0 items-center gap-2 break-anywhere">
              <FolderOpen className="shrink-0" size={16} />
              {post.source}
            </span>
          ) : null}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {(post.categoryPath.length ? post.categoryPath : post.tags).map((tag) => (
            <span
              className="rounded-md border border-line px-2 py-1 text-xs text-blue"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8">
          <ArticleReadingLayout contentId="article-content" headings={headings}>
            <div className="note-body min-w-0 max-w-4xl" id="article-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: heading(2),
                  h3: heading(3),
                  h4: heading(4),
                  a: ({ href, children }) => {
                    const external = Boolean(href?.startsWith("http"));
                    return (
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {children}
                      </a>
                    );
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
                {markdown}
              </ReactMarkdown>
            </div>
          </ArticleReadingLayout>
        </div>
        {nextPost ? (
          <Link
            className="group mt-10 flex min-h-24 items-center justify-between gap-5 rounded-lg border border-line bg-surface-strong px-5 py-4 text-text transition hover:border-green hover:bg-surface hover:text-green-dark"
            href={`/posts/${nextPost.slug}`}
          >
            <span className="min-w-0">
              <span className="block text-xs font-extrabold tracking-wide text-muted">
                下一篇
              </span>
              <strong className="mt-1 block text-lg break-anywhere">
                {nextPost.title}
              </strong>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="shrink-0 transition-transform group-hover:translate-x-1"
              size={22}
            />
          </Link>
        ) : null}
        {sameCategoryPosts.length > 1 ? (
          <nav
            aria-label="本目录"
            className="mt-6 rounded-lg border border-line bg-surface-strong p-4"
          >
            <h2 className="text-sm font-extrabold text-muted">本目录</h2>
            <ol className="mt-3 grid gap-2">
              {sameCategoryPosts.map((categoryPost, index) => {
                const current = categoryPost.slug === post.slug;
                const label = `${index + 1}. ${categoryPost.title}`;

                return (
                  <li key={categoryPost.slug}>
                    {current ? (
                      <span
                        className="block rounded-md border border-green bg-surface px-3 py-2 text-sm font-bold text-green-dark break-anywhere"
                        aria-current="page"
                      >
                        {label}
                      </span>
                    ) : (
                      <Link
                        className="block rounded-md border border-transparent px-3 py-2 text-sm text-text transition break-anywhere hover:border-green hover:bg-surface hover:text-green-dark"
                        href={`/posts/${categoryPost.slug}`}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </article>
    </section>
  );
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return "";
}

function HeadingTag({
  children,
  id,
  level,
}: {
  children: ReactNode;
  id: string;
  level: 2 | 3 | 4;
}) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag className="scroll-mt-24" id={id}>
      {children}
    </Tag>
  );
}
