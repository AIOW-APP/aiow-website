import type { MetadataRoute } from "next";
import { generateSitemap } from "@/core/seo/sitemap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(SITE_URL, [
    { path: "/",          priority: 1.0, changeFreq: "weekly" },
    { path: "/privacy",   priority: 0.3, changeFreq: "yearly" },
    { path: "/terms",     priority: 0.3, changeFreq: "yearly" },
  ]);
}
