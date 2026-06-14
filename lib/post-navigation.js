function findNextPostInCategory(posts, slug) {
  const currentIndex = posts.findIndex((post) => post.slug === slug);
  if (currentIndex < 0) return undefined;

  const currentPost = posts[currentIndex];
  const nextPost = posts[currentIndex + 1];
  return nextPost?.category === currentPost.category ? nextPost : undefined;
}

module.exports = { findNextPostInCategory };
