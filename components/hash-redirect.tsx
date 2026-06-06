"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectLegacyHash = () => {
      if (!window.location.hash.startsWith("#note-")) return;
      const slug = decodeURIComponent(window.location.hash.slice("#note-".length));
      if (slug) router.replace(`/posts/${slug}`);
    };

    redirectLegacyHash();
    window.addEventListener("hashchange", redirectLegacyHash);
    return () => window.removeEventListener("hashchange", redirectLegacyHash);
  }, [router]);

  return null;
}
