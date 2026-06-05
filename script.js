const posts = window.learningPosts || [];
const vaultStats = window.vaultStats || {};

const categoryTree = vaultStats.categoryTree || { key: "全部", label: "全部", count: posts.length, children: [] };
let activeCategory = "全部";
let query = "";
let selectedPost = null;

const grid = document.querySelector("#articleGrid");
const filterRow = document.querySelector("#filterRow");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const noteDetail = document.querySelector("#noteDetail");
const backToArticles = document.querySelector("#backToArticles");
const detailType = document.querySelector("#detailType");
const detailDate = document.querySelector("#detailDate");
const detailTitle = document.querySelector("#detailTitle");
const detailMinutes = document.querySelector("#detailMinutes");
const detailSource = document.querySelector("#detailSource");
const detailTags = document.querySelector("#detailTags");
const detailBody = document.querySelector("#detailBody");
const articleCount = document.querySelector("#articleCount");
const vaultNoteCount = document.querySelector("#vaultNoteCount");
const focusCount = document.querySelector("#focusCount");
const lastUpdated = document.querySelector("#lastUpdated");
const themeToggle = document.querySelector("#themeToggle");

function renderFilters() {
  function renderNode(node, level = 0) {
    const children = node.children || [];
    const button = `
      <button
        class="${node.key === activeCategory ? "is-active" : ""}"
        type="button"
        data-category="${node.key}"
        style="--level:${level}"
      >
        <span>${node.label}</span>
        <small>${node.count}</small>
      </button>
    `;
    return `${button}${children.map((child) => renderNode(child, level + 1)).join("")}`;
  }

  filterRow.innerHTML = renderNode(categoryTree);
}

function getFilteredPosts() {
  const normalizedQuery = query.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesCategory = activeCategory === "全部" || post.category === activeCategory || post.category?.startsWith(`${activeCategory}/`);
    const searchable =
      `${post.title} ${post.type} ${post.summary} ${post.source || ""} ${(post.categoryPath || []).join(" ")}`.toLowerCase();
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\[\[([^|\]]+\|)?([^\]]+)]]/g, "$2")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1");
}

function markdownToHtml(markdown) {
  const lines = (markdown || "这篇笔记还没有可展示的正文。").split("\n");
  const html = [];
  let inCode = false;
  let codeLines = [];
  let listOpen = false;

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^#{2,4}\s+/.test(trimmed)) {
      closeList();
      const level = Math.min(4, trimmed.match(/^#+/)[0].length + 1);
      html.push(`<h${level}>${inlineMarkdown(trimmed.replace(/^#+\s+/, ""))}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  return html.join("");
}

function renderPosts() {
  const filtered = getFilteredPosts();
  articleCount.textContent = posts.length;
  vaultNoteCount.textContent = vaultStats.totalNotes || posts.length;
  focusCount.textContent = vaultStats.focusCount || 0;
  lastUpdated.textContent = vaultStats.latestDate ? vaultStats.latestDate.slice(5) : "--";
  emptyState.hidden = filtered.length > 0;

  grid.innerHTML = filtered
    .map(
      (post) => `
        <button class="article-card" type="button" data-slug="${post.slug}" aria-label="阅读 ${escapeHtml(post.title)}">
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
          ${
            post.source
              ? `<div class="article-source">
                  <i data-lucide="folder-open"></i>
                  <span>${post.source}</span>
                </div>`
              : ""
          }
          <div class="article-tags">
            ${(post.categoryPath || post.tags).map((tag) => `<span>${tag}</span>`).join("")}
          </div>
          <span class="read-more">
            阅读笔记
            <i data-lucide="arrow-right"></i>
          </span>
        </button>
      `,
    )
    .join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderDetail(post) {
  selectedPost = post;
  if (!post) {
    noteDetail.hidden = true;
    return;
  }

  detailType.textContent = post.type;
  detailDate.textContent = post.date;
  detailDate.dateTime = post.date;
  detailTitle.textContent = post.title;
  detailMinutes.textContent = `${post.minutes} 分钟阅读`;
  detailSource.textContent = post.source || "";
  detailTags.innerHTML = (post.categoryPath || post.tags).map((tag) => `<span>${tag}</span>`).join("");
  detailBody.innerHTML = markdownToHtml(post.body);
  noteDetail.hidden = false;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  noteDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectPostBySlug(slug) {
  const rawSlug = slug?.replace(/^#/, "").replace(/^note-/, "") || "";
  const normalized = decodeURIComponent(rawSlug);
  const post = posts.find((item) => item.slug === normalized);
  renderDetail(post);
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
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderPosts();
});

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".article-card[data-slug]");
  if (!card) return;
  const post = posts.find((item) => item.slug === card.dataset.slug);
  if (!post) return;
  renderDetail(post);
  history.pushState(null, "", `#note-${encodeURIComponent(post.slug)}`);
});

backToArticles.addEventListener("click", () => {
  selectedPost = null;
  noteDetail.hidden = true;
  history.pushState(null, "", "#articles");
  document.querySelector("#articles").scrollIntoView({ behavior: "smooth", block: "start" });
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

window.addEventListener("hashchange", () => {
  if (window.location.hash.startsWith("#note-")) {
    selectPostBySlug(window.location.hash.slice(1));
  } else if (window.location.hash === "#articles") {
    renderDetail(null);
  }
});

if (window.location.hash.startsWith("#note-")) {
  selectPostBySlug(window.location.hash.slice(1));
}
