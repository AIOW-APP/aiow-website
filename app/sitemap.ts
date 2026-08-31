import type { MetadataRoute } from "next";
import { PUBLIC_ROUTE_PAIRS } from "@/lib/aiow-v1/locale";
import { PRICING_CONTEXT_SLUGS } from "@/lib/aiow-v1/pricing-contexts";

const SITE_URL = "https://aiow.ai";
const routePairs: readonly (readonly [string, string])[] = [
  ...PUBLIC_ROUTE_PAIRS,
  ...PRICING_CONTEXT_SLUGS.map((slug) => [`/tarieven/${slug}`, `/en/rates/${slug}`] as const),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-31T00:00:00.000Z");
  return routePairs.flatMap(([nl, en], pairIndex) => {
    const languages = { nl: `${SITE_URL}${nl}`, en: `${SITE_URL}${en}`, "x-default": `${SITE_URL}${nl}` };
    return [nl, en].map((path, localeIndex) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: pairIndex === 0 && localeIndex === 0 ? 1 : pairIndex === 0 ? 0.8 : 0.9,
      alternates: { languages },
    }));
  });
}
