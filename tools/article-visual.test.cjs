const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("home article cards use visual bridge covers without reading minutes", () => {
  const card = fs.readFileSync(
    path.join(root, "components", "article-card.tsx"),
    "utf8",
  );

  assert.match(card, /article-card-bridge\.webp/);
  assert.match(card, /article-card-tower\.webp/);
  assert.match(card, /article-card-water\.webp/);
  assert.match(card, /ArticleCardVariant = "cover" \| "right" \| "left"/);
  assert.match(card, /article-card-cover/);
  assert.match(card, /article-card-right/);
  assert.match(card, /article-card-left/);
  assert.match(card, /article-card-gradient/);
  assert.match(card, /w-\[56%\]/);
  assert.doesNotMatch(card, /article-card-copy-side/);
  assert.match(card, /imageTextVariant/);
  assert.match(card, /--article-card-image/);
  assert.match(card, /--article-card-right-image/);
  assert.match(card, /--article-card-left-image/);
  assert.match(card, /line-clamp-3/);
  assert.doesNotMatch(card, /Clock3/);
  assert.doesNotMatch(card, /minutes/);
  assert.doesNotMatch(card, /\u5206\u949f\u9605\u8bfb/);
  assert.ok(
    fs.existsSync(path.join(root, "public", "images", "article-card-bridge.webp")),
    "optimized bridge card background should exist",
  );
  assert.ok(
    fs.existsSync(path.join(root, "public", "images", "article-card-tower.webp")),
    "optimized tower side background should exist",
  );
  assert.ok(
    fs.existsSync(path.join(root, "public", "images", "article-card-water.webp")),
    "optimized water side background should exist",
  );

  const explorer = fs.readFileSync(
    path.join(root, "components", "article-explorer.tsx"),
    "utf8",
  );
  assert.match(explorer, /grid-cols-1 gap-4/);
  assert.match(explorer, /CardLayoutToggle/);
  assert.match(explorer, /site-header-card-layout/);
  assert.match(explorer, /variant=\{cardVariant\}/);
  assert.match(explorer, /getNextCardVariant/);
  assert.match(explorer, /current === "cover"/);
  assert.match(explorer, /current === "right"/);
  assert.match(explorer, /切换电线杆背景/);
  assert.match(explorer, /切换溪流背景/);
  assert.match(explorer, /切换为桥水背景/);
  assert.doesNotMatch(explorer, /grid-cols-3/);

  const globals = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
  assert.match(globals, /@keyframes article-card-breathe/);
  assert.match(globals, /@keyframes article-card-side-breathe/);
  assert.match(globals, /\.article-card-cover \.article-card-gradient/);
  assert.match(globals, /\.article-card-right \.article-card-gradient/);
  assert.match(globals, /\.article-card-left \.article-card-gradient/);
  assert.doesNotMatch(globals, /\.article-card-copy-side/);
  assert.match(globals, /\.article-card-right::before/);
  assert.match(globals, /\.article-card-left::before/);
  assert.match(globals, /background-size: cover/);
  assert.match(globals, /filter: saturate\(1\.08\) contrast\(1\.02\) brightness\(1\.02\)/);
  assert.doesNotMatch(globals, /blur\(/);
  assert.match(globals, /background-position: 66% 50%/);
  assert.match(globals, /background-position: 34% 50%/);
  assert.match(globals, /scale\(1\.018\)/);
  assert.doesNotMatch(globals, /scale\(1\.12\)/);

  const header = fs.readFileSync(
    path.join(root, "components", "site-header.tsx"),
    "utf8",
  );
  assert.match(header, /site-header-card-layout/);
  assert.doesNotMatch(header, /id="site-header-card-layout" className="hidden/);
  assert.match(header, /id="site-header-card-layout" className="shrink-0"/);
  assert.match(globals, /@media \(max-width: 767px\)[\s\S]*\.article-card-cover::before[\s\S]*animation: none/);
  assert.match(globals, /@media \(max-width: 767px\)[\s\S]*\.article-card-right::before[\s\S]*\.article-card-left::before[\s\S]*animation: none/);
});

test("article detail header no longer renders reading minutes", () => {
  const postPage = fs.readFileSync(
    path.join(root, "app", "posts", "[slug]", "page.tsx"),
    "utf8",
  );

  assert.doesNotMatch(postPage, /Clock3/);
  assert.doesNotMatch(postPage, /post\.minutes/);
  assert.doesNotMatch(postPage, /\u5206\u949f\u9605\u8bfb/);
  assert.match(postPage, /FolderOpen/);
  assert.match(postPage, /getNextPostInCategory/);
  assert.match(postPage, /getPostsInSameCategory/);
  assert.match(postPage, /article-shell/);
  assert.match(postPage, /ReactMarkdown/);
  assert.match(postPage, /ArticleReadingLayout/);
  assert.match(postPage, /loading="lazy"/);
  assert.match(postPage, /decoding="async"/);

  const globals = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
  assert.match(globals, /\.article-shell/);
  assert.match(globals, /\.article-hero/);
  assert.match(globals, /\.article-dek/);
  assert.match(globals, /\.note-body\s*\{/);
  assert.match(globals, /line-height: 1\.9/);
  assert.match(globals, /\.note-body blockquote/);
  assert.match(globals, /\.note-body table/);
  assert.match(globals, /\.note-body pre/);
  assert.match(globals, /\.note-body img/);

  const readingLayout = fs.readFileSync(
    path.join(root, "components", "article-reading-layout.tsx"),
    "utf8",
  );
  assert.match(readingLayout, /window\.scrollTo/);
  assert.doesNotMatch(readingLayout, /scrollIntoView/);
});
