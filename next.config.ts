import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  serverExternalPackages: ["@mastra/*"],
  devIndicators: false,
};

export default nextConfig;
