import { ArticleExplorer } from "@/components/article-explorer";
import { HashRedirect } from "@/components/hash-redirect";
import { posts, vaultStats } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <HashRedirect />
      <ArticleExplorer posts={posts} stats={vaultStats} />
    </>
  );
}
