const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("animated title keeps the knowledge-base wording and receiving order", async () => {
  const {
    ANIMATED_TITLE_CYCLE_MS,
    ANIMATED_TITLE_LABEL,
    ANIMATED_TITLE_TOKENS,
  } = await import("../lib/animated-title.ts");

  assert.equal(ANIMATED_TITLE_LABEL, "pawn的知识库");
  assert.equal(ANIMATED_TITLE_CYCLE_MS, 5000);
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
  const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  const header = fs.readFileSync(
    path.join(root, "components", "site-header.tsx"),
    "utf8",
  );

  assert.match(layout, /default: "pawn的知识库"/);
  assert.match(layout, /template: "%s \| pawn的知识库"/);
  assert.match(layout, /个人技术学习笔记的知识库/);
  assert.match(header, />pawn的个人学习网站</);
  assert.doesNotMatch(header, />pawn的知识库</);
});
