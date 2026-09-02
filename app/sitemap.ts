import type { MetadataRoute } from "next";
import { PUBLIC_ROUTE_PAIRS } from "@/lib/aiow-v1/locale";
import { PRICING_CONTEXT_SLUGS } from "@/lib/aiow-v1/pricing-contexts";

const SITE_URL = "https://aiow.ai";
const routePairs: readonly (readonly [string, string])[] = [
  ...PUBLIC_ROUTE_PAIRS,
  ...PRICING_CONTEXT_SLUGS.map((slug) => [`/tarieven/${slug}`, `/en/rates/${slug}`] as const),
];
const routeDates: Record<string,string> = {
  "/":"2026-09-01", "/en":"2026-09-01",
  "/mogelijkheden":"2026-09-01", "/en/capabilities":"2026-09-01", "/scan":"2026-09-01", "/en/scan":"2026-09-01",
  "/tarieven":"2026-08-30", "/en/rates":"2026-08-30",
  "/nl/kennis":"2026-08-31", "/en/knowledge":"2026-08-31",
  "/nl/kennis/startup-idee-laten-beoordelen-venture-score":"2026-08-31", "/en/knowledge/startup-idea-venture-score":"2026-08-31",
  "/privacy":"2026-08-30", "/en/privacy":"2026-08-30", "/bedrijfsgegevens":"2026-08-30", "/en/company":"2026-08-30",
};
function policy(path:string) {
  const isContext=/^\/(?:tarieven|en\/rates)\//.test(path);
  const isStable=["/privacy","/en/privacy","/bedrijfsgegevens","/en/company"].includes(path);
  const isHome=path==="/"||path==="/en";
  return {
    lastModified:new Date(`${routeDates[path] ?? (isContext ? "2026-08-30" : "2026-08-29")}T00:00:00.000Z`),
    changeFrequency:(isStable?"yearly":isHome?"weekly":"monthly") as "yearly"|"weekly"|"monthly",
    priority:isHome?1:path.includes("mogelijkheden")||path.includes("capabilities")||path==="/tarieven"||path==="/en/rates"?0.95:isContext?0.8:isStable?0.5:0.85,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routePairs.flatMap(([nl, en]) => {
    const languages = { nl: `${SITE_URL}${nl}`, en: `${SITE_URL}${en}`, "x-default": `${SITE_URL}${nl}` };
    return [nl, en].map((path) => ({
      url: `${SITE_URL}${path}`,
      ...policy(path),
      alternates: { languages },
    }));
  });
}
