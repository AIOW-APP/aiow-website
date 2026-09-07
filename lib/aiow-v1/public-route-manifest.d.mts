export const PUBLIC_ROUTE_PAIRS: readonly (readonly [string, string])[];
export const PRICING_CONTEXT_SLUGS: readonly [
  "accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren",
  "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject"
];
export const PARAMETERIZED_PUBLIC_ROUTES: readonly Readonly<{ pattern: string; expandedRoutes: readonly string[] }>[];
export const SITEMAP_ROUTE_PAIRS: readonly (readonly [string, string])[];
export const SITEMAP_ROUTES: readonly string[];
export const MOUNTED_ROUTE_POLICIES: readonly Readonly<{ pattern: string; classification: "proof-only" | "private-operator" | "legacy-noindex"; proofRoutes: readonly string[] }>[];
export const PROOF_ONLY_ROUTES: readonly string[];
