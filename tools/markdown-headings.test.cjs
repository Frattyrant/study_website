const assert = require("node:assert/strict");
const test = require("node:test");

test("extracts h2-h4 headings with stable unique ids", async () => {
  const { extractMarkdownHeadings } = await import("../lib/markdown-headings.ts");
  const markdown = [
    "# Page title",
    "## Docker 镜像",
    "### Build `image`",
    "#### **注意事项**",
    "##### Ignored",
    "## Docker 镜像",
  ].join("\n");

  assert.deepEqual(extractMarkdownHeadings(markdown), [
    { id: "docker-镜像", level: 2, text: "Docker 镜像" },
    { id: "build-image", level: 3, text: "Build image" },
    { id: "注意事项", level: 4, text: "注意事项" },
    { id: "docker-镜像-2", level: 2, text: "Docker 镜像" },
  ]);
});

test("ignores headings inside fenced code blocks", async () => {
  const { extractMarkdownHeadings } = await import("../lib/markdown-headings.ts");
  const markdown = [
    "## Visible",
    "```markdown",
    "## Hidden",
    "```",
    "~~~",
    "### Also hidden",
    "~~~",
    "### Visible again",
  ].join("\n");

  assert.deepEqual(extractMarkdownHeadings(markdown), [
    { id: "visible", level: 2, text: "Visible" },
    { id: "visible-again", level: 3, text: "Visible again" },
  ]);
});

test("heading allocator matches extracted duplicate ids", async () => {
  const { createHeadingIdAllocator } = await import("../lib/markdown-headings.ts");
  const allocateId = createHeadingIdAllocator();

  assert.equal(allocateId("安装 & 配置"), "安装-配置");
  assert.equal(allocateId("安装 & 配置"), "安装-配置-2");
  assert.equal(allocateId("!!!"), "section");
  assert.equal(allocateId("!!!"), "section-2");
});
