import type { Metadata } from "next";
import type { PricingContext, PricingPackage } from "./pricing-contexts";
import type { AiowLocale } from "./locale";
import { localizedSchema } from "./seo-schema-localized";
import { AIOW_COMPANY } from "./company.mjs";

export const SITE_URL = "https://aiow.ai";
export const homeFaq = [
  { question: "Wat is inbegrepen in de prijsindicatie?", answer: "De indicatie omvat de gepubliceerde aansluiting en beheerprijs voor de gekozen route. Btw, hardware, fysieke installatie en cloud-, AI- of leveranciersgebruik zijn niet inbegrepen." },
  { question: "Is de berekende prijs definitief?", answer: "Nee. De calculator geeft een transparante indicatie. Na een scan legt AIOW de definitieve scope, afhankelijkheden en prijs vast." },
  { question: "Levert AIOW hardware voor kantoor of woning?", answer: "Niet binnen deze gepubliceerde prijs. Fysieke levering en installatie worden apart gescoped en vereisen waar nodig een gekwalificeerde partner." },
];

export function pageMetadata({ title, description, path, pairedPaths, locale = "nl" }: { title: string; description: string; path: string; pairedPaths: { nl: string; en: string }; locale?: AiowLocale }): Metadata {
  const canonical = `${SITE_URL}${path}`;
  const languages = { nl: `${SITE_URL}${pairedPaths.nl}`, en: `${SITE_URL}${pairedPaths.en}`, "x-default": `${SITE_URL}${pairedPaths.nl}` };
  return { title: { absolute: title }, description, alternates: { canonical, languages }, openGraph: { type: "website", siteName: "AIOW", title, description, url: canonical, locale: locale === "nl" ? "nl_NL" : "en_GB", alternateLocale: [locale === "nl" ? "en_GB" : "nl_NL"], images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "AIOW — Working AI, precisely installed" }] }, twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/opengraph-image`] } };
}

export function organizationNode(locale: AiowLocale = "nl") {
  const en = locale === "en";
  return {
    "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`,
    name: AIOW_COMPANY.name, alternateName: AIOW_COMPANY.alternateName, legalName: AIOW_COMPANY.legalName, url: AIOW_COMPANY.website, email: AIOW_COMPANY.publicEmail,
    identifier: { "@type": "PropertyValue", propertyID: "KvK", value: AIOW_COMPANY.chamberOfCommerce },
    address: { "@type": "PostalAddress", streetAddress: AIOW_COMPANY.streetAddress, postalCode: AIOW_COMPANY.postalCode, addressLocality: AIOW_COMPANY.locality, addressCountry: AIOW_COMPANY.countryCode },
    areaServed: { "@type": "Country", name: en ? AIOW_COMPANY.countryEn : AIOW_COMPANY.countryNl },
    description: en ? "Dutch company designing, installing and maintaining bounded AI systems for business processes, buildings and homes." : "Nederlands bedrijf dat begrensde AI-systemen ontwerpt, installeert en beheert voor bedrijfsprocessen, gebouwen en woningen.",
  };
}

export function homeSchemas(locale: "nl" | "en" = "nl") {
  const en = locale === "en";
  return [
    organizationNode(locale),
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "AIOW", inLanguage: ["nl-NL", "en"] },
    { "@context": "https://schema.org", "@type": "Service", "@id": en ? `${SITE_URL}/en#service` : `${SITE_URL}/#service`, url: en ? `${SITE_URL}/en` : SITE_URL, inLanguage: en ? "en-GB" : "nl-NL", provider: { "@id": `${SITE_URL}/#organization` }, name: en ? "Practical AI implementation and management" : "Praktische AI-implementatie en beheer", areaServed: "NL", offers: { "@type": "Offer", priceCurrency: "EUR", price: "2950", description: en ? "Published starting indication excluding VAT and third-party costs; final after scan." : "Gepubliceerde vanaf-indicatie excl. btw en derde-kosten; definitief na scan." } },
  ];
}

