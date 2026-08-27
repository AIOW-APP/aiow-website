import type { Metadata } from "next";

export const SITE_URL = "https://aiow.ai";
export const homeFaq = [
  { question: "Wat is inbegrepen in de prijsindicatie?", answer: "De indicatie omvat de gepubliceerde implementatie- en beheerprijs voor de gekozen route. Hardware, installatie en cloud- of AI-gebruik zijn niet inbegrepen." },
  { question: "Is de berekende prijs definitief?", answer: "Nee. De calculator geeft een transparante indicatie. Na een scan legt AIOW de definitieve scope, afhankelijkheden en prijs vast." },
  { question: "Levert AIOW hardware voor kantoor of woning?", answer: "Niet binnen deze gepubliceerde prijs. Fysieke levering en installatie worden apart gescoped en vereisen waar nodig een gekwalificeerde partner." },
];

export function pageMetadata({ title, description, path, locale = "nl" }: { title: string; description: string; path: string; locale?: "nl" | "en" }): Metadata {
  const canonical = `${SITE_URL}${path}`;
  const homeAlternates = path === "/" || path === "/en" ? { nl: SITE_URL, en: `${SITE_URL}/en`, "x-default": SITE_URL } : undefined;
  return { title, description, alternates: { canonical, languages: homeAlternates }, openGraph: { type: "website", siteName: "AIOW", title, description, url: canonical, locale: locale === "nl" ? "nl_NL" : "en_GB", images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "AIOW — Working AI, precisely installed" }] }, twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/opengraph-image`] } };
}

export function homeSchemas(locale: "nl" | "en" = "nl") {
  const en = locale === "en";
  return [
    { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "AIOW", url: SITE_URL, description: en ? "AIOW scopes, builds and manages practical AI systems for companies and buildings." : "AIOW inventariseert, bouwt en beheert praktische AI-systemen voor bedrijven en gebouwen." },
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "AIOW", inLanguage: ["nl-NL", "en"] },
    { "@context": "https://schema.org", "@type": "Service", "@id": `${SITE_URL}/#service`, provider: { "@id": `${SITE_URL}/#organization` }, name: en ? "Practical AI implementation and management" : "Praktische AI-implementatie en beheer", areaServed: "NL", offers: { "@type": "Offer", priceCurrency: "EUR", price: "4950", description: en ? "Published starting indication; exclusions apply." : "Gepubliceerde vanaf-indicatie; uitsluitingen gelden." } },
  ];
}

export function pillarSchemas(data: { slug: string; title: string; answer: string; pricing: { headline: string; note: string }; faq: { question: string; answer: string }[] }) {
  const url = `${SITE_URL}/${data.slug}`;
  return [
    { "@context": "https://schema.org", "@type": "Service", "@id": `${url}/#service`, name: data.title, description: data.answer, url, provider: { "@id": `${SITE_URL}/#organization` }, areaServed: "NL", offers: { "@type": "Offer", priceCurrency: "EUR", description: `${data.pricing.headline}. ${data.pricing.note}` } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: data.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIOW", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Oplossingen", item: `${SITE_URL}/#oplossingen` },
      { "@type": "ListItem", position: 3, name: data.title, item: url },
    ] },
  ];
}

export function JsonLd({ data }: { data: object | object[] }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />; }
