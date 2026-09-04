import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Keep metadata in <head> for crawlers, audits and no-JS clients.
  // Streaming it after <body> caused valid descriptions to be missed.
  htmlLimitedBots: /.*/,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    // reactCompiler: true,   // requires babel-plugin-react-compiler, enable per-project
    optimizePackageImports: ["framer-motion", "lucide-react", "@react-three/drei"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
  webpack(config) {
    // GLSL imports
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      type: "asset/source",
    });
    return config;
  },
};

export default config;
