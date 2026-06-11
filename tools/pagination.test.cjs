const assert = require("node:assert/strict");
const test = require("node:test");

test("pagination starts at twelve and grows in twelve-item batches", async () => {
  const { getNextVisibleCount, getVisibleItems } = await import(
    "../lib/pagination.ts"
  );
  const items = Array.from({ length: 34 }, (_, index) => index + 1);

  assert.deepEqual(getVisibleItems(items, 12), items.slice(0, 12));
  assert.equal(getNextVisibleCount(12, items.length), 24);
  assert.equal(getNextVisibleCount(24, items.length), 34);
  assert.equal(getNextVisibleCount(34, items.length), 34);
});

test("pagination safely clamps invalid counts and short result sets", async () => {
  const { getNextVisibleCount, getVisibleItems } = await import(
    "../lib/pagination.ts"
  );

  assert.deepEqual(getVisibleItems(["a", "b"], -1), []);
  assert.equal(getNextVisibleCount(-1, 5), 5);
  assert.equal(getNextVisibleCount(12, 0), 0);
});
