import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "https://preview-chat-*.space.z.ai",
    "http://preview-chat-*.space.z.ai",
    "https://*.space.z.ai",
    "http://*.space.z.ai",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
