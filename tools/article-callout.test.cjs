const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("markdown callout parser supports Obsidian-style article blocks", () => {
  const callouts = fs.readFileSync(
    path.join(root, "lib", "markdown-callouts.ts"),
    "utf8",
  );

  assert.match(callouts, /parseMarkdownCalloutLabel/);
  assert.match(callouts, /CALLOUT_TYPE_LABELS/);
  assert.match(callouts, /note: "Note"/);
  assert.match(callouts, /tip: "Tip"/);
  assert.match(callouts, /warning: "Warning"/);
  assert.match(callouts, /danger: "Danger"/);
  assert.match(callouts, /error: "danger"/);
  assert.match(callouts, /caution: "warning"/);
  assert.match(callouts, /important: "note"/);
  assert.ok(callouts.includes("^\\s*\\[!([a-z]+)\\]"));
});

test("article page renders callouts through ReactMarkdown blockquote override", () => {
  const postPage = fs.readFileSync(
    path.join(root, "app", "posts", "[slug]", "page.tsx"),
    "utf8",
  );

  assert.match(postPage, /parseMarkdownCalloutLabel/);
  assert.match(postPage, /blockquote: \(\{ children \}\) => renderMarkdownBlockquote\(children\)/);
  assert.match(postPage, /note-callout note-callout-\$\{callout\.type\}/);
  assert.match(postPage, /note-callout-title/);
  assert.match(postPage, /stripCalloutMarker/);
});

test("content validation rejects unsupported callout labels without blocking normal notes", () => {
  const validateContent = fs.readFileSync(
    path.join(root, "tools", "validate-content.cjs"),
    "utf8",
  );

  assert.match(validateContent, /supportedCalloutTypes/);
  assert.match(validateContent, /unsupported callout type/);
  assert.ok(validateContent.includes("^>\\s*\\[!([a-z]+)]"));
});

test("note writing template documents compatible optional article conventions", () => {
  const template = fs.readFileSync(
    path.join(root, "docs", "note-writing-template.md"),
    "utf8",
  );

  assert.match(template, /compatible with ordinary Obsidian Markdown/);
  assert.match(template, /\[!note]/);
  assert.match(template, /\[!tip]/);
  assert.match(template, /\[!warning]/);
  assert.match(template, /fenced code blocks with a language name/);
});
