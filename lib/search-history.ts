export const SEARCH_HISTORY_STORAGE_KEY = "pawn-knowledge-search-history-v1";
export const SEARCH_HISTORY_CHANGE_EVENT = "pawn-knowledge-search-history-change";
export const MAX_SEARCH_HISTORY = 10;

function normalizeSearchHistoryEntry(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function identityKey(value: string): string {
  return value.toLocaleLowerCase("zh-CN");
}

export function sanitizeSearchHistory(entries: unknown[]): string[] {
  const seen = new Set<string>();
  const history: string[] = [];

  for (const entry of entries) {
    const normalized = normalizeSearchHistoryEntry(entry);
    if (!normalized) continue;

    const key = identityKey(normalized);
    if (seen.has(key)) continue;

    seen.add(key);
    history.push(normalized);
    if (history.length >= MAX_SEARCH_HISTORY) break;
  }

  return history;
}

export function addSearchHistoryEntry(history: string[], query: string): string[] {
  const normalized = normalizeSearchHistoryEntry(query);
  if (!normalized) return sanitizeSearchHistory(history);

  return sanitizeSearchHistory([
    normalized,
    ...history.filter((entry) => identityKey(entry) !== identityKey(normalized)),
  ]);
}

export function removeSearchHistoryEntry(history: string[], query: string): string[] {
  const key = identityKey(normalizeSearchHistoryEntry(query));
  return sanitizeSearchHistory(history.filter((entry) => identityKey(entry) !== key));
}

export function parseSearchHistory(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizeSearchHistory(parsed) : [];
  } catch {
    return [];
  }
}

export function serializeSearchHistory(history: string[]): string {
  return JSON.stringify(sanitizeSearchHistory(history));
}
