const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("site constants expose GitHub Pages SEO defaults", async () => {
  const site = await import("../lib/site.ts");

  assert.equal(site.SITE_NAME, "pawn的知识库");
  assert.equal(site.SITE_BASE_URL, "https://frattyrant.github.io/study_website");
  assert.equal(
    site.getSiteUrl("/posts/Linux 入门"),
    "https://frattyrant.github.io/study_website/posts/Linux%20%E5%85%A5%E9%97%A8/",
  );
  assert.equal(
    site.getSiteUrl("/images/pawn-site-background.webp"),
    "https://frattyrant.github.io/study_website/images/pawn-site-background.webp",
  );
});

test("SEO routes expose sitemap and robots entries", () => {
  const sitemap = fs.readFileSync(path.join(root, "app", "sitemap.ts"), "utf8");
  const robots = fs.readFileSync(path.join(root, "app", "robots.ts"), "utf8");

  assert.match(sitemap, /posts\.map/);
  assert.match(sitemap, /getSiteUrl\("\/"\)/);
  assert.match(sitemap, /lastModified/);
  assert.match(robots, /allow: "\/"/);
  assert.match(robots, /getSiteUrl\("\/sitemap\.xml"\)/);
});

test("layout and article pages include canonical metadata and JSON-LD", () => {
  const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  const postPage = fs.readFileSync(
    path.join(root, "app", "posts", "[slug]", "page.tsx"),
    "utf8",
  );

  assert.match(layout, /metadataBase/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(postPage, /alternates: \{ canonical: url \}/);
  assert.match(postPage, /"@type": "TechArticle"/);
  assert.match(postPage, /application\/ld\+json/);
});
