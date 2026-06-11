const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function walkImages(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".obsidian") return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkImages(fullPath);
    return entry.isFile() && SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
      ? [fullPath]
      : [];
  });
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function safeAssetName(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const stem = path
    .basename(filePath, path.extname(filePath))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${stem || "image"}${extension}`;
}

function lineForOffset(markdown, offset) {
  return markdown.slice(0, offset).split("\n").length;
}

function createVaultAssetPublisher({
  vaultPath,
  outputDir,
  assetUrlPrefix = "/content-assets",
}) {
  const resolvedVault = path.resolve(vaultPath);
  const basenameIndex = new Map();
  const publishedByHash = new Map();

  for (const imagePath of walkImages(resolvedVault)) {
    const key = path.basename(imagePath).toLocaleLowerCase("en-US");
    const matches = basenameIndex.get(key) || [];
    matches.push(imagePath);
    basenameIndex.set(key, matches);
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  function fail(notePath, line, rule) {
    throw new Error(`${notePath}:${line} [${rule}]`);
  }

  function resolveImage(target, notePath, line) {
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(target);
    } catch {
      fail(notePath, line, "unsafe-image-path");
    }

    const normalizedTarget = decodedTarget.replaceAll("\\", "/").replace(/^\.\//, "");
    const segments = normalizedTarget.split("/");
    if (
      !normalizedTarget ||
      path.isAbsolute(normalizedTarget) ||
      path.win32.isAbsolute(normalizedTarget) ||
      segments.includes("..")
    ) {
      fail(notePath, line, "unsafe-image-path");
    }

    const extension = path.extname(normalizedTarget).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      fail(notePath, line, "unsupported-image");
    }

    const noteDirectory = path.dirname(path.resolve(resolvedVault, notePath));
    const exactCandidates = [
      path.resolve(noteDirectory, normalizedTarget),
      path.resolve(resolvedVault, normalizedTarget),
    ].filter(
      (candidate, index, candidates) =>
        candidates.indexOf(candidate) === index &&
        isInside(resolvedVault, candidate) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile(),
    );

    if (exactCandidates.length > 0) return exactCandidates[0];

    const basenameMatches =
      basenameIndex.get(path.basename(normalizedTarget).toLocaleLowerCase("en-US")) || [];
    if (basenameMatches.length === 1) return basenameMatches[0];
    if (basenameMatches.length > 1) fail(notePath, line, "ambiguous-image");
    fail(notePath, line, "missing-image");
  }

  function publishImage(target, notePath, line, width) {
    const sourcePath = resolveImage(target, notePath, line);
    const bytes = fs.readFileSync(sourcePath);
    const hash = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    let publishedName = publishedByHash.get(hash);

    if (!publishedName) {
      publishedName = `${hash}-${safeAssetName(sourcePath)}`;
      fs.copyFileSync(sourcePath, path.join(outputDir, publishedName));
      publishedByHash.set(hash, publishedName);
    }

    const widthQuery = width ? `?width=${width}` : "";
    return `${assetUrlPrefix}/${publishedName}${widthQuery}`;
  }

  function rewrite(markdown, notePath) {
    const markdownImagesRewritten = markdown.replace(
      /!\[([^\]\n]*)]\(\s*(<[^>\n]+>|[^)\s\n]+)(?:\s+["'][^"'\n]*["'])?\s*\)/g,
      (match, alt, rawTarget, offset) => {
        const target = rawTarget.startsWith("<") ? rawTarget.slice(1, -1) : rawTarget;
        if (/^https?:\/\//i.test(target)) return match;
        const line = lineForOffset(markdown, offset);
        const url = publishImage(target, notePath, line);
        return `![${alt}](${url})`;
      },
    );

    return markdownImagesRewritten.replace(
      /!\[\[([^\]\n]+)]]/g,
      (match, reference, offset) => {
        const [target, ...metadataParts] = reference.split("|");
        const metadata = metadataParts.join("|").trim();
        const dimensions = metadata.match(/^(\d{1,4})(?:x\d{1,4})?$/);
        const width = dimensions ? Math.min(Math.max(Number(dimensions[1]), 1), 2400) : undefined;
        const alt = dimensions || !metadata ? path.basename(target, path.extname(target)) : metadata;
        const line = lineForOffset(markdownImagesRewritten, offset);
        const url = publishImage(target.trim(), notePath, line, width);
        return `![${alt}](${url})`;
      },
    );
  }

  return { rewrite };
}

module.exports = {
  SUPPORTED_IMAGE_EXTENSIONS,
  createVaultAssetPublisher,
};
