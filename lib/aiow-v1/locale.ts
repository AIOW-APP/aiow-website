export type AiowLocale = "nl" | "en";

export const PUBLIC_ROUTE_PAIRS = [
  ["/", "/en"],
  ["/tarieven", "/en/rates"],
  ["/ai-automatisering", "/en/ai-automation"],
  ["/lokale-ai", "/en/local-ai"],
  ["/smart-office", "/en/smart-office"],
  ["/home", "/en/home"],
  ["/ventures", "/en/ventures"],
  ["/nl/kennis", "/en/knowledge"],
  ["/nl/kennis/startup-idee-laten-beoordelen-venture-score", "/en/knowledge/startup-idea-venture-score"],
  ["/privacy", "/en/privacy"],
  ["/bedrijfsgegevens", "/en/company"],
  ["/mogelijkheden", "/en/capabilities"],
] as const;

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
