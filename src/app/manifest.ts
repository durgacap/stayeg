import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StayEg — India's Most Trusted PG Platform",
    short_name: "StayEg",
    description:
      "Find, book, and manage verified PG accommodations across 20+ Indian cities. Zero brokerage, instant booking.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["real estate", "lifestyle", "business"],
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [],
  };
}
