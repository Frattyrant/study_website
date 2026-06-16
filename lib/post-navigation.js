function findNextPostInCategory(posts, slug) {
  const currentIndex = posts.findIndex((post) => post.slug === slug);
  if (currentIndex < 0) return undefined;

  const currentPost = posts[currentIndex];
  const nextPost = posts[currentIndex + 1];
  return nextPost?.category === currentPost.category ? nextPost : undefined;
}

function findPostsInSameCategory(posts, slug) {
  const currentPost = posts.find((post) => post.slug === slug);
  if (!currentPost) return [];

  return posts.filter((post) => post.category === currentPost.category);
}

module.exports = { findNextPostInCategory, findPostsInSameCategory };
