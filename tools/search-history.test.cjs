const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("search history ignores blanks, deduplicates, and keeps the newest ten", async () => {
  const {
    MAX_SEARCH_HISTORY,
    addSearchHistoryEntry,
  } = await import("../lib/search-history.ts");

  let history = [];
  history = addSearchHistoryEntry(history, "   ");
  assert.deepEqual(history, []);

  for (let index = 1; index <= MAX_SEARCH_HISTORY + 2; index += 1) {
    history = addSearchHistoryEntry(history, `term-${index}`);
  }

  assert.equal(history.length, MAX_SEARCH_HISTORY);
  assert.equal(history[0], "term-12");
  assert.equal(history.at(-1), "term-3");

  history = addSearchHistoryEntry(history, "TERM-8");
  assert.equal(history[0], "TERM-8");
  assert.equal(history.filter((item) => item.toLowerCase() === "term-8").length, 1);
});

test("search history removes individual tags and safely parses storage", async () => {
  const {
    parseSearchHistory,
    removeSearchHistoryEntry,
    serializeSearchHistory,
  } = await import("../lib/search-history.ts");

  assert.deepEqual(parseSearchHistory("not json"), []);
  assert.deepEqual(parseSearchHistory(JSON.stringify(["docker", 42, "", " fastapi "])), [
    "docker",
    "fastapi",
  ]);
  assert.equal(serializeSearchHistory(["docker", "fastapi"]), "[\"docker\",\"fastapi\"]");
  assert.deepEqual(removeSearchHistoryEntry(["docker", "fastapi"], "Docker"), [
    "fastapi",
  ]);
});

test("article explorer renders recent search chips with removable tags", () => {
  const explorer = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "article-explorer.tsx"),
    "utf8",
  );

  assert.match(explorer, /SEARCH_HISTORY_STORAGE_KEY/);
  assert.ok(explorer.includes("\u6700\u8fd1\u641c\u7d22"));
  assert.match(explorer, /removeSearchHistoryEntry/);
  assert.match(explorer, /aria-label=\{`\u5220\u9664\u641c\u7d22\u8bb0\u5f55/);
});
