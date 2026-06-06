# pawn 的个人学习网站

基于 Next.js App Router、TypeScript 和 Tailwind CSS 的静态学习博客，部署在 GitHub Pages：
[https://frattyrant.github.io/study_website/](https://frattyrant.github.io/study_website/)

## 本地开发

```powershell
npm install
npm run dev
```



```powershell
npm run validate-content
npm run typecheck
npm run lint
npm run build
```

## Obsidian 同步

默认从本机 `C:\Users\LENOVO\Documents\Obsidian Vault` 同步，也可以传入其他 Vault 路径：

```powershell
npm run sync-content
node .\tools\sync-obsidian.cjs "D:\path\to\vault"
```

同步结果写入 `data/content.json`
