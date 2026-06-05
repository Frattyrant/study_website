const posts = window.learningPosts || [];
const vaultStats = window.vaultStats || {};

const tagList = ["全部", ...Array.from(new Set(posts.flatMap((post) => post.tags)))];
let activeTag = "全部";
let query = "";

const grid = document.querySelector("#articleGrid");
const filterRow = document.querySelector("#filterRow");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const articleCount = document.querySelector("#articleCount");
const vaultNoteCount = document.querySelector("#vaultNoteCount");
const focusCount = document.querySelector("#focusCount");
const lastUpdated = document.querySelector("#lastUpdated");
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
  vaultNoteCount.textContent = vaultStats.totalNotes || posts.length;
  focusCount.textContent = vaultStats.focusCount || 0;
  lastUpdated.textContent = vaultStats.latestDate ? vaultStats.latestDate.slice(5) : "--";
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
          ${
            post.source
              ? `<div class="article-source">
                  <i data-lucide="folder-open"></i>
                  <span>${post.source}</span>
                </div>`
              : ""
          }
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
