const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createVaultAssetPublisher } = require("./content-assets.cjs");

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-assets-"));
  const vaultPath = path.join(root, "vault");
  const outputDir = path.join(root, "public", "content-assets");
  fs.mkdirSync(path.join(vaultPath, "Linux"), { recursive: true });
  fs.writeFileSync(path.join(vaultPath, "root image.png"), "same-image");
  fs.writeFileSync(path.join(vaultPath, "Linux", "relative.jpg"), "relative-image");
  return { root, vaultPath, outputDir };
}

test("copies Obsidian and Markdown images and rewrites their links", () => {
  const fixture = createFixture();
  try {
    const publisher = createVaultAssetPublisher(fixture);
    const markdown = [
      "![[root image.png|380]]",
      "![Relative](relative.jpg)",
      "![Remote](https://example.com/image.png)",
    ].join("\n");

    const rewritten = publisher.rewrite(markdown, "Linux/note.md");
    const localUrls = [...rewritten.matchAll(/\/content-assets\/[^)\s?]+/g)].map(
      (match) => match[0],
    );

    assert.match(
      rewritten,
      /!\[root image]\(\/content-assets\/[a-f0-9]{12}-root-image\.png\?width=380\)/,
    );
    assert.match(
      rewritten,
      /!\[Relative]\(\/content-assets\/[a-f0-9]{12}-relative\.jpg\)/,
    );
    assert.match(rewritten, /!\[Remote]\(https:\/\/example\.com\/image\.png\)/);
    assert.equal(localUrls.length, 2);
    assert.equal(fs.readdirSync(fixture.outputDir).length, 2);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("deduplicates identical image bytes", () => {
  const fixture = createFixture();
  try {
    fs.writeFileSync(path.join(fixture.vaultPath, "duplicate.png"), "same-image");
    const publisher = createVaultAssetPublisher(fixture);
    const rewritten = publisher.rewrite(
      "![[root image.png]]\n![[duplicate.png]]",
      "Linux/note.md",
    );
    const urls = [...rewritten.matchAll(/\((\/content-assets\/[^)]+)\)/g)].map(
      (match) => match[1],
    );

    assert.equal(urls[0], urls[1]);
    assert.equal(fs.readdirSync(fixture.outputDir).length, 1);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("reports missing, ambiguous, and escaping image references safely", () => {
  const fixture = createFixture();
  try {
    fs.mkdirSync(path.join(fixture.vaultPath, "Other"));
    fs.writeFileSync(path.join(fixture.vaultPath, "Linux", "same.png"), "one");
    fs.writeFileSync(path.join(fixture.vaultPath, "Other", "same.png"), "two");
    const publisher = createVaultAssetPublisher(fixture);

    assert.throws(
      () => publisher.rewrite("![[missing.png]]", "Linux/note.md"),
      /Linux[\\/]note\.md:1 \[missing-image]/,
    );
    assert.throws(
      () => publisher.rewrite("![[same.png]]", "Topic/note.md"),
      /Topic[\\/]note\.md:1 \[ambiguous-image]/,
    );
    assert.throws(
      () => publisher.rewrite("![[..\\secret.png]]", "Linux/note.md"),
      /Linux[\\/]note\.md:1 \[unsafe-image-path]/,
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("published image sources receive the site base path and width metadata", async () => {
  const { resolvePublishedImageSource } = await import("../lib/content-image.ts");

  assert.deepEqual(
    resolvePublishedImageSource(
      "/content-assets/abc-image.png?width=380",
      "/study_website",
    ),
    { src: "/study_website/content-assets/abc-image.png", width: 380 },
  );
  assert.deepEqual(
    resolvePublishedImageSource("https://example.com/image.png", "/study_website"),
    { src: "https://example.com/image.png", width: undefined },
  );
});
