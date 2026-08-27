import type { MetadataRoute } from "next";

const SITE_URL = "https://aiow.ai";
const protectedPaths = ["/api/", "/portal/admin", "/admin/"];
const publicAiBots = ["GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "anthropic-ai", "Google-Extended", "PerplexityBot", "CCBot", "meta-externalagent"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: protectedPaths },
      ...publicAiBots.map((userAgent) => ({ userAgent, allow: "/", disallow: protectedPaths })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
