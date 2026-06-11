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

test("highlight segments only mark terms that actually occur", async () => {
  const { getHighlightSegments } = await import("../lib/search.ts");

  assert.deepEqual(getHighlightSegments("Docker IMAGE 镜像", ""), [
    { text: "Docker IMAGE 镜像", highlighted: false },
  ]);
  assert.deepEqual(getHighlightSegments("Docker IMAGE 镜像", "image镜像"), [
    { text: "Docker ", highlighted: false },
    { text: "IMAGE", highlighted: true },
    { text: " ", highlighted: false },
    { text: "镜像", highlighted: true },
  ]);
  assert.deepEqual(getHighlightSegments("aaaa", "aa aaaa"), [
    { text: "aaaa", highlighted: true },
  ]);
});

test("search preview uses a matching summary or a cleaned body excerpt", async () => {
  const { getSearchPreview, postMatchesSearch } = await import("../lib/search.ts");
  const post = {
    title: "Docker 入门",
    summary: "介绍容器的基本概念。",
    body: [
      "# Docker",
      "前置说明。",
      "使用 `docker image ls` 查看本地镜像，并通过 **镜像仓库** 下载内容。",
      "后续说明。",
    ].join("\n"),
  };

  assert.deepEqual(getSearchPreview(post, ""), {
    text: post.summary,
    source: "summary",
  });
  assert.deepEqual(getSearchPreview(post, "容器"), {
    text: post.summary,
    source: "summary",
  });

  const preview = getSearchPreview(post, "image镜像");
  assert.equal(preview.source, "body");
  assert.match(preview.text, /docker image ls/);
  assert.match(preview.text, /镜像仓库/);
  assert.equal(/[*#`]/.test(preview.text), false);

  const imageOnlyPost = {
    ...post,
    title: "VIM 编辑器",
    summary: "常用快捷键。",
    body: "系统截图：\n![Pasted image](/content-assets/example.png?width=380)",
    type: "Linux",
    source: "Linux/VIM.md",
    tags: [],
    categoryPath: ["Linux"],
  };
  assert.equal(postMatchesSearch(imageOnlyPost, "image"), false);
  assert.equal(getSearchPreview(imageOnlyPost, "image").source, "summary");
});
