export function resolvePublishedImageSource(src: string, basePath = "") {
  if (!src.startsWith("/content-assets/")) {
    return { src, width: undefined };
  }

  const parsed = new URL(src, "https://content.local");
  const widthValue = Number(parsed.searchParams.get("width"));
  const width =
    Number.isInteger(widthValue) && widthValue > 0 ? Math.min(widthValue, 2400) : undefined;

  return {
    src: `${basePath}${parsed.pathname}`,
    width,
  };
}
