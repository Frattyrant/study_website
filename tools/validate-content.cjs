const fs = require("node:fs");
const path = require("node:path");

const contentPath = path.resolve(__dirname, "..", "data", "content.json");
const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const requiredPostFields = ["slug", "title", "type", "date", "minutes", "category", "categoryPath", "tags", "summary", "body"];

if (!data.vaultStats || !Array.isArray(data.posts)) {
  throw new Error("content.json must contain vaultStats and posts.");
}

const slugs = new Set();
for (const [index, post] of data.posts.entries()) {
  for (const field of requiredPostFields) {
    if (!(field in post)) throw new Error(`Post ${index} is missing required field: ${field}`);
  }
  if (!post.slug || slugs.has(post.slug)) {
    throw new Error(`Post ${index} has an empty or duplicate slug: ${post.slug}`);
  }
  slugs.add(post.slug);
}

if (data.vaultStats.publishableNotes !== data.posts.length) {
  throw new Error("publishableNotes does not match the generated post count.");
}
console.log(`Validated ${data.posts.length} posts.`);
