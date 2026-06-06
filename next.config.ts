import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "study_website";
const basePath = isProduction ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isProduction ? "export" : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
