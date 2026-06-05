# 个人学习博客静态站

这是一个根据共享方案落地的纯静态个人学习博客模板，适合记录：

- 技术文章
- 学习路线
- 项目复盘
- 面试总结
- 部署笔记

## 本地预览

直接双击 `index.html` 即可打开。

也可以用本地静态服务器预览：

```powershell
python -m http.server 4173
```

然后访问：

```text
http://localhost:4173
```

## 发布到 GitHub Pages

1. 新建 GitHub 仓库。
2. 将当前目录提交并推送到默认分支。
3. 进入仓库 `Settings / Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择默认分支，目录选择 `/root`。
6. 等待 GitHub Pages 构建完成。

## 后续升级方向

- 把 `script.js` 里的文章数组改成从 JSON 读取。
- 将文章迁移为 Markdown 文件。
- 引入 VitePress，让 Markdown 自动生成页面。
- 增加 GitHub Actions 自动构建和发布。
