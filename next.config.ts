// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shikimori.one",
      },
      {
        protocol: "https",
        hostname: "shiki.one",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.yandex.net",
      },
    ],
  },
};

export default nextConfig;