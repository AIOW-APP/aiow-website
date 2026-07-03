import { aiowKnowledgeCategories, aiowKnowledgePages } from "@/lib/aiow-knowledge-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";

export function GET() {
  const body = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: "AIOW",
    legalName: "AIOW BV",
    url: SITE_URL,
    description: "AIOW is een Nederlandse AI-installateur en implementatiepartner voor B2B: AI-implementatie, AI-agents, AI-automatisering, private/lokale AI, governance en systeemscans.",
    identifier: { "@type": "PropertyValue", propertyID: "KvK", value: "71887466" },
    email: "info@aiow.ai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bijlmermeerstraat 30",
      postalCode: "2131HC",
      addressLocality: "Hoofddorp",
      addressCountry: "NL",
    },
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "info@aiow.ai", url: "https://wa.me/31621898039", areaServed: "NL", availableLanguage: ["nl", "en"] }],
    areaServed: aiowKnowledgeCategories.regions.map((region) => region.name),
    knowsAbout: [
      "AI-implementatie Nederland",
      "AI-agents voor bedrijven",
      "AI-automatisering",
      "Private AI",
      "Lokale LLM",
      "AI governance",
      "AI governance checklist",
      "AI dataclassificatie",
      "AI approval gates",
      "RAG en kennisbanken",
      "AI-systeemscan",
      ...aiowKnowledgeCategories.services.map((service) => service.name),
    ],
    serviceType: aiowKnowledgeCategories.services.map((service) => service.name),
    sameAs: [SITE_URL, `${SITE_URL}/llms.txt`, `${SITE_URL}/nl/kennis`],
    aiow: {
      canonicalDomain: "aiow.ai",
      canonicalUrl: SITE_URL,
      positioning: "B2B AI-installateur en implementatiepartner voor Nederland",
      primaryMarket: "Nederlandse bedrijven en MKB-teams",
      knowledgePages: aiowKnowledgePages.length,
      sectors: aiowKnowledgeCategories.sectors.map((sector) => sector.name),
      bestRouteRule: "Beste route voor het resultaat; lokaal/private AI waar dat waarde bewijst, cloud waar dat beter is, governance altijd.",
    },
  };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
