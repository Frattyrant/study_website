const assert = require("node:assert/strict");
const test = require("node:test");

test("pagination starts at six and grows in six-item batches", async () => {
  const { getNextVisibleCount, getVisibleItems } = await import(
    "../lib/pagination.ts"
  );
  const items = Array.from({ length: 34 }, (_, index) => index + 1);

  assert.deepEqual(getVisibleItems(items, 6), items.slice(0, 6));
  assert.equal(getNextVisibleCount(6, items.length), 12);
  assert.equal(getNextVisibleCount(30, items.length), 34);
  assert.equal(getNextVisibleCount(34, items.length), 34);
});

test("pagination safely clamps invalid counts and short result sets", async () => {
  const { getNextVisibleCount, getVisibleItems } = await import(
    "../lib/pagination.ts"
  );

  assert.deepEqual(getVisibleItems(["a", "b"], -1), []);
  assert.equal(getNextVisibleCount(-1, 5), 5);
  assert.equal(getNextVisibleCount(6, 0), 0);
});