export function pillarSchemas(data: { slug: string; title: string; answer: string; pricing: { headline: string; note: string }; faq: { question: string; answer: string }[] }, locale: AiowLocale = "nl") {
  const url = `${SITE_URL}/${locale === "en" ? `en/${data.slug}` : data.slug}`;
  const language = locale === "en" ? "en-GB" : "nl-NL";
  return [
    organizationNode(locale),
    { "@context": "https://schema.org", "@type": "Service", "@id": `${url}/#service`, name: data.title, description: data.answer, url, inLanguage: language, provider: { "@id": `${SITE_URL}/#organization` }, areaServed: "NL", offers: { "@type": "Offer", priceCurrency: "EUR", description: `${data.pricing.headline}. ${data.pricing.note}` } },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: language, mainEntity: data.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIOW", item: locale === "en" ? `${SITE_URL}/en` : SITE_URL },
      { "@type": "ListItem", position: 2, name: locale === "en" ? "Solutions" : "Oplossingen", item: locale === "en" ? `${SITE_URL}/en#solutions` : `${SITE_URL}/#oplossingen` },
      { "@type": "ListItem", position: 3, name: data.title, item: url },
    ] },
  ];
}

const quantity = (unitCode: string, unitText: string, value = 1) => ({ "@type": "QuantitativeValue", value, unitCode, unitText });
const month = quantity("MON", "maand");
const unitPrice = (name: string, price: string, unitCode: string, unitText: string, description: string, monthly = false) => ({
  "@type": "UnitPriceSpecification", name, price, priceCurrency: "EUR", valueAddedTaxIncluded: false,
  referenceQuantity: quantity(unitCode, unitText), ...(monthly ? { billingDuration: month } : {}), description,
});
const fixedPrice = (name: string, price: string, description: string, monthly = false) => ({
  "@type": "PriceSpecification", name, price, priceCurrency: "EUR", valueAddedTaxIncluded: false,
  ...(monthly ? { billingDuration: month } : {}), description,
});

const packageOffers: Record<PricingPackage, object> = {
  "business-start": { "@type":"Offer", name:"Business Start", priceSpecification:[fixedPrice("Aansluiting","2950","Eenmalige aansluiting voor maximaal 10 personen."),unitPrice("Beheer per persoon per maand","49","C62","persoon","Maandelijks per persoon; minimum €295 per maand.",true),fixedPrice("Minimum beheer per maand","295","Hard maandminimum.",true)] },
  "business-growth": { "@type":"Offer", name:"Business Growth", priceSpecification:[fixedPrice("Aansluiting","7500","Eenmalige aansluiting voor 11–50 personen."),unitPrice("Beheer per persoon per maand","59","C62","persoon","Maandelijks per persoon; minimum €795 per maand.",true),fixedPrice("Minimum beheer per maand","795","Hard maandminimum.",true)] },
  "business-accelerated": { "@type":"Offer", name:"Business Accelerated", priceSpecification:[fixedPrice("Aansluiting","19500","Eenmalige aansluiting voor 51–250 personen."),unitPrice("Beheer per persoon per maand","69","C62","persoon","Maandelijks per persoon; minimum €2.950 per maand.",true),fixedPrice("Minimum beheer per maand","2950","Hard maandminimum.",true)] },
  "private-ai": { "@type":"Offer", name:"Private AI", description:"Vanafprijs en indicatie; definitief na technische scan.",priceSpecification:[fixedPrice("Aansluiting vanaf","49500","Eenmalige vanafprijs voor meer dan 250 personen of gevoelige data."),unitPrice("Beheer per persoon per maand","89","C62","persoon","Maandelijks per persoon; minimum €7.500 per maand.",true),fixedPrice("Minimum beheer per maand","7500","Hard maandminimum.",true)] },
  "smart-office": { "@type":"Offer", name:"Smart Office",priceSpecification:[unitPrice("Aansluiting per m²","65","MTK","vierkante meter","Eenmalig; minimum aansluiting €9.500."),fixedPrice("Minimum aansluiting","9500","Hard eenmalig minimum."),unitPrice("Beheer per m² per maand","0.95","MTK","vierkante meter","Maandelijks; minimum €495 per maand.",true),fixedPrice("Minimum beheer per maand","495","Hard maandminimum.",true)] },
  "office-xl": { "@type":"Offer", name:"Smart Office XL",description:"Alleen indicatie/offerte voor meer dan 2.000 m²; gepubliceerde bedragen zijn vanafprijzen.",priceSpecification:[unitPrice("Aansluiting vanaf per m²","45","MTK","vierkante meter","Eenmalige vanafprijs; definitief per offerte."),unitPrice("Beheer vanaf per m² per maand","0.75","MTK","vierkante meter","Maandelijkse vanafprijs; minimum €1.950 per maand.",true),fixedPrice("Minimum beheer per maand","1950","Hard maandminimum.",true)] },
  home: { "@type":"Offer", name:"AIOW Home",priceSpecification:[unitPrice("Aansluiting per m²","95","MTK","vierkante meter","Eenmalig; minimum aansluiting €7.500."),fixedPrice("Minimum aansluiting","7500","Hard eenmalig minimum."),unitPrice("Beheer per m² per maand","1.25","MTK","vierkante meter","Maandelijks; minimum €225 per maand.",true),fixedPrice("Minimum beheer per maand","225","Hard maandminimum.",true)] },
  signature: { "@type":"Offer", name:"AIOW Signature",priceSpecification:[unitPrice("Aansluiting per m²","165","MTK","vierkante meter","Eenmalig; minimum aansluiting €19.500."),fixedPrice("Minimum aansluiting","19500","Hard eenmalig minimum."),unitPrice("Beheer per m² per maand","1.95","MTK","vierkante meter","Maandelijks; minimum €495 per maand.",true),fixedPrice("Minimum beheer per maand","495","Hard maandminimum.",true)] },
  "smart-design-blueprint": { "@type":"Offer",name:"Smart Design Blauwdruk",description:"Hoogste van €12,50 per m² BVO, 12% technologiebudget of €9.500. Vanafprijs; boven 10 woningen offerte, nooit onder minimum.",priceSpecification:[unitPrice("Blauwdruk per m² BVO","12.50","MTK","vierkante meter","Eenmalig; hoogste anker geldt."),fixedPrice("Minimum Blauwdruk","9500","Hard minimum; 12% van technologiebudget kan hoger zijn.")] },
};

