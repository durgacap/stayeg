import type { MetadataRoute } from "next";

const SITE_URL = "https://stayeg.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // SPA with a single route — all sections are client-side rendered via Zustand
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
