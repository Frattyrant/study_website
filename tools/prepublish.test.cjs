const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("p-check runs sync, validation, tests, lint, typecheck, and build in order", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"),
  );

  assert.equal(
    packageJson.scripts["p-check"],
    "npm run sync-content && npm run validate-content && npm run test:security && npm run lint && npm run typecheck && npm run build",
  );
  assert.equal(packageJson.scripts.prepublish, undefined);
  assert.equal(packageJson.scripts.numpulish, undefined);
});