export function tariffSchemas(locale: AiowLocale = "nl") {
  const en = locale === "en";
  const url = `${SITE_URL}${en ? "/en/rates" : "/tarieven"}`;
  const serviceOffers = Object.values(packageOffers);
  const schemas = [
    organizationNode(locale),
    { "@context":"https://schema.org", "@type":"Service", "@id":`${url}/#service`, name:en ? "AIOW implementation, management and Smart Design" : "AIOW implementatie, beheer en Smart Design", description:en ? "AI for business processes, buildings and homes with public starting prices, units, cadence and minimums." : "AI voor bedrijfsprocessen, gebouwen en woningen met publieke vanafprijzen, eenheden, cadans en minima.", url, inLanguage:en ? "en-GB" : "nl-NL", provider:{"@id":`${SITE_URL}/#organization`}, areaServed:"NL", offers:[
      ...serviceOffers,
      { "@type":"Offer",name:"Comfort",description:"Optioneel en alleen met verplichte automatische incasso. Abonnementen: werkelijke providerkostprijs +25%. Providerprijsstijgingen worden 1-op-1 doorbelast plus die 25% marge. Hardware: kostprijs +15%, met volledige vooruitbetaling of een aanbetaling van ten minste de hardwarewaarde vóór bestelling. AIOW financiert nooit renteloos voor. Onbekende derde-kosten vormen geen vast eindbedrag.",additionalProperty:[{"@type":"PropertyValue",name:"Abonnementenmarge",value:25,unitText:"PERCENT"},{"@type":"PropertyValue",name:"Hardwaremarge",value:15,unitText:"PERCENT"},{"@type":"PropertyValue",name:"Automatische incasso",value:"verplicht"}] },
      { "@type":"Offer",name:"Regie & engineering",priceSpecification:unitPrice("Meerwerk per uur","135","HUR","uur","Per kwartier, vooraf gemeld.") },
      { "@type":"Offer",name:"Spoed / buiten kantooruren",priceSpecification:unitPrice("Spoed per uur","195","HUR","uur","Na expliciete afstemming.") },
      { "@type":"Offer",name:"Bezoek op locatie",priceSpecification:fixedPrice("Voorrijtarief","95","Naast uurtarief en reis-/werkafspraken.") },
      { "@type":"Offer",name:"Verdiepend advies",priceSpecification:unitPrice("Advies per uur","175","HUR","uur","Workshops, second opinions, architectuur en strategie.") },
      { "@type":"Offer",name:"Advies dagdeel",priceSpecification:fixedPrice("Dagdeel","650","Vooraf afgebakend dagdeel.") },
      { "@type":"Offer",name:"Advies dag",priceSpecification:unitPrice("Dag","1200","DAY","dag","Vooraf afgebakend.") },
      { "@type":"Offer",name:"Diepe Kansenscan · 50+",description:"Vanafprijs; verrekenbaar bij opdracht binnen 60 dagen.",priceSpecification:fixedPrice("Vanafprijs Diepe Kansenscan","1950","Eenmalige vanafprijs.") },
      { "@type":"Offer",name:"Smart Design Scan",description:"50% van de Scan is verrekenbaar bij doorgang naar Blauwdruk.",priceSpecification:[unitPrice("Scan per m² BVO","3.50","MTK","vierkante meter","Eenmalig."),fixedPrice("Minimum Scan","2950","Hard minimum.")] },
      { "@type":"Offer",name:"Smart Design Regie",description:"Hoogste van €7,50 per m² BVO, 5% technologiebudget of €7.500.",priceSpecification:[unitPrice("Regie per m² BVO","7.50","MTK","vierkante meter","Eenmalig; hoogste anker geldt."),fixedPrice("Minimum Regie","7500","Hard minimum; 5% technologiebudget kan hoger zijn.")] },
    ], termsOfService:`${url}#uitsluitingen` },
    { "@context":"https://schema.org", "@type":"BreadcrumbList", inLanguage:en ? "en-GB" : "nl-NL", itemListElement:[{"@type":"ListItem",position:1,name:"AIOW",item:en ? `${SITE_URL}/en` : SITE_URL},{"@type":"ListItem",position:2,name:en ? "Rates" : "Tarieven",item:url}] },
  ];
  return localizedSchema(schemas, locale);
}

