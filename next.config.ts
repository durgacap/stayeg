import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "https://preview-chat-*.space.z.ai",
    "http://preview-chat-*.space.z.ai",
    "https://*.space.z.ai",
    "http://*.space.z.ai",
    "https://preview-chat-b1f7b228-d558-43b2-a40e-9099a3e86d3d.space.z.ai",
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
};

export default nextConfig;
