const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("animated title keeps the knowledge-base wording and receiving order", async () => {
  const {
    ANIMATED_TITLE_CYCLE_MS,
    ANIMATED_TITLE_DEFAULT_EFFECT,
    ANIMATED_TITLE_EFFECTS,
    ANIMATED_TITLE_LABEL,
    ANIMATED_TITLE_TOKENS,
    getRandomTitleEffect,
  } = await import("../lib/animated-title.ts");

  assert.equal(ANIMATED_TITLE_LABEL, "pawn的知识库");
  assert.equal(ANIMATED_TITLE_CYCLE_MS, 5000);
  assert.equal(ANIMATED_TITLE_DEFAULT_EFFECT, "pass");
  assert.deepEqual(ANIMATED_TITLE_EFFECTS, ["pass", "typewriter"]);
  assert.equal(getRandomTitleEffect(() => 0), "pass");
  assert.equal(getRandomTitleEffect(() => 0.34), "pass");
  assert.equal(getRandomTitleEffect(() => 0.5), "typewriter");
  assert.equal(getRandomTitleEffect(() => 0.67), "typewriter");
  assert.equal(getRandomTitleEffect(() => Number.NaN), "pass");
  assert.deepEqual(
    ANIMATED_TITLE_TOKENS.map((token) => token.text),
    ["p", "a", "w", "n", "的", "知", "识", "库"],
  );
  assert.deepEqual(
    ANIMATED_TITLE_TOKENS
      .filter((token) => token.role === "receiver")
      .map((token) => token.delayMs),
    [0, 90, 180],
  );
});

test("site metadata changes while the navigation brand remains unchanged", () => {
  const root = path.resolve(__dirname, "..");
  const title = fs.readFileSync(
    path.join(root, "components", "animated-title.tsx"),
    "utf8",
  );
  const globals = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
  const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  const header = fs.readFileSync(
    path.join(root, "components", "site-header.tsx"),
    "utf8",
  );
  const site = fs.readFileSync(path.join(root, "lib", "site.ts"), "utf8");

  assert.match(layout, /default: SITE_NAME/);
  assert.match(layout, /template: `%s \| \$\{SITE_NAME\}`/);
  assert.match(title, /animated-title-effect-\$\{titleEffect\}/);
  assert.match(title, /animated-title-token-index-\$\{index\}/);
  assert.match(title, /footballBall/);
  assert.match(title, /--title-ball-image/);
  assert.ok(
    fs.existsSync(path.join(root, "public", "images", "football-ball.webp")),
    "optimized football title asset should exist",
  );
  assert.doesNotMatch(globals, /title-ball-bicycle/);
  assert.doesNotMatch(globals, /title-ball-penalty/);
  assert.doesNotMatch(globals, /title-shine/);
  assert.match(globals, /background-image: var\(--title-ball-image\)/);
  assert.match(globals, /\.animated-title-effect-typewriter/);
  assert.match(globals, /title-typewriter-0/);
  assert.match(globals, /title-typewriter-7/);
  assert.doesNotMatch(globals, /title-typewriter-cursor/);
  assert.doesNotMatch(globals, /cursor-x/);
  assert.match(globals, /\.animated-title-effect-typewriter \.animated-title-ball\s*\{\s*display: none;/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(site, /SITE_NAME = "pawn的知识库"/);
  assert.match(site, /个人技术学习笔记的知识库/);
  assert.match(header, />pawn的个人学习网站</);
  assert.doesNotMatch(header, />pawn的知识库</);
});
