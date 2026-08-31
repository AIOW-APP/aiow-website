import { VentureScoreKnowledgePage } from "@/components/aiow-v1/KnowledgePages";
import { JsonLd, pageMetadata, SITE_URL } from "@/lib/aiow-v1/seo";

const path = "/en/knowledge/startup-idea-venture-score";
export const metadata = pageMetadata({ title: "Assess a startup idea with a venture score | AIOW", description: "How AIOW evaluates founder, market, problem, AI leverage, traction, buildability and deal quality with a human decision gate.", path, pairedPaths: { nl: "/nl/kennis/startup-idee-laten-beoordelen-venture-score", en: path }, locale: "en" });
const schemas = [
  { "@context": "https://schema.org", "@type": "Article", headline: "Assess a startup idea with a venture score", description: "Seven dimensions, counter-evidence and a mandatory human decision gate.", inLanguage: "en-GB", datePublished: "2026-08-31", dateModified: "2026-08-31", mainEntityOfPage: `${SITE_URL}${path}`, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` } },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AIOW", item: `${SITE_URL}/en` }, { "@type": "ListItem", position: 2, name: "Knowledge", item: `${SITE_URL}/en/knowledge` }, { "@type": "ListItem", position: 3, name: "Venture score", item: `${SITE_URL}${path}` }] },
];
export default function Page() { return <><JsonLd data={schemas} /><VentureScoreKnowledgePage locale="en" /></>; }
