import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["raahiauctions.cloud","raahiauction.com"],
  }
};

export default nextConfig;
