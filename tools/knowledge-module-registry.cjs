const fs = require("node:fs");
const path = require("node:path");

class KnowledgeModuleRegistry {
  constructor({
    ignoredRoots = [".obsidian", "学习方向", "问题记录"],
    preferredRoots = ["Linux入门", "PYTHON后端"],
  } = {}) {
    this.ignoredRoots = new Set(ignoredRoots);
    this.preferredRoots = new Map(preferredRoots.map((name, index) => [name, index]));
  }

  discoverPublicRoots(vaultPath) {
    return fs
      .readdirSync(vaultPath, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          !this.ignoredRoots.has(entry.name),
      )
      .map((entry) => entry.name)
      .sort((a, b) => this.compareLabels(a, b));
  }

  discoverModulePaths(vaultPath, publicRoots) {
    const modulePaths = [];

    const visit = (absolutePath, pathParts) => {
      modulePaths.push(pathParts);
      const childDirectories = fs
        .readdirSync(absolutePath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .sort((a, b) =>
          a.name.localeCompare(b.name, "zh-CN", {
            numeric: true,
            sensitivity: "base",
          }),
        );

      for (const directory of childDirectories) {
        visit(path.join(absolutePath, directory.name), [...pathParts, directory.name]);
      }
    };

    for (const root of publicRoots) {
      visit(path.join(vaultPath, root), [root]);
    }

    return modulePaths;
  }

  categoryPathFor(relativePath, title) {
    const parts = relativePath.split(/[\\/]/).filter(Boolean);
    const directories = parts.slice(0, -1);

    // Direct notes are selectable leaves; notes inside modules only affect counts.
    if (directories.length === 1) return [...directories, title];
    return directories;
  }

  buildCategoryTree(posts, modulePaths = []) {
    const root = { key: "全部", label: "全部", count: posts.length, children: [] };
    const nodeMap = new Map([[root.key, root]]);

    const ensurePath = (pathParts, incrementCount) => {
      let parent = root;
      for (let index = 0; index < pathParts.length; index += 1) {
        const currentParts = pathParts.slice(0, index + 1);
        const key = currentParts.join("/");
        if (!nodeMap.has(key)) {
          const node = { key, label: currentParts.at(-1), count: 0, children: [] };
          nodeMap.set(key, node);
          parent.children.push(node);
        }
        const node = nodeMap.get(key);
        if (incrementCount) node.count += 1;
        parent = node;
      }
    };

    for (const modulePath of modulePaths) {
      ensurePath(modulePath, false);
    }

    for (const post of posts) {
      ensurePath(post.categoryPath, true);
    }

    const sortChildren = (node, level = 0) => {
      node.children.sort((a, b) =>
        level === 0
          ? this.compareLabels(a.label, b.label)
          : a.label.localeCompare(b.label, "zh-CN", {
              numeric: true,
              sensitivity: "base",
            }),
      );
      node.children.forEach((child) => sortChildren(child, level + 1));
    };

    sortChildren(root);
    return root;
  }

  compareLabels(a, b) {
    const orderA = this.preferredRoots.get(a) ?? Number.MAX_SAFE_INTEGER;
    const orderB = this.preferredRoots.get(b) ?? Number.MAX_SAFE_INTEGER;
    return (
      orderA - orderB ||
      a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" })
    );
  }
}

module.exports = { KnowledgeModuleRegistry };
