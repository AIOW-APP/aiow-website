import type { MetadataRoute } from "next";
import { PRICING_CONTEXT_SLUGS } from "@/lib/aiow-v1/pricing-contexts";

const SITE_URL = "https://aiow.ai";
const routes = ["", "/en", "/tarieven", ...PRICING_CONTEXT_SLUGS.map((slug) => `/tarieven/${slug}`), "/ai-automatisering", "/lokale-ai", "/smart-office", "/home"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-28T00:00:00.000Z");
  return routes.map((path, index) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: index === 0 ? 1 : path === "/en" ? 0.8 : 0.9,
    alternates: path === "" || path === "/en" ? { languages: { nl: SITE_URL, en: `${SITE_URL}/en`, "x-default": SITE_URL } } : undefined,
  }));
}
