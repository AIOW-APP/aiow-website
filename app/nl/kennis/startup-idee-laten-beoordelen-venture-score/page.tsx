import { VentureScoreKnowledgePage } from "@/components/aiow-v1/KnowledgePages";
import { JsonLd, pageMetadata, SITE_URL } from "@/lib/aiow-v1/seo";

const path = "/nl/kennis/startup-idee-laten-beoordelen-venture-score";
export const metadata = pageMetadata({ title: "Startup-idee laten beoordelen met een venture-score | AIOW", description: "Hoe AIOW founder, markt, probleem, AI-hefboom, tractie, bouwbaarheid en dealkwaliteit beoordeelt met menselijke beslisgate.", path, pairedPaths: { nl: path, en: "/en/knowledge/startup-idea-venture-score" } });
const schemas = [
  { "@context": "https://schema.org", "@type": "Article", headline: "Startup-idee laten beoordelen met een venture-score", description: "Zeven dimensies, tegenbewijs en een verplichte menselijke beslisgate.", inLanguage: "nl-NL", datePublished: "2026-08-31", dateModified: "2026-08-31", mainEntityOfPage: `${SITE_URL}${path}`, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` } },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AIOW", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Kennis", item: `${SITE_URL}/nl/kennis` }, { "@type": "ListItem", position: 3, name: "Venture-score", item: `${SITE_URL}${path}` }] },
];
export default function Page() { return <><JsonLd data={schemas} /><VentureScoreKnowledgePage locale="nl" /></>; }
