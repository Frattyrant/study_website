import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SitePet } from "@/components/site-pet";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SITE_AUTHOR,
  SITE_BASE_URL,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/site";

import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "study_website";
const productionBasePath = process.env.NODE_ENV === "production" ? `/${repositoryName}` : "";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_BASE_URL}/`),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR, url: getSiteUrl("/") }],
  creator: SITE_AUTHOR,
  alternates: { canonical: getSiteUrl("/") },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: getSiteUrl("/"),
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: getSiteUrl("/images/pawn-site-background.webp"),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [getSiteUrl("/images/pawn-site-background.webp")],
  },
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
