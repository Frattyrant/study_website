const assert = require("node:assert/strict");
const test = require("node:test");

const {
  findCurrentProjectDevProcessIds,
  isCurrentProjectDevCommand,
} = require("./prepare-build.cjs");

const projectDir = "C:\\Users\\LENOVO\\Desktop\\BVC_tools\\personal_web";
const otherProject = "C:\\Users\\LENOVO\\Desktop\\other_site";

test("prepare-build matches only current project dev server commands", () => {
  assert.equal(
    isCurrentProjectDevCommand(
      `"C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" run dev --prefix ${projectDir}`,
      projectDir,
    ),
    true,
  );
  assert.equal(
    isCurrentProjectDevCommand(`node ${projectDir}\\tools\\dev-server.cjs`, projectDir),
    true,
  );
  assert.equal(
    isCurrentProjectDevCommand(
      `"C:\\Program Files\\nodejs\\node.exe" ${projectDir}\\node_modules\\next\\dist\\server\\lib\\start-server.js`,
      projectDir,
    ),
    true,
  );
  assert.equal(
    isCurrentProjectDevCommand(
      `"node" ${projectDir}\\.next\\dev\\build\\56416d4ae4ce586f.js 54085`,
      projectDir,
    ),
    true,
  );
});

test("prepare-build does not match unrelated node or other project processes", () => {
  assert.equal(
    isCurrentProjectDevCommand(
      `${projectDir}\\node_modules\\.bin\\tsx tools\\some-script.ts`,
      projectDir,
    ),
    false,
  );
  assert.equal(
    isCurrentProjectDevCommand(
      `C:\\Users\\LENOVO\\AppData\\Local\\OpenAI\\Codex\\runtimes\\cua_node\\bin\\node.exe --working-dir ${projectDir}`,
      projectDir,
    ),
    false,
  );
  assert.equal(
    isCurrentProjectDevCommand(`node ${otherProject}\\tools\\dev-server.cjs`, projectDir),
    false,
  );
});

test("prepare-build returns only current project dev process ids", () => {
  assert.deepEqual(
    findCurrentProjectDevProcessIds(
      [
        { ProcessId: 10, CommandLine: `node ${projectDir}\\tools\\dev-server.cjs` },
        { ProcessId: 11, CommandLine: `node ${otherProject}\\tools\\dev-server.cjs` },
        { ProcessId: 12, CommandLine: `node ${projectDir}\\scripts\\worker.js` },
        {
          ProcessId: 13,
          CommandLine: `"C:\\Program Files\\nodejs\\node.exe" ${projectDir}\\node_modules\\next\\dist\\server\\lib\\start-server.js`,
        },
      ],
      projectDir,
    ),
    [10, 13],
  );
  assert.deepEqual(findCurrentProjectDevProcessIds([], projectDir), []);
});
