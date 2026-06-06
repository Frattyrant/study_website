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

const noteSlugs = new Set();
function validateCategoryNode(node, isRoot = false) {
  if (!["root", "module", "note"].includes(node.kind)) {
    throw new Error(`Category "${node.label}" has an invalid kind: ${node.kind}`);
  }
  if (isRoot && node.kind !== "root") {
    throw new Error("The category tree root must use kind=root.");
  }
  if (!isRoot && node.kind === "root") {
    throw new Error(`Only the category tree root may use kind=root: ${node.label}`);
  }
  if (node.kind === "note") {
    if (!node.postSlug || !slugs.has(node.postSlug)) {
      throw new Error(`Note category "${node.label}" has an invalid postSlug.`);
    }
    if (node.children.length > 0) {
      throw new Error(`Note category "${node.label}" cannot have children.`);
    }
    noteSlugs.add(node.postSlug);
  }
  for (const child of node.children) validateCategoryNode(child);
}

validateCategoryNode(data.vaultStats.categoryTree, true);
if (noteSlugs.size !== data.posts.length) {
  throw new Error("Every post must appear exactly once as a note leaf in the category tree.");
}

if (data.vaultStats.publishableNotes !== data.posts.length) {
  throw new Error("publishableNotes does not match the generated post count.");
}
console.log(`Validated ${data.posts.length} posts.`);
