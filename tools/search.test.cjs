const assert = require("node:assert/strict");
const test = require("node:test");

const content = require("../data/content.json");

function search(query) {
  return async () => {
    const { postMatchesSearch } = await import("../lib/search.ts");
    return content.posts.filter((post) => postMatchesSearch(post, query));
  };
}

test("search query is split across Chinese and English runs", async () => {
  const { getSearchTerms } = await import("../lib/search.ts");

  assert.deepEqual(getSearchTerms("镜像image"), ["镜像", "image"]);
  assert.deepEqual(getSearchTerms("Docker 镜像 image"), ["docker", "镜像", "image"]);
});

test("search matches title, summary, and body text", async () => {
  const titleMatches = await search("hello world")();
  const summaryMatches = await search("WSL2")();
  const chineseBodyMatches = await search("镜像")();
  const englishBodyMatches = await search("image")();

  assert.ok(titleMatches.some((post) => post.title.includes("hello world")));
  assert.ok(summaryMatches.some((post) => post.summary.includes("WSL2")));
  assert.ok(chineseBodyMatches.some((post) => post.body.includes("镜像")));
  assert.ok(englishBodyMatches.some((post) => post.body.toLocaleLowerCase("zh-CN").includes("image")));
});

test("search requires every mixed-language term to match", async () => {
  const mixedMatches = await search("镜像image")();
  const impossibleMatches = await search("镜像 definitelynotfound")();
  const missingChineseMatches = await search("不存在的全文搜索词")();

  assert.ok(mixedMatches.length > 0);
  assert.ok(mixedMatches.every((post) => post.body.includes("镜像")));
  assert.ok(mixedMatches.every((post) => post.body.toLocaleLowerCase("zh-CN").includes("image")));
  assert.equal(impossibleMatches.length, 0);
  assert.equal(missingChineseMatches.length, 0);
});
