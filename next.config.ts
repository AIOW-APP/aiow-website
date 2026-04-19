import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
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
