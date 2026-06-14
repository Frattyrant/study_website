const fs = require("node:fs");
const path = require("node:path");

const INDEX_FILENAME = "\u7d22\u5f15.md";

function normalizeRelativePath(value) {
  return value
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/");
}

function withoutMarkdownExtension(value) {
  return value.replace(/\.md$/i, "");
}

function compareNaturally(left, right) {
  return left.localeCompare(right, "zh-CN", {
    numeric: true,
    sensitivity: "base",
  });
}

function extractIndexTargets(markdown) {
  const targets = [];
  const pattern = /\[\[([^\]]+)]]/g;
  let match;

  while ((match = pattern.exec(markdown)) !== null) {
    const target = match[1].split("|", 1)[0].split("#", 1)[0].trim();
    if (target) targets.push(normalizeRelativePath(withoutMarkdownExtension(target)));
  }

  return targets;
}

function orderDirectoryPosts(vaultPath, directory, directPosts) {
  const naturallySorted = [...directPosts].sort((left, right) =>
    compareNaturally(
      path.posix.basename(normalizeRelativePath(left.source)),
      path.posix.basename(normalizeRelativePath(right.source)),
    ),
  );
  const indexPath = path.join(
    vaultPath,
    ...directory.split("/").filter(Boolean),
    INDEX_FILENAME,
  );

  if (!fs.existsSync(indexPath)) return naturallySorted;

  const targets = extractIndexTargets(fs.readFileSync(indexPath, "utf8"));
  const remaining = new Set(naturallySorted);
  const ordered = [];

  for (const target of targets) {
    const targetPath = normalizeRelativePath(
      target.includes("/") ? target : `${directory}/${target}`,
    ).toLocaleLowerCase("zh-CN");
    const targetName = path.posix
      .basename(target)
      .toLocaleLowerCase("zh-CN");
    const match = naturallySorted.find((post) => {
      if (!remaining.has(post)) return false;
      const source = withoutMarkdownExtension(normalizeRelativePath(post.source));
      return (
        source.toLocaleLowerCase("zh-CN") === targetPath ||
        path.posix.basename(source).toLocaleLowerCase("zh-CN") === targetName
      );
    });

    if (!match) continue;
    ordered.push(match);
    remaining.delete(match);
  }

  return [...ordered, ...naturallySorted.filter((post) => remaining.has(post))];
}

function orderPostsByVaultIndex({ vaultPath, posts, publicRoots }) {
  const postsByDirectory = new Map();
  const directories = new Set();

  for (const post of posts) {
    const source = normalizeRelativePath(post.source);
    const directory = path.posix.dirname(source);
    let currentDirectory = directory;
    while (currentDirectory && currentDirectory !== ".") {
      directories.add(currentDirectory);
      const parentDirectory = path.posix.dirname(currentDirectory);
      if (parentDirectory === currentDirectory) break;
      currentDirectory = parentDirectory;
    }
    const siblings = postsByDirectory.get(directory) ?? [];
    siblings.push(post);
    postsByDirectory.set(directory, siblings);
  }

  const ordered = [];
  const visited = new Set();

  const visitDirectory = (directory) => {
    const directPosts = postsByDirectory.get(directory) ?? [];
    for (const post of orderDirectoryPosts(vaultPath, directory, directPosts)) {
      if (visited.has(post)) continue;
      ordered.push(post);
      visited.add(post);
    }

    const prefix = `${directory}/`;
    const childDirectories = [...directories]
      .filter((candidate) => {
        if (!candidate.startsWith(prefix)) return false;
        return !candidate.slice(prefix.length).includes("/");
      })
      .sort((left, right) =>
        compareNaturally(path.posix.basename(left), path.posix.basename(right)),
      );

    for (const childDirectory of childDirectories) {
      visitDirectory(childDirectory);
    }
  };

  for (const root of publicRoots) {
    visitDirectory(normalizeRelativePath(root));
  }

  const unvisited = posts
    .filter((post) => !visited.has(post))
    .sort((left, right) =>
      compareNaturally(
        normalizeRelativePath(left.source),
        normalizeRelativePath(right.source),
      ),
    );

  return [...ordered, ...unvisited];
}

module.exports = {
  extractIndexTargets,
  orderPostsByVaultIndex,
};
