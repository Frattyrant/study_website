export const POST_PAGE_SIZE = 12;

export function getVisibleItems<T>(items: T[], visibleCount: number): T[] {
  return items.slice(0, Math.max(0, visibleCount));
}

export function getNextVisibleCount(
  visibleCount: number,
  totalCount: number,
  pageSize = POST_PAGE_SIZE,
): number {
  const safeTotal = Math.max(0, totalCount);
  const safeVisible = Math.max(0, visibleCount);
  return Math.min(safeTotal, safeVisible + Math.max(1, pageSize));
}