export function pricingContextSchemas(data: PricingContext, locale: AiowLocale = "nl") {
  const en = locale === "en";
  const url = `${SITE_URL}${en ? "/en/rates" : "/tarieven"}/${data.slug}`;
  return [
    organizationNode(locale),
    { "@context":"https://schema.org", "@type":"Service", "@id":`${url}/#service`, name:data.title, description:data.introduction, url, inLanguage:en ? "en-GB" : "nl-NL", provider:{"@id":`${SITE_URL}/#organization`}, areaServed:"NL", offers:localizedSchema(packageOffers[data.package], locale) },
    { "@context":"https://schema.org", "@type":"BreadcrumbList", inLanguage:en ? "en-GB" : "nl-NL", itemListElement:[{"@type":"ListItem",position:1,name:"AIOW",item:en ? `${SITE_URL}/en` : SITE_URL},{"@type":"ListItem",position:2,name:en ? "Rates" : "Tarieven",item:`${SITE_URL}${en ? "/en/rates" : "/tarieven"}`},{"@type":"ListItem",position:3,name:en ? data.labelEn : data.labelNl,item:url}] },
  ];
}

export function capabilitiesSchemas(locale: AiowLocale = "nl") {
  const en = locale === "en";
  const path = en ? "/en/capabilities" : "/mogelijkheden";
  const url = `${SITE_URL}${path}`;
  return [
    organizationNode(locale),
    { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url}#webpage`, url, name: en ? "AI capabilities in practice" : "AI-mogelijkheden in de praktijk", description: en ? "Synthetic reference workflows showing how signals, AI interpretation, bounded system actions and human authority work together." : "Synthetische referentieworkflows die laten zien hoe signalen, AI-interpretatie, begrensde systeemacties en menselijke autoriteit samenwerken.", inLanguage: en ? "en-GB" : "nl-NL", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIOW", item: en ? `${SITE_URL}/en` : SITE_URL },
      { "@type": "ListItem", position: 2, name: en ? "Capabilities" : "Mogelijkheden", item: url },
    ] },
  ];
}

export function JsonLd({ data }: { data: object | object[] }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />; }
