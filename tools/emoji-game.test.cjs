const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("emoji pool is unique and covers the agreed face categories", async () => {
  const { EMOJIS } = await import("../lib/emoji-game.ts");

  assert.equal(new Set(EMOJIS).size, EMOJIS.length);
  for (const representative of ["😀", "🫪", "😈", "💀", "💩", "🤖", "😺", "🙈"]) {
    assert.ok(EMOJIS.includes(representative));
  }
});

test("random emoji selection stays in range and avoids the current emoji", async () => {
  const { EMOJIS, getRandomEmojiIndex } = await import("../lib/emoji-game.ts");

  for (let currentIndex = 0; currentIndex < EMOJIS.length; currentIndex += 1) {
    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999999, 1]) {
      const nextIndex = getRandomEmojiIndex(currentIndex, () => randomValue);
      assert.ok(nextIndex >= 0 && nextIndex < EMOJIS.length);
      assert.notEqual(nextIndex, currentIndex);
    }
  }
});

test("emoji scale stays at its original visual size", async () => {
  const { getNextEmojiScale } = await import("../lib/emoji-game.ts");

  assert.equal(getNextEmojiScale(1), 1);
  assert.equal(getNextEmojiScale(1.7), 1);
  assert.equal(getNextEmojiScale(3), 1);
  assert.equal(getNextEmojiScale(-1), 1);
  assert.equal(getNextEmojiScale(Number.NaN), 1);
});

test("emoji scale reset remains at one", async () => {
  const { getDecayedEmojiScale } = await import("../lib/emoji-game.ts");

  assert.equal(getDecayedEmojiScale(3, 0), 1);
  assert.equal(getDecayedEmojiScale(3, 1_500), 1);
  assert.equal(getDecayedEmojiScale(3, 3_000), 1);
  assert.equal(getDecayedEmojiScale(3, 4_000), 1);
  assert.equal(getDecayedEmojiScale(0, 1_500), 1);
});

test("emoji pile uses the button-sized visual and collision radius", () => {
  const root = path.resolve(__dirname, "..");
  const pile = fs.readFileSync(path.join(root, "components", "emoji-pile.tsx"), "utf8");
  const globals = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");

  assert.match(pile, /export const EMOJI_SIZE = 24/);
  assert.match(pile, /const EMOJI_RADIUS = EMOJI_SIZE \/ 2/);
  assert.match(pile, /Bodies\.circle\(x, y, EMOJI_RADIUS/);
  assert.match(globals, /\.emoji-pile-item[\s\S]*width: 24px/);
  assert.match(globals, /\.emoji-pile-item[\s\S]*height: 24px/);
  assert.match(globals, /\.emoji-pile-item[\s\S]*font-size: 24px/);
});
