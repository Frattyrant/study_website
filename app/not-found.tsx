import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] w-[min(720px,calc(100%-36px))] place-items-center text-center">
      <div>
        <p className="mb-2 font-extrabold text-green">404</p>
        <h1 className="text-3xl font-bold">没有找到这篇笔记</h1>
        <p className="mt-3 text-muted">链接可能已经更新，返回文章索引继续浏览。</p>
        <Link className="mt-6 inline-flex rounded-lg bg-green-dark px-4 py-2.5 font-bold text-white" href="/">返回首页</Link>
      </div>
    </section>
  );
}
