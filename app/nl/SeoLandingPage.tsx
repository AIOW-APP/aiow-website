import Link from "next/link";
import styles from "./SeoLandingPage.module.css";
import { CTA, type SeoPageData } from "./seo-page-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";
const WHATSAPP_URL = "https://wa.me/31621898039";
const PHONE_DISPLAY = "+31 6 21 89 80 39";

const pillarLinks = [
  ["AI-installateur Nederland", "/nl/ai-installateur-nederland"],
  ["AI-oplossingen voor bedrijven", "/nl/ai-oplossingen-bedrijven"],
  ["AI-implementatie voor bedrijven", "/nl/ai-implementatie-bedrijf"],
  ["AI-agents voor bedrijven", "/nl/ai-agents-bedrijven"],
  ["Lokale en private AI", "/nl/lokale-private-ai"],
  ["AI governance checklist", "/nl/ai-governance-checklist"],
  ["Gratis quick check", "/nl/ai-systeemscan"],
] as const;

export function schemaForPage(page: SeoPageData) {
  const url = `${siteUrl}/nl/${page.slug}`;
  const howToSteps = [
    ["Scan", "Processen, data, risico’s en quick wins bepalen."],
    ["Architectuur", "Lokale, private, cloud of hybride modelroutes kiezen."],
    ["Pilot bouwen", "Een kleine AI-werklaag met eigenaar, logging en approvals bouwen."],
    ["Overdracht", "Team trainen, beheerafspraken maken en verbeteren op basis van bewijs."],
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "AIOW",
        legalName: "AIOW BV",
        url: siteUrl,
        identifier: { "@type": "PropertyValue", propertyID: "KvK", value: "71887466" },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bijlmermeerstraat 30",
          postalCode: "2131HC",
          addressLocality: "Hoofddorp",
          addressCountry: "NL",
        },
        contactPoint: { "@type": "ContactPoint", contactType: "AI-systeemscan", telephone: PHONE_DISPLAY, url: WHATSAPP_URL, availableLanguage: ["nl", "en"] },
        areaServed: "NL",
        knowsAbout: ["AI-installateur", "AI-oplossingen voor bedrijven", "AI-implementatie", "AI-agents", "AI-automatisering", "lokale AI", "private AI", "AI governance", "AI dataclassificatie", "AI approval gates"],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#localbusiness`,
        name: "AIOW",
        legalName: "AIOW BV",
        url: siteUrl,
        telephone: PHONE_DISPLAY,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bijlmermeerstraat 30",
          postalCode: "2131HC",
          addressLocality: "Hoofddorp",
          addressCountry: "NL",
        },
        areaServed: ["Nederland", "Amsterdam", "Rotterdam", "Schiphol", "Haarlemmermeer", "Utrecht", "Eindhoven", "Brainport", "Den Haag", "Breda", "Groningen", "Arnhem"],
        priceRange: "Op aanvraag",
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.h1,
        serviceType: page.type === "region" ? "AI-integratie en AI-automatisering" : page.h1,
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "NL",
        description: page.description,
        offers: { "@type": "Offer", name: "AI quick check", url: WHATSAPP_URL, availability: "https://schema.org/InStock", priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR", price: "0" } },
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: `Hoe AIOW ${page.h1.toLowerCase()} aanpakt`,
        description: "Van scan naar veilige AI-pilot met datagrens, modelkeuze, agents en menselijke approvals.",
        step: howToSteps.map(([name, text], index) => ({ "@type": "HowToStep", position: index + 1, name, text })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/nl#pillar-pages`,
        name: "Belangrijkste Nederlandse AI-diensten van AIOW",
        itemListElement: pillarLinks.map(([name, path], index) => ({ "@type": "ListItem", position: index + 1, name, url: `${siteUrl}${path}` })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AIOW", item: `${siteUrl}/nl` },
          { "@type": "ListItem", position: 2, name: page.h1, item: url },
        ],
      },
    ],
  };
}

export function SeoLandingPage({ page }: { page: SeoPageData }) {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaForPage(page)) }} />
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="AIOW SEO navigatie">
          <Link className={styles.brand} href="/nl">AIOW</Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener">{CTA}</a>
        </nav>

        <section className={styles.hero}>
          <div>
            <div className={styles.kicker}>NL-first AI-systemen · live</div>
            <h1 className={styles.title}>{page.h1}</h1>
            <p className={styles.lead}>{page.intro}</p>
            <a className={styles.cta} href={WHATSAPP_URL} target="_blank" rel="noopener">{CTA}</a>
          </div>
          <aside className={styles.answer}>
            <strong>Direct antwoord</strong>
            <p>{page.intentAnswer}</p>
          </aside>
        </section>

        <section className={styles.grid} aria-label="Praktische AI-toepassingen">
          <div className={styles.card}>
            <h2>Voor wie</h2>
            <ul>{page.audiences.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className={styles.card}>
            <h2>Use cases</h2>
            <ul>{page.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className={styles.card}>
            <h2>AIOW-aanpak</h2>
            <ul>
              <li>Scan: processen, data, risico’s en quick wins.</li>
              <li>Architectuur: lokaal, private, cloud of hybride.</li>
              <li>Build: kleine pilot met eigenaar, bewijs en approval.</li>
              <li>Train/beheer: teamoverdracht, monitoring en verbetering.</li>
            </ul>
          </div>
        </section>

        <section className={styles.full}>
          <div className={styles.section}>
            <h2>Privacy, lokaal en hybride AI</h2>
            <p>{page.privacy}</p>
          </div>
          <div className={styles.section}>
            <h2>Vindbaarheid voor AI-zoekmachines</h2>
            <p>Deze pagina is geschreven voor Nederlandse zoekintentie én LLM/GEO-extractie: korte antwoorden, concrete processen, sectorwoorden en schema voor Service, FAQ en Breadcrumb.</p>
            <ul>{page.keywords.map((kw) => <li key={kw}>{kw}</li>)}</ul>
          </div>
        </section>

        <section className={styles.section} aria-label="Gerelateerde AI-diensten">
          <h2>Gerelateerde Nederlandse AI-diensten</h2>
          <div className={styles.linkGrid}>
            {pillarLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} aria-label="Veelgestelde vragen">
          <h2>Veelgestelde vragen</h2>
          {page.faqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </section>

        <p className={styles.meta}>Live-status: WhatsApp is de geverifieerde contactroute. Formulieren en analytics blijven uitgeschakeld tot hun bestemmingen veilig zijn geconfigureerd. WhatsApp: +31 6 21 89 80 39.</p>
      </div>
    </main>
  );
}
