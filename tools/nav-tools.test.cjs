const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("reading density cycles through the three supported modes", async () => {
  const {
    READING_DENSITIES,
    READING_DENSITY_STORAGE_KEY,
    getNextReadingDensity,
    isReadingDensity,
  } = await import("../lib/nav-tools.ts");

  assert.deepEqual(READING_DENSITIES, ["comfortable", "standard", "compact"]);
  assert.equal(READING_DENSITY_STORAGE_KEY, "pawn-reading-density-v1");
  assert.equal(getNextReadingDensity("standard"), "compact");
  assert.equal(getNextReadingDensity("compact"), "comfortable");
  assert.equal(getNextReadingDensity("comfortable"), "standard");
  assert.equal(getNextReadingDensity("nope"), "compact");
  assert.equal(isReadingDensity("standard"), true);
  assert.equal(isReadingDensity("wide"), false);
});

test("random post selection stays public and avoids the current post when possible", async () => {
  const { getRandomPostSlug } = await import("../lib/nav-tools.ts");
  const posts = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

  assert.equal(getRandomPostSlug([], undefined, () => 0), undefined);
  assert.equal(getRandomPostSlug([{ slug: "only" }], "only", () => 0.9), "only");
  assert.equal(getRandomPostSlug(posts, undefined, () => 0), "a");
  assert.equal(getRandomPostSlug(posts, undefined, () => 0.999), "c");
  assert.equal(getRandomPostSlug(posts, "a", () => 0), "b");
  assert.equal(getRandomPostSlug(posts, "b", () => 0.999), "c");
  assert.equal(getRandomPostSlug(posts, "c", () => Number.NaN), "a");
});

test("site header mounts navigation tools beside existing controls", () => {
  const header = fs.readFileSync(
    path.join(root, "components", "site-header.tsx"),
    "utf8",
  );
  const navTools = fs.readFileSync(
    path.join(root, "components", "nav-tools.tsx"),
    "utf8",
  );
  const globals = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");

  assert.match(header, /NavTools/);
  assert.match(header, /navPosts/);
  assert.match(header, /site-header-card-layout/);
  assert.match(navTools, /READING_DENSITY_STORAGE_KEY/);
  assert.match(navTools, /dataset\.readingDensity/);
  assert.match(navTools, /useSyncExternalStore/);
  assert.match(navTools, /getRandomPostSlug/);
  assert.doesNotMatch(navTools, /learning-path/);
  assert.doesNotMatch(navTools, /aria-haspopup="dialog"/);
  assert.match(globals, /html\[data-reading-density="comfortable"\]/);
  assert.match(globals, /html\[data-reading-density="standard"\]/);
  assert.match(globals, /html\[data-reading-density="compact"\]/);
  assert.doesNotMatch(globals, /learning-path/);
});
