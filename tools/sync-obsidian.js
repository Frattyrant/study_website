const fs = require("node:fs");
const path = require("node:path");

const defaultVault = "C:\\Users\\LENOVO\\Documents\\Obsidian Vault";
const vaultPath = process.argv[2] || defaultVault;
const outputPath = path.resolve(__dirname, "..", "content.js");
const allowedTopLevel = new Set(["Linux入门", "PYTHON后端"]);
const categoryOrder = new Map([
  ["Linux入门", 10],
  ["Linux入门/问题记录", 11],
  ["Linux入门/常用命令", 12],
  ["PYTHON后端", 20],
  ["PYTHON后端/DB", 21],
  ["PYTHON后端/Docker", 22],
  ["PYTHON后端/FASTAPI", 23],
  ["PYTHON后端/FASTAPI/请求响应模型", 24],
  ["PYTHON后端/FASTAPI/数据库接入", 25],
  ["PYTHON后端/FASTAPI/CRUD接口", 26],
  ["PYTHON后端/FASTAPI/routers", 27],
]);

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

function detailMarkdown(content, title) {
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

function categoryPathFrom(relativePath) {
  const parts = relativePath.split("\\");
  const fileName = parts.at(-1) || "";
  if (parts[0] === "Linux入门") {
    if (parts.length === 2) return ["Linux入门", fileName.replace(/\.md$/i, "")];
    if (parts[1]) return ["Linux入门", parts[1]];
    return ["Linux入门"];
  }
  if (parts[0] === "PYTHON后端") {
    if (parts[1] === "FASTAPI") {
      if (parts[2] && !fileName.endsWith("LOGIC.md")) return ["PYTHON后端", "FASTAPI", parts[2]];
      return ["PYTHON后端", "FASTAPI"];
    }
    if (parts[1]) return ["PYTHON后端", parts[1]];
    return ["PYTHON后端"];
  }
  return [parts[0]].filter(Boolean);
}

function categoryKeyFrom(categoryPath) {
  return categoryPath.join("/");
}

function buildCategoryTree(posts) {
  const root = { key: "全部", label: "全部", count: posts.length, children: [] };
  const nodeMap = new Map([["全部", root]]);

  for (const post of posts) {
    let parent = root;
    for (let index = 0; index < post.categoryPath.length; index += 1) {
      const pathParts = post.categoryPath.slice(0, index + 1);
      const key = categoryKeyFrom(pathParts);
      if (!nodeMap.has(key)) {
        const node = { key, label: pathParts.at(-1), count: 0, children: [] };
        nodeMap.set(key, node);
        parent.children.push(node);
      }
      const node = nodeMap.get(key);
      node.count += 1;
      parent = node;
    }
  }

  function sortChildren(node) {
    node.children.sort((a, b) => {
      const orderA = categoryOrder.get(a.key) ?? 999;
      const orderB = categoryOrder.get(b.key) ?? 999;
      return orderA - orderB || a.label.localeCompare(b.label, "zh-CN");
    });
    node.children.forEach(sortChildren);
  }

  sortChildren(root);
  return root;
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

function shouldPublish(filePath) {
  const relativePath = path.relative(vaultPath, filePath);
  const topLevel = relativePath.split(path.sep)[0];
  return allowedTopLevel.has(topLevel) && path.basename(filePath, ".md") !== "索引";
}

if (!fs.existsSync(vaultPath)) {
  console.error(`Obsidian Vault not found: ${vaultPath}`);
  process.exit(1);
}

const allFiles = walk(vaultPath);
const scopedFiles = allFiles.filter((filePath) => {
  const relativePath = path.relative(vaultPath, filePath);
  return allowedTopLevel.has(relativePath.split(path.sep)[0]);
});
const files = scopedFiles.filter(shouldPublish);
const posts = files
  .map((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(vaultPath, filePath).replaceAll(path.sep, "\\");
    const title = titleFrom(content, filePath);
    const categoryPath = categoryPathFrom(relativePath);
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
      body: redactForPublicSite(detailMarkdown(content, title)),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.source.localeCompare(b.source, "zh-CN"));

const topCounts = scopedFiles.reduce((acc, filePath) => {
  const relativePath = path.relative(vaultPath, filePath);
  const top = relativePath.split(path.sep)[0];
  acc[top] = (acc[top] || 0) + 1;
  return acc;
}, {});

const latestDate = allFiles
  .filter((filePath) => scopedFiles.includes(filePath))
  .map((filePath) => toDate(filePath))
  .sort()
  .at(-1);

const data = `window.vaultStats = ${JSON.stringify(
  {
    vaultPath,
    totalNotes: scopedFiles.length,
    publishableNotes: posts.length,
    focusCount: Object.keys(topCounts).length,
    latestDate,
    topCounts,
    categoryTree: buildCategoryTree(posts),
  },
  null,
  2,
)};

window.learningPosts = ${JSON.stringify(posts, null, 2)};
`;

fs.writeFileSync(outputPath, data, "utf8");
console.log(`Synced ${posts.length} publishable notes from ${allFiles.length} markdown files.`);
