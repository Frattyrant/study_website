const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  findSecretFindings,
  hashPublicSafeLine,
  preparePublicContent,
  sanitizeAutomaticRisks,
} = require("./content-security.cjs");
const { KnowledgeModuleRegistry } = require("./knowledge-module-registry.cjs");

test("only top-level directories with a .public marker are registered", () => {
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), "public-roots-"));
  try {
    fs.mkdirSync(path.join(vault, "Published"));
    fs.writeFileSync(path.join(vault, "Published", ".public"), "");
    fs.mkdirSync(path.join(vault, "Private"));
    fs.mkdirSync(path.join(vault, ".hidden"));
    fs.writeFileSync(path.join(vault, ".hidden", ".public"), "");

    const registry = new KnowledgeModuleRegistry({ preferredRoots: [] });
    assert.deepEqual(registry.discoverPublicRoots(vault), ["Published"]);
  } finally {
    fs.rmSync(vault, { recursive: true, force: true });
  }
});

test("automatic sanitization removes user paths and private proxy addresses", () => {
  const input =
    "C:\\Users\\alice\\Documents\\note.md /home/bob/project http://192.168.1.8:7897";
  const output = sanitizeAutomaticRisks(input);

  assert.equal(output.includes("alice"), false);
  assert.equal(output.includes("/home/bob"), false);
  assert.equal(output.includes("192.168.1.8"), false);
  assert.match(output, /<user-home>/);
  assert.match(output, /<local-proxy>/);
});

test("high-confidence tokens are blocked without appearing in the error", () => {
  const secret = "github_pat_1234567890abcdefghijklmnop";

  assert.throws(
    () => preparePublicContent(`token=${secret}`, "topic/note.md"),
    (error) => {
      assert.match(error.message, /topic\/note\.md:1 \[github-token]/);
      assert.equal(error.message.includes(secret), false);
      return true;
    },
  );
});

test("placeholder credentials are allowed", () => {
  const input = [
    "Authorization: Bearer <YOUR_TOKEN>",
    "postgresql://user:<YOUR_PASSWORD>@localhost/db",
    "password=<redacted>",
    "password=${DATABASE_PASSWORD}",
  ].join("\n");

  assert.equal(findSecretFindings(input).length, 0);
});

test("public-safe permits one explicit line and strips the marker", () => {
  const line =
    "Authorization: Bearer real-looking-training-token-123456789 <!-- public-safe -->";
  const result = preparePublicContent(line, "topic/note.md");
  const cleaned = line.replace("<!-- public-safe -->", "").trimEnd();

  assert.equal(result.content, cleaned);
  assert.deepEqual(result.allowedLineHashes, [hashPublicSafeLine(cleaned)]);
  assert.equal(result.content.includes("public-safe"), false);
  assert.equal(
    findSecretFindings(result.content, {
      allowedLineHashes: new Set(result.allowedLineHashes),
    }).length,
    0,
  );
});
