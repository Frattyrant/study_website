const fs = require("node:fs");
const path = require("node:path");

const defaultVault = "C:\\Users\\LENOVO\\Documents\\Obsidian Vault";
const vaultPath = process.argv[2] || defaultVault;
const outputPath = path.resolve(__dirname, "..", "content.js");

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

function inferTags(relativePath, title, content) {
  const source = `${relativePath} ${title} ${content}`;
  const checks = [
    ["FastAPI", /FASTAPI|FastAPI|APIRouter|response_model|router/i],
    ["SQLAlchemy", /SQLAlchemy|SessionLocal|create_engine|declarative_base|SQLite/i],
    ["CRUD", /CRUD|GET|POST|PUT|PATCH|DELETE|tasks/i],
    ["Docker", /Docker|docker|container|image|daemon|hello-world/i],
    ["WSL", /WSL|Ubuntu|apt|Clash|proxy|代理/i],
    ["Linux", /Linux|shell|bash|命令|权限|进程/i],
    ["数据库", /数据库|SQLite|ORM|模型|表/i],
    ["项目结构", /项目结构|routers|main.py|模块/i],
    ["AI", /(?:^|[^A-Za-z])AI(?:[^A-Za-z]|$)|workflow|视频|ERP|subscribe/i],
    ["GitHub Pages", /GitHub Pages|VitePress|静态|域名/i],
  ];
  const tags = checks.filter(([, regex]) => regex.test(source)).map(([tag]) => tag);
  return Array.from(new Set(tags)).slice(0, 4);
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
  return path.basename(filePath, ".md") !== "索引";
}

if (!fs.existsSync(vaultPath)) {
  console.error(`Obsidian Vault not found: ${vaultPath}`);
  process.exit(1);
}

const allFiles = walk(vaultPath);
const files = allFiles.filter(shouldPublish);
const posts = files
  .map((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(vaultPath, filePath).replaceAll(path.sep, "\\");
    const title = titleFrom(content, filePath);
    return {
      slug: slugFrom(relativePath),
      title,
      type: inferType(relativePath, title),
      date: toDate(filePath),
      minutes: minutesFor(content),
      tags: inferTags(relativePath, title, content),
      summary: summaryFrom(content, title),
      source: relativePath,
      body: detailMarkdown(content, title),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.source.localeCompare(b.source, "zh-CN"));

const topCounts = allFiles.reduce((acc, filePath) => {
  const relativePath = path.relative(vaultPath, filePath);
  const top = relativePath.split(path.sep)[0];
  acc[top] = (acc[top] || 0) + 1;
  return acc;
}, {});

const latestDate = allFiles
  .map((filePath) => toDate(filePath))
  .sort()
  .at(-1);

const data = `window.vaultStats = ${JSON.stringify(
  {
    vaultPath,
    totalNotes: allFiles.length,
    publishableNotes: posts.length,
    focusCount: Object.keys(topCounts).length,
    latestDate,
    topCounts,
  },
  null,
  2,
)};

window.learningPosts = ${JSON.stringify(posts, null, 2)};
`;

fs.writeFileSync(outputPath, data, "utf8");
console.log(`Synced ${posts.length} publishable notes from ${allFiles.length} markdown files.`);
