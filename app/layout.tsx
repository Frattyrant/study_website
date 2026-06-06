import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "study_website";
const productionBasePath = process.env.NODE_ENV === "production" ? `/${repositoryName}` : "";

export const metadata: Metadata = {
  title: {
    default: "pawn的个人学习网站",
    template: "%s | pawn的个人学习网站",
  },
  description: "pawn的个人学习网站，记录 Linux 入门和 Python 后端学习笔记。",
  icons: { icon: `${productionBasePath}/favicon.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
