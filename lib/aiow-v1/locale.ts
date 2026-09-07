import { PUBLIC_ROUTE_PAIRS } from "./public-route-manifest.mjs";

export type AiowLocale = "nl" | "en";

export { PUBLIC_ROUTE_PAIRS };

export function localizedPath(pathname: string, locale: AiowLocale): string {
  const clean = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  const contextMatch = clean.match(/^\/(?:en\/rates|tarieven)\/([^/]+)$/);
  if (contextMatch) return locale === "en" ? `/en/rates/${contextMatch[1]}` : `/tarieven/${contextMatch[1]}`;
  const pair = PUBLIC_ROUTE_PAIRS.find(([nl, en]) => clean === nl || clean === en);
  if (pair) return locale === "en" ? pair[1] : pair[0];
  return locale === "en" ? "/en" : "/";
}

export function alternatePaths(pathname: string) {
  return { nl: localizedPath(pathname, "nl"), en: localizedPath(pathname, "en") };
}

export function localeFromPath(pathname: string): AiowLocale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "nl";
}
