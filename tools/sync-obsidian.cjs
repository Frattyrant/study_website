const fs = require("node:fs");
const path = require("node:path");
const { KnowledgeModuleRegistry } = require("./knowledge-module-registry.cjs");

const defaultVault = "C:\\Users\\LENOVO\\Documents\\Obsidian Vault";
const vaultPath = process.argv[2] || defaultVault;
const outputPath = path.resolve(__dirname, "..", "data", "content.json");
const moduleRegistry = new KnowledgeModuleRegistry();

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".obsidian") return [];
      return walk(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function cleanMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[\[([^|\]]+\|)?([^\]]+)]]/g, "$2")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|=-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFrom(value) {
  return value
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[\\/\s_]+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function detailMarkdown(content) {
  return content
    .replace(/^#\s+.+$/m, "")
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function redactForPublicSite(value) {
  return value
    .replace(/https?:\/\/(?:127\.0\.0\.1|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):(?:7897|9097)\b/gi, "http://<local-proxy>")
    .replace(/\b(?:127\.0\.0\.1|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):(?:7897|9097)\b/gi, "<local-address>")
    .replace(/\b((?:HTTP|HTTPS|NO)_PROXY=)([^\s"`]+)/gi, "$1<redacted>")
    .replace(/\b((?:http|https)_proxy=)([^\s"`]+)/gi, "$1<redacted>")
    .replace(/\bpassword\s+123456\b/gi, "password <redacted>");
}

function firstParagraphAfter(content, heading) {
  const pattern = new RegExp(`##\\s*${heading}([\\s\\S]*?)(?=\\n##\\s|$)`);
  const match = content.match(pattern);
  if (!match) return "";
  return (
    match[1]
      .split(/\r?\n/)
      .map((line) => cleanMarkdown(line))
      .find((line) => line.length > 16) || ""
  );
}

function inferType(relativePath, title) {
  if (relativePath.includes("问题记录") || /报错|卡住|timeout|代理/.test(title)) return "问题记录";
  if (relativePath.includes("FASTAPI")) return "FastAPI";
  if (relativePath.includes("Docker")) return "Docker";
  if (relativePath.includes("Linux")) return "Linux";
  if (relativePath.includes("学习方向")) return "方向";
  if (relativePath.includes("静态web")) return "发布";
  if (relativePath.includes("DB")) return "数据库";
  return "笔记";
}

function categoryKeyFrom(categoryPath) {
  return categoryPath.join("/");
}

function titleFrom(content, filePath) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return cleanMarkdown(heading[1]);
  return path.basename(filePath, ".md").replace(/-/g, " ");
}

function summaryFrom(content, title) {
  const sections = ["问题是什么", "学习步骤", "怎么解决", "解决了什么问题", "下一步"];
  for (const section of sections) {
    const found = firstParagraphAfter(content, section);
    if (found) return found.slice(0, 108);
  }
  const fallback = content
    .split(/\r?\n/)
    .map((line) => cleanMarkdown(line))
    .find((line) => line && line !== title && line.length > 10);
  return (fallback || "这篇笔记来自 Obsidian，等待继续补充正文和复盘。").slice(0, 108);
}

function toDate(filePath) {
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

function minutesFor(content) {
  return Math.max(3, Math.min(14, Math.ceil(cleanMarkdown(content).length / 360)));
}

function shouldPublish(filePath, publicRoots) {
  const relativePath = path.relative(vaultPath, filePath);
  const topLevel = relativePath.split(path.sep)[0];
  return publicRoots.has(topLevel) && path.basename(filePath, ".md") !== "索引";
}

if (!fs.existsSync(vaultPath)) {
  console.error(`Obsidian Vault not found: ${vaultPath}`);
  process.exit(1);
}

const allFiles = walk(vaultPath);
const publicRoots = new Set(moduleRegistry.discoverPublicRoots(vaultPath));
const modulePaths = moduleRegistry.discoverModulePaths(vaultPath, publicRoots);
const scopedFiles = allFiles.filter((filePath) => {
  const relativePath = path.relative(vaultPath, filePath);
  return publicRoots.has(relativePath.split(path.sep)[0]);
});
const files = scopedFiles.filter((filePath) => shouldPublish(filePath, publicRoots));
const posts = files
  .map((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(vaultPath, filePath).replaceAll(path.sep, "\\");
    const title = titleFrom(content, filePath);
    const categoryPath = moduleRegistry.categoryPathFor(relativePath, title);
    return {
      slug: slugFrom(relativePath),
      title,
      type: inferType(relativePath, title),
      date: toDate(filePath),
      minutes: minutesFor(content),
      category: categoryKeyFrom(categoryPath),
      categoryPath,
      tags: categoryPath.slice(1),
      summary: redactForPublicSite(summaryFrom(content, title)),
      source: relativePath,
      body: redactForPublicSite(detailMarkdown(content)),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.source.localeCompare(b.source, "zh-CN"));

const topCounts = scopedFiles.reduce((acc, filePath) => {
  const relativePath = path.relative(vaultPath, filePath);
  const top = relativePath.split(path.sep)[0];
  acc[top] = (acc[top] || 0) + 1;
  return acc;
}, Object.fromEntries([...publicRoots].map((root) => [root, 0])));

const latestDate = allFiles
  .filter((filePath) => scopedFiles.includes(filePath))
  .map((filePath) => toDate(filePath))
  .sort()
  .at(-1);

const data = {
  vaultStats: {
    vaultPath,
    totalNotes: scopedFiles.length,
    publishableNotes: posts.length,
    focusCount: publicRoots.size,
    latestDate,
    topCounts,
    categoryTree: moduleRegistry.buildCategoryTree(posts, modulePaths),
  },
  posts,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Synced ${posts.length} publishable notes from ${allFiles.length} markdown files.`);
