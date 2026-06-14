const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { KnowledgeModuleRegistry } = require("./knowledge-module-registry.cjs");

const INDEX_FILENAME = "\u7d22\u5f15.md";
const NEXT_LABEL = "\u4e0b\u4e00\u7bc7";

function post(source, title = path.basename(source, ".md")) {
  const categoryPath = source.split(/[\\/]/).slice(0, -1);
  return {
    slug: source.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    source,
    title,
    categoryPath,
    category: categoryPath.join("/"),
  };
}

test("orders each directory by index links, then natural filenames, then child directories", () => {
  const { orderPostsByVaultIndex } = require("./content-order.cjs");
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), "content-order-"));

  try {
    const root = path.join(vault, "Published");
    const firstModule = path.join(root, "01-Module");
    const secondModule = path.join(root, "02-Module");
    fs.mkdirSync(firstModule, { recursive: true });
    fs.mkdirSync(secondModule, { recursive: true });
    fs.writeFileSync(
      path.join(root, INDEX_FILENAME),
      [
        "1. [[RootB|Second lesson]]",
        "2. [[RootA]]",
        "3. [[RootB|Duplicate ignored]]",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(secondModule, INDEX_FILENAME),
      ["1. [[Zed|First]]", "2. [[Alpha]]"].join("\n"),
    );

    const posts = [
      post("Published\\02-Module\\Alpha.md"),
      post("Published\\Root10.md"),
      post("Published\\01-Module\\Lesson10.md"),
      post("Published\\RootA.md"),
      post("Published\\02-Module\\Zed.md"),
      post("Published\\Root2.md"),
      post("Published\\01-Module\\Lesson2.md"),
      post("Published\\RootB.md"),
      post("Published\\01-Module\\Lesson1.md"),
    ];

    assert.deepEqual(
      orderPostsByVaultIndex({
        vaultPath: vault,
        posts,
        publicRoots: ["Published"],
      }).map((item) => item.source),
      [
        "Published\\RootB.md",
        "Published\\RootA.md",
        "Published\\Root2.md",
        "Published\\Root10.md",
        "Published\\01-Module\\Lesson1.md",
        "Published\\01-Module\\Lesson2.md",
        "Published\\01-Module\\Lesson10.md",
        "Published\\02-Module\\Zed.md",
        "Published\\02-Module\\Alpha.md",
      ],
    );
  } finally {
    fs.rmSync(vault, { recursive: true, force: true });
  }
});

test("keeps public-root priority without mixing directory order", () => {
  const { orderPostsByVaultIndex } = require("./content-order.cjs");
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), "content-roots-"));

  try {
    fs.mkdirSync(path.join(vault, "First"), { recursive: true });
    fs.mkdirSync(path.join(vault, "Second"), { recursive: true });
    fs.writeFileSync(path.join(vault, "Second", INDEX_FILENAME), "1. [[B]]");

    const posts = [
      post("First\\Z.md"),
      post("Second\\A.md"),
      post("Second\\B.md"),
      post("First\\A.md"),
    ];

    assert.deepEqual(
      orderPostsByVaultIndex({
        vaultPath: vault,
        posts,
        publicRoots: ["Second", "First"],
      }).map((item) => item.source),
      ["Second\\B.md", "Second\\A.md", "First\\A.md", "First\\Z.md"],
    );
  } finally {
    fs.rmSync(vault, { recursive: true, force: true });
  }
});

test("reaches indexed notes through intermediate directories with no direct posts", () => {
  const { orderPostsByVaultIndex } = require("./content-order.cjs");
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), "content-nested-"));

  try {
    const lessonDirectory = path.join(vault, "Published", "Course", "01-Lessons");
    fs.mkdirSync(lessonDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(lessonDirectory, INDEX_FILENAME),
      ["1. [[Second]]", "2. [[First]]"].join("\n"),
    );

    const posts = [
      post("Published\\Course\\01-Lessons\\First.md"),
      post("Published\\Course\\01-Lessons\\Second.md"),
    ];

    assert.deepEqual(
      orderPostsByVaultIndex({
        vaultPath: vault,
        posts,
        publicRoots: ["Published"],
      }).map((item) => item.source),
      [
        "Published\\Course\\01-Lessons\\Second.md",
        "Published\\Course\\01-Lessons\\First.md",
      ],
    );
  } finally {
    fs.rmSync(vault, { recursive: true, force: true });
  }
});

test("category tree preserves post insertion order inside a directory", () => {
  const registry = new KnowledgeModuleRegistry({ preferredRoots: [] });
  const posts = [
    post("Published\\Topic\\Zed.md", "Zed"),
    post("Published\\Topic\\Alpha.md", "Alpha"),
  ];
  const tree = registry.buildCategoryTree(posts, [
    ["Published"],
    ["Published", "Topic"],
  ]);
  const published = tree.children.find((node) => node.label === "Published");
  const topic = published.children.find((node) => node.label === "Topic");

  assert.deepEqual(
    topic.children.map((node) => node.label),
    ["Zed", "Alpha"],
  );
});

test("next post follows array order only inside the exact category", () => {
  const { findNextPostInCategory } = require("../lib/post-navigation.js");
  const orderedPosts = [
    post("Published\\Topic\\First.md"),
    post("Published\\Topic\\Second.md"),
    post("Published\\Other\\Third.md"),
  ];

  assert.equal(
    findNextPostInCategory(orderedPosts, orderedPosts[0].slug)?.slug,
    orderedPosts[1].slug,
  );
  assert.equal(findNextPostInCategory(orderedPosts, orderedPosts[1].slug), undefined);
  assert.equal(findNextPostInCategory(orderedPosts, "missing"), undefined);
});

test("article page renders a linked next-post card after the reading layout", () => {
  const page = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "posts", "[slug]", "page.tsx"),
    "utf8",
  );

  assert.match(page, /getNextPostInCategory/);
  assert.ok(page.includes(NEXT_LABEL));
  assert.match(page, /href=\{`\/posts\/\$\{nextPost\.slug\}`\}/);
  assert.ok(
    page.indexOf("<ArticleReadingLayout") < page.indexOf(NEXT_LABEL),
    "next-post navigation should appear after the reading layout",
  );
});
