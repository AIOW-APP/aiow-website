import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Route-hygiëne conversiepad (PRIORITIES.md #2): de raadbare CTA-URL's mogen
  // nooit een 404 zijn; alles wijst naar de ene echte aanvraagroute.
  async redirects() {
    return [
      { source: "/venture-score", destination: "/nl/venture-score-aanvragen", permanent: true },
      { source: "/venturescore", destination: "/nl/venture-score-aanvragen", permanent: true },
      { source: "/venture-score-aanvragen", destination: "/nl/venture-score-aanvragen", permanent: true },
      { source: "/nl/venture-score", destination: "/nl/venture-score-aanvragen", permanent: true },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Pre-launch note: `experimental.optimizePackageImports` was removed because
  // Next 15.5 production preview threw `TypeError: a[d] is not a function`
  // on the /en and /nl homepage routes when it touched unused packages.
  // DESIGN-DNA v2 (2026-07-05): de home-v3.html-rewrite is vervallen; app/page.tsx
  // bedient / weer met de clean-glass homepage. home-v3.html blijft als bestand
  // bestaan in public/ (additief, niets weggegooid).
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
