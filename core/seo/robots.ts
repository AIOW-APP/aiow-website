/**
 * Robots.txt generator — use as app/robots.ts
 *
 *   import { buildRobots } from "@/core/seo/robots";
 *   export default function robots() {
 *     return buildRobots("https://aiow.ai", { disallow: ["/admin", "/api/internal"] });
 *   }
 */

import type { MetadataRoute } from "next";

export function buildRobots(
  siteUrl: string,
  opts: { disallow?: string[]; allowAI?: boolean } = {},
): MetadataRoute.Robots {
  const disallow = opts.disallow || [];
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/", disallow: [...disallow, "/api/private/", "/admin/"] },
  ];

  // If we don't want AI crawlers (e.g. paid content), disallow them
  if (opts.allowAI === false) {
    for (const bot of ["GPTBot", "ChatGPT-User", "Claude-Web", "anthropic-ai", "PerplexityBot", "CCBot", "Google-Extended"]) {
      rules.push({ userAgent: bot, disallow: "/" });
    }
  }
  // Default: we WELCOME AI crawlers — our content benefits from being cited.

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
