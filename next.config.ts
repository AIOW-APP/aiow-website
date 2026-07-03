import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Pre-launch note: `experimental.optimizePackageImports` was removed because
  // Next 15.5 production preview threw `TypeError: a[d] is not a function`
  // on the /en and /nl homepage routes when it touched unused packages.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/home-v3.html" },
      ],
    };
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
