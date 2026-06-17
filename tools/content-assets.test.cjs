const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const crypto = require("node:crypto");
const sharp = require("sharp");

const {
  OPTIMIZE_IMAGE_MIN_BYTES,
  createVaultAssetPublisher,
} = require("./content-assets.cjs");

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-assets-"));
  const vaultPath = path.join(root, "vault");
  const outputDir = path.join(root, "public", "content-assets");
  fs.mkdirSync(path.join(vaultPath, "Linux"), { recursive: true });
  fs.writeFileSync(path.join(vaultPath, "root image.png"), "same-image");
  fs.writeFileSync(path.join(vaultPath, "Linux", "relative.jpg"), "relative-image");
  return { root, vaultPath, outputDir };
}

test("copies Obsidian and Markdown images and rewrites their links", async () => {
  const fixture = createFixture();
  try {
    const publisher = createVaultAssetPublisher(fixture);
    const markdown = [
      "![[root image.png|380]]",
      "![Relative](relative.jpg)",
      "![Remote](https://example.com/image.png)",
    ].join("\n");

    const rewritten = await publisher.rewrite(markdown, "Linux/note.md");
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

test("deduplicates identical image bytes", async () => {
  const fixture = createFixture();
  try {
    fs.writeFileSync(path.join(fixture.vaultPath, "duplicate.png"), "same-image");
    const publisher = createVaultAssetPublisher(fixture);
    const rewritten = await publisher.rewrite(
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

test("optimizes large publishable images to hashed webp assets", async () => {
  const fixture = createFixture();
  try {
    const imagePath = path.join(fixture.vaultPath, "Linux", "large.jpg");
    const width = 460;
    const height = 460;
    const pixels = Buffer.alloc(width * height * 3);
    crypto.randomFillSync(pixels);
    await sharp(pixels, { raw: { width, height, channels: 3 } })
      .jpeg({ quality: 100 })
      .toFile(imagePath);

    assert.ok(fs.statSync(imagePath).size > OPTIMIZE_IMAGE_MIN_BYTES);

    const publisher = createVaultAssetPublisher(fixture);
    const rewritten = await publisher.rewrite("![[large.jpg]]", "Linux/note.md");
    const match = rewritten.match(/\/content-assets\/([a-f0-9]{12}-large\.webp)/);

    assert.ok(match);
    assert.ok(fs.existsSync(path.join(fixture.outputDir, match[1])));
    assert.ok(
      fs.statSync(path.join(fixture.outputDir, match[1])).size <
        fs.statSync(imagePath).size,
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("reports missing, ambiguous, and escaping image references safely", async () => {
  const fixture = createFixture();
  try {
    fs.mkdirSync(path.join(fixture.vaultPath, "Other"));
    fs.writeFileSync(path.join(fixture.vaultPath, "Linux", "same.png"), "one");
    fs.writeFileSync(path.join(fixture.vaultPath, "Other", "same.png"), "two");
    const publisher = createVaultAssetPublisher(fixture);

    await assert.rejects(
      () => publisher.rewrite("![[missing.png]]", "Linux/note.md"),
      /Linux[\\/]note\.md:1 \[missing-image]/,
    );
    await assert.rejects(
      () => publisher.rewrite("![[same.png]]", "Topic/note.md"),
      /Topic[\\/]note\.md:1 \[ambiguous-image]/,
    );
    await assert.rejects(
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
