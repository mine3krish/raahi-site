import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["raahiauctions.cloud"],
  }
};

export default nextConfig;
