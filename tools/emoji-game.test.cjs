const assert = require("node:assert/strict");
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

test("emoji scale grows from its current visual size and caps at three times", async () => {
  const { getNextEmojiScale } = await import("../lib/emoji-game.ts");

  assert.equal(getNextEmojiScale(1), 1.1);
  assert.equal(getNextEmojiScale(1.7), 1.8);
  assert.equal(getNextEmojiScale(2.95), 3);
  assert.equal(getNextEmojiScale(3), 3);
  assert.equal(getNextEmojiScale(-1), 1.1);
  assert.equal(getNextEmojiScale(Number.NaN), 1.1);
});

test("emoji scale decays linearly to one over three seconds", async () => {
  const { getDecayedEmojiScale } = await import("../lib/emoji-game.ts");

  assert.equal(getDecayedEmojiScale(3, 0), 3);
  assert.equal(getDecayedEmojiScale(3, 1_500), 2);
  assert.equal(getDecayedEmojiScale(3, 3_000), 1);
  assert.equal(getDecayedEmojiScale(3, 4_000), 1);
  assert.equal(getDecayedEmojiScale(0, 1_500), 1);
});
