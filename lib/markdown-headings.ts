export interface MarkdownHeading {
  id: string;
  level: 2 | 3 | 4;
  text: string;
}

function cleanHeadingText(value: string): string {
  return value
    .replace(/!\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+#+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createHeadingBaseId(value: string): string {
  const normalized = cleanHeadingText(value)
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "section";
}

export function createHeadingIdAllocator() {
  const counts = new Map<string, number>();

  return (value: string) => {
    const baseId = createHeadingBaseId(value);
    const count = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, count);
    return count === 1 ? baseId : `${baseId}-${count}`;
  };
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const allocateId = createHeadingIdAllocator();
  let fenceMarker: "`" | "~" | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0] as "`" | "~";
      fenceMarker = fenceMarker === marker ? null : fenceMarker ?? marker;
      continue;
    }
    if (fenceMarker) continue;

    const match = line.match(/^\s*(#{2,4})\s+(.+?)\s*$/);
    if (!match) continue;

    const text = cleanHeadingText(match[2]);
    if (!text) continue;
    headings.push({
      id: allocateId(text),
      level: match[1].length as 2 | 3 | 4,
      text,
    });
  }

  return headings;
}
