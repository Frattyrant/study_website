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
  const header = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "site-header.tsx"),
    "utf8",
  );

  assert.match(explorer, /SEARCH_HISTORY_STORAGE_KEY/);
  assert.match(header, /id="site-header-search"/);
  assert.match(explorer, /createPortal/);
  assert.match(explorer, /site-header-search/);
  assert.ok(explorer.includes("\u641c\u7d22\u5386\u53f2"));
  assert.match(explorer, /removeSearchHistoryEntry/);
  assert.match(explorer, /aria-label=\{`\u5220\u9664\u641c\u7d22\u8bb0\u5f55/);
});

test("mobile category drawer uses compact index width", () => {
  const explorer = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "article-explorer.tsx"),
    "utf8",
  );

  assert.match(explorer, /id="mobile-category-drawer"/);
  const drawerIdIndex = explorer.indexOf('id="mobile-category-drawer"');
  const drawerClassIndex = explorer.lastIndexOf("className=", drawerIdIndex);
  const drawerOpeningTag = explorer.slice(drawerClassIndex, drawerIdIndex);
  const drawerTreeIndex = explorer.indexOf("<CategoryTree", drawerIdIndex);
  const drawerTreeCall = explorer.slice(drawerTreeIndex, explorer.indexOf("/>", drawerTreeIndex));
  const categoryTree = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "category-tree.tsx"),
    "utf8",
  );

  assert.match(drawerOpeningTag, /w-\[min\(195px,100%\)\]/);
  assert.doesNotMatch(drawerOpeningTag, /w-full/);
  assert.match(drawerTreeCall, /compact/);
  assert.match(categoryTree, /text-\[12px\]/);
  assert.doesNotMatch(explorer, /w-\[calc\(100%-24px\)\]/);
  assert.doesNotMatch(explorer, /w-\[min\(340px,calc\(100%-48px\)\)\]/);
});
