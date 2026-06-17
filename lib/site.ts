export const SITE_NAME = "pawn的知识库";
export const SITE_NAV_NAME = "pawn的个人学习网站";
export const SITE_DESCRIPTION =
  "记录 Linux、Python 后端及个人技术学习笔记的知识库。";
export const SITE_BASE_URL = "https://frattyrant.github.io/study_website";
export const SITE_AUTHOR = "pawn";
export const SITE_LOCALE = "zh_CN";

export function getSiteUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pointsToFile = /\/[^/]+\.[^/]+$/.test(normalizedPath);
  const pathWithSlash = normalizedPath.endsWith("/") || pointsToFile
    ? normalizedPath
    : `${normalizedPath}/`;
  return encodeURI(`${SITE_BASE_URL}${pathWithSlash}`);
}
