const { execFileSync } = require("node:child_process");
const path = require("node:path");

function normalizePath(value) {
  return path.resolve(value).replace(/\\/g, "/").toLowerCase();
}

function normalizeCommandLine(value) {
  return String(value || "").replace(/\\/g, "/").toLowerCase();
}

function isCurrentProjectDevCommand(commandLine, projectDir = process.cwd()) {
  const command = normalizeCommandLine(commandLine);
  const project = normalizePath(projectDir);
  if (!command.includes(project)) return false;

  return [
    /npm(?:\.cmd|-cli\.js)?["']?\s+run\s+dev/,
    /tools\/dev-server\.cjs/,
    /next\/dist\/server\/lib\/start-server\.js/,
    /\.next\/dev\/build\/[^"'\s]+\.js/,
  ].some((pattern) => pattern.test(command));
}

function listWindowsProcesses() {
  const script = [
    "Get-CimInstance Win32_Process",
    "Select-Object ProcessId,CommandLine",
    "ConvertTo-Json -Compress -Depth 2",
  ].join(" | ");
  const output = execFileSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { encoding: "utf8", windowsHide: true },
  ).trim();
  if (!output) return [];
  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function stopWindowsProcesses(processIds) {
  if (processIds.length === 0) return;
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `Stop-Process -Id ${processIds.join(",")} -Force -ErrorAction SilentlyContinue`,
    ],
    { stdio: "inherit", windowsHide: true },
  );
}

function findCurrentProjectDevProcessIds(processes, projectDir = process.cwd()) {
  const currentPid = process.pid;
  return processes
    .filter((item) => item.ProcessId !== currentPid)
    .filter((item) => isCurrentProjectDevCommand(item.CommandLine, projectDir))
    .map((item) => Number(item.ProcessId))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function prepareBuild(projectDir = process.cwd()) {
  if (process.platform !== "win32") {
    console.log("prepare-build: non-Windows platform, no dev server cleanup needed.");
    return;
  }

  let processes = [];
  try {
    processes = listWindowsProcesses();
  } catch (error) {
    console.warn(
      `prepare-build: unable to inspect Windows processes (${error.code || error.message}); continuing without cleanup.`,
    );
    return;
  }

  const processIds = findCurrentProjectDevProcessIds(
    processes,
    projectDir,
  );
  if (processIds.length === 0) {
    console.log("prepare-build: no current project dev server found.");
    return;
  }

  console.log(
    `prepare-build: stopping current project dev server process(es): ${processIds.join(", ")}`,
  );
  stopWindowsProcesses(processIds);
}

if (require.main === module) {
  prepareBuild();
}

module.exports = {
  findCurrentProjectDevProcessIds,
  isCurrentProjectDevCommand,
  normalizeCommandLine,
  normalizePath,
  prepareBuild,
};
