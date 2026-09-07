export const PUBLIC_ROUTE_PAIRS = Object.freeze([
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
  ["/scan", "/en/scan"],
].map((pair) => Object.freeze(pair)));

export const PRICING_CONTEXT_SLUGS = Object.freeze([
  "accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren",
  "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject",
]);

const nlPricingRoutes = Object.freeze(PRICING_CONTEXT_SLUGS.map((slug) => `/tarieven/${slug}`));
const enPricingRoutes = Object.freeze(PRICING_CONTEXT_SLUGS.map((slug) => `/en/rates/${slug}`));

export const PARAMETERIZED_PUBLIC_ROUTES = Object.freeze([
  Object.freeze({ pattern: "/tarieven/[slug]", expandedRoutes: nlPricingRoutes }),
  Object.freeze({ pattern: "/en/rates/[slug]", expandedRoutes: enPricingRoutes }),
]);

export const SITEMAP_ROUTE_PAIRS = Object.freeze([
  ...PUBLIC_ROUTE_PAIRS,
  ...PRICING_CONTEXT_SLUGS.map((slug) => Object.freeze([`/tarieven/${slug}`, `/en/rates/${slug}`])),
]);

export const SITEMAP_ROUTES = Object.freeze(SITEMAP_ROUTE_PAIRS.flat());

export const MOUNTED_ROUTE_POLICIES = Object.freeze([
  Object.freeze({ pattern: "/portal", classification: "proof-only", proofRoutes: Object.freeze(["/portal"]) }),
  Object.freeze({ pattern: "/portal/project/[accountId]", classification: "proof-only", proofRoutes: Object.freeze(["/portal/project/not-found"]) }),
  Object.freeze({ pattern: "/portal/admin", classification: "private-operator", proofRoutes: Object.freeze([]) }),
  Object.freeze({ pattern: "/legacy-aiow", classification: "legacy-noindex", proofRoutes: Object.freeze([]) }),
]);

export const PROOF_ONLY_ROUTES = Object.freeze(MOUNTED_ROUTE_POLICIES.flatMap(({ classification, proofRoutes }) => classification === "proof-only" ? proofRoutes : []));
