import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins expects bare hostnames (no protocol), matching against Origin header hostname.
  allowedDevOrigins: [
    "preview-chat-b1f7b228-d558-43b2-a40e-9099a3e86d3d.space.z.ai",
    "*.space.z.ai",
  ],
  // Prevent Turbopack from bundling Node.js-only packages into client code
  serverExternalPackages: ['bcryptjs', 'jsonwebtoken', 'razorpay', 'resend'],
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
