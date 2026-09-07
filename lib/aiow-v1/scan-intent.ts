export type ScanSubject = "bedrijf" | "pand" | "woning" | "anders";

const INTENT_TO_SUBJECT: Record<string, ScanSubject> = {
  proces: "bedrijf",
  process: "bedrijf",
  bedrijf: "bedrijf",
  business: "bedrijf",
  pand: "pand",
  building: "pand",
  woning: "woning",
  home: "woning",
};

export function scanSubjectFromIntent(intent: string | null | undefined): ScanSubject {
  return intent ? INTENT_TO_SUBJECT[intent.toLowerCase()] ?? "bedrijf" : "bedrijf";
}

export function scanSubjectForPillar(slug: string): ScanSubject {
  if (slug === "smart-office") return "pand";
  if (slug === "home") return "woning";
  return "bedrijf";
}

export function scanHrefForPillar(slug: string, locale: "nl" | "en"): string {
  const intent = slug === "smart-office" ? "pand" : slug === "home" ? "woning" : "proces";
  const returnTo = pillarReturnPath(slug, locale);
  return `${locale === "en" ? "/en" : ""}/scan?intent=${intent}&returnTo=${encodeURIComponent(returnTo)}`;
}

const PILLAR_RETURN_PATHS = new Set([
  "/ai-automatisering", "/smart-office", "/home", "/lokale-ai",
  "/en/ai-automation", "/en/smart-office", "/en/home", "/en/local-ai",
]);

function pillarReturnPath(slug: string, locale: "nl" | "en"): string {
  if (locale === "en") {
    if (slug === "ai-automation") return "/en/ai-automation";
    if (slug === "smart-office") return "/en/smart-office";
    if (slug === "home") return "/en/home";
    return "/en/local-ai";
  }
  if (slug === "smart-office") return "/smart-office";
  if (slug === "home") return "/home";
  if (slug === "lokale-ai") return "/lokale-ai";
  return "/ai-automatisering";
}

export function safeScanReturnPath(value: string | null | undefined): string | undefined {
  return value && PILLAR_RETURN_PATHS.has(value) ? value : undefined;
}
