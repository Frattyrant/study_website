export interface CategoryNode {
  key: string;
  label: string;
  count: number;
  kind: "root" | "module" | "note";
  postSlug?: string;
  children: CategoryNode[];
}

export interface Post {
  slug: string;
  title: string;
  type: string;
  date: string;
  minutes: number;
  category: string;
  categoryPath: string[];
  tags: string[];
  summary: string;
  source?: string;
  body: string;
}

export interface VaultStats {
  totalNotes: number;
  publishableNotes: number;
  focusCount: number;
  latestDate?: string;
  topCounts: Record<string, number>;
  categoryTree: CategoryNode;
}

export interface ContentData {
  vaultStats: VaultStats;
  posts: Post[];
}
