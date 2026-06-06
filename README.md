# pawn 的个人学习网站

基于 Next.js App Router、TypeScript 和 Tailwind CSS 的静态学习博客，部署在 GitHub Pages：
[https://frattyrant.github.io/study_website/](https://frattyrant.github.io/study_website/)

## 本地浏览

```powershell
npm run dev
http://localhost:3000
```

## Obsidian 同步

默认从本机 `C:\Users\LENOVO\Documents\Obsidian Vault` 同步，也可以传入其他 Vault 路径：

```powershell
npm run sync-content
node .\tools\sync-obsidian.cjs "D:\path\to\vault"
```

同步结果写入 `data/content.json`。

### 知识模块自动注册

- Vault 顶层知识目录会自动注册为公开知识域。
- `全部` 和知识域中的所有目录都会注册为可展开节点。
- Markdown 笔记显示在所属目录下，作为没有下拉按钮的叶子节点。
- `学习方向`、`问题记录` 和隐藏目录默认不公开；可在
  `tools/knowledge-module-registry.cjs` 的 `ignoredRoots` 中调整。
