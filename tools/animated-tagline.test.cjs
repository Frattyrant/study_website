const assert = require("node:assert/strict");
const test = require("node:test");

test("tagline keeps IT together and preserves the readable sentence", async () => {
  const {
    ANIMATED_TAGLINE_LABEL,
    ANIMATED_TAGLINE_TOKENS,
  } = await import("../lib/animated-tagline.ts");

  assert.equal(ANIMATED_TAGLINE_LABEL, "记录学习 IT 的过程");
  assert.deepEqual(
    ANIMATED_TAGLINE_TOKENS.map((token) => token.text),
    ["记", "录", "学", "习", " ", "IT", " ", "的", "过", "程"],
  );
  assert.equal(
    ANIMATED_TAGLINE_TOKENS.filter((token) => token.animated).length,
    8,
  );
  assert.equal(
    ANIMATED_TAGLINE_TOKENS.find((token) => token.text === "IT")?.accent,
    true,
  );
});

test("animated tokens use staggered delays within the entrance window", async () => {
  const {
    ANIMATED_TAGLINE_CYCLE_MS,
    ANIMATED_TAGLINE_TOKENS,
  } = await import("../lib/animated-tagline.ts");
  const animated = ANIMATED_TAGLINE_TOKENS.filter((token) => token.animated);

  assert.equal(ANIMATED_TAGLINE_CYCLE_MS, 5200);
  assert.deepEqual(
    animated.map((token) => token.delayMs),
    [0, 90, 180, 270, 360, 450, 540, 630],
  );
  assert.ok(animated.every((token) => token.delayMs < 1300));
});
