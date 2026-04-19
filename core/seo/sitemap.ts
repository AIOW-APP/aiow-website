/**
 * Debbie sitemap generator — use as app/sitemap.ts
 *
 *   import { generateSitemap } from "@/core/seo/sitemap";
 *   export default function sitemap() {
 *     return generateSitemap("https://aiow.ai", [
 *       { path: "/",          priority: 1.0, changeFreq: "daily" },
 *       { path: "/portfolio", priority: 0.9 },
 *       { path: "/about",     priority: 0.6 },
 *     ]);
 *   }
 */

import type { MetadataRoute } from "next";

export interface Route {
  path: string;
  priority?: number;
  changeFreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastModified?: Date | string;
}

export function generateSitemap(siteUrl: string, routes: Route[]): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: r.lastModified ? new Date(r.lastModified) : new Date(),
    changeFrequency: r.changeFreq || "weekly",
    priority: r.priority ?? 0.5,
  }));
}
