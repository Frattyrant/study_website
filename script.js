const posts = [
  {
    title: "从零建立 GitHub Pages 静态博客",
    type: "部署",
    date: "2026-06-02",
    minutes: 8,
    tags: ["GitHub", "静态网站", "发布"],
    summary: "记录仓库创建、Pages 设置、根目录发布和自定义域名的最小路径。",
  },
  {
    title: "Markdown 写作规范：让笔记可以长期维护",
    type: "笔记",
    date: "2026-06-03",
    minutes: 6,
    tags: ["Markdown", "写作", "知识库"],
    summary: "统一标题层级、代码块、链接和复盘模板，避免笔记越写越散。",
  },
  {
    title: "Git 学习路线：从提交到协作",
    type: "路线",
    date: "2026-06-05",
    minutes: 10,
    tags: ["Git", "GitHub", "版本管理"],
    summary: "用个人博客项目练习 add、commit、branch、merge 和 pull request。",
  },
  {
    title: "Linux 常用命令学习记录",
    type: "笔记",
    date: "2026-06-08",
    minutes: 12,
    tags: ["Linux", "终端", "命令行"],
    summary: "把文件、进程、权限、网络排查命令整理成可复查的速查表。",
  },
  {
    title: "个人作品集项目复盘模板",
    type: "复盘",
    date: "2026-06-10",
    minutes: 7,
    tags: ["项目", "复盘", "作品集"],
    summary: "按背景、方案、难点、结果、下一步五个部分复盘每个练手项目。",
  },
  {
    title: "前端基础补全：HTML、CSS、响应式布局",
    type: "路线",
    date: "2026-06-12",
    minutes: 9,
    tags: ["前端", "CSS", "响应式"],
    summary: "围绕真实页面搭建学习盒模型、网格布局、媒体查询和可访问性。",
  },
];

const tagList = ["全部", ...Array.from(new Set(posts.flatMap((post) => post.tags)))];
let activeTag = "全部";
let query = "";

const grid = document.querySelector("#articleGrid");
const filterRow = document.querySelector("#filterRow");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const articleCount = document.querySelector("#articleCount");
const themeToggle = document.querySelector("#themeToggle");

function renderFilters() {
  filterRow.innerHTML = tagList
    .map(
      (tag) => `
        <button class="${tag === activeTag ? "is-active" : ""}" type="button" data-tag="${tag}">
          ${tag}
        </button>
      `,
    )
    .join("");
}

function getFilteredPosts() {
  const normalizedQuery = query.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesTag = activeTag === "全部" || post.tags.includes(activeTag);
    const searchable = `${post.title} ${post.type} ${post.summary} ${post.tags.join(" ")}`.toLowerCase();
    return matchesTag && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

function renderPosts() {
  const filtered = getFilteredPosts();
  articleCount.textContent = posts.length;
  emptyState.hidden = filtered.length > 0;

  grid.innerHTML = filtered
    .map(
      (post) => `
        <article class="article-card">
          <div class="article-topline">
            <span class="article-type">${post.type}</span>
            <time class="article-date" datetime="${post.date}">${post.date}</time>
          </div>
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
          <div class="article-meta">
            <i data-lucide="clock-3"></i>
            <span>${post.minutes} 分钟阅读</span>
          </div>
          <div class="article-tags">
            ${post.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setTheme(nextTheme) {
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("learning-blog-theme", nextTheme);
  themeToggle.innerHTML = `<i data-lucide="${nextTheme === "dark" ? "moon" : "sun"}"></i>`;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

filterRow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tag]");
  if (!button) return;
  activeTag = button.dataset.tag;
  renderFilters();
  renderPosts();
});

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderPosts();
});

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
});

const savedTheme = localStorage.getItem("learning-blog-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

setTheme(savedTheme || (prefersDark ? "dark" : "light"));
renderFilters();
renderPosts();
