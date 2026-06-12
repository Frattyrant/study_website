import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SitePet } from "@/components/site-pet";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "study_website";
const productionBasePath = process.env.NODE_ENV === "production" ? `/${repositoryName}` : "";

export const metadata: Metadata = {
  title: {
    default: "pawn的知识库",
    template: "%s | pawn的知识库",
  },
  description: "记录 Linux、Python 后端及个人技术学习笔记的知识库。",
  icons: { icon: `${productionBasePath}/favicon.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main>{children}</main>
          <SitePet />
        </ThemeProvider>
      </body>
    </html>
  );
}
