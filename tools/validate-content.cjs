const fs = require("node:fs");
const path = require("node:path");
const { findSecretFindings } = require("./content-security.cjs");

const contentPath = path.resolve(__dirname, "..", "data", "content.json");
const securityPath = path.resolve(__dirname, "..", "data", "content-security.json");
const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const security = JSON.parse(fs.readFileSync(securityPath, "utf8"));
const requiredPostFields = ["slug", "title", "type", "date", "minutes", "category", "categoryPath", "tags", "summary", "body"];

if (!data.vaultStats || !Array.isArray(data.posts)) {
  throw new Error("content.json must contain vaultStats and posts.");
}
if ("vaultPath" in data.vaultStats) {
  throw new Error("content.json must not expose the local vaultPath.");
}
if (!Array.isArray(security.publicRoots) || !security.allowedLineHashes) {
  throw new Error("content-security.json must contain publicRoots and allowedLineHashes.");
}

const slugs = new Set();
const publicRoots = new Set(security.publicRoots);
const absoluteUserPath = /(?:[A-Z]:\\Users\\[^\\\s"]+|\/home\/[^/\s"]+)/i;
for (const [index, post] of data.posts.entries()) {
  for (const field of requiredPostFields) {
    if (!(field in post)) throw new Error(`Post ${index} is missing required field: ${field}`);
  }
  if (!post.slug || slugs.has(post.slug)) {
    throw new Error(`Post ${index} has an empty or duplicate slug: ${post.slug}`);
  }
  slugs.add(post.slug);
  if (!post.categoryPath.length || !publicRoots.has(post.categoryPath[0])) {
    throw new Error(`Post ${index} is outside the registered public roots.`);
  }
  const publicText = [
    post.title,
    post.summary,
    post.source || "",
    post.body,
    ...post.categoryPath,
    ...post.tags,
  ].join("\n");
  if (absoluteUserPath.test(publicText)) {
    throw new Error(`Post ${index} contains an absolute user path.`);
  }
  const allowedHashes = new Set(security.allowedLineHashes[post.slug] || []);
  const findings = [
    ...findSecretFindings(post.summary),
    ...findSecretFindings(post.body, { allowedLineHashes: allowedHashes }),
  ];
  if (findings.length > 0) {
    const rules = [...new Set(findings.map((finding) => finding.rule))].join(", ");
    throw new Error(`Post ${index} contains blocked sensitive content: ${rules}.`);
  }
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
