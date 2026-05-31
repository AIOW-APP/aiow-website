import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "AIOW — jouw persoonlijke AI-medewerker",
    template: "%s · AIOW",
  },
  description:
    "AIOW installeert persoonlijke AI-medewerkers voor Nederlandse ondernemers en teams: AI die je bedrijf leert kennen, helpt met klantvragen, offertes, planning en administratie, en veilig blijft door menselijke approval.",
  keywords: [
    "AIOW",
    "AI-systeem",
    "AI-systeemscan",
    "AI integratie Nederland",
    "AI agents bedrijven",
    "AI advies bedrijf",
    "AI consultant Nederland",
    "AI implementatie Nederland",
    "AI oplossingen bedrijven",
    "AI-installateur bedrijf",
    "AI installateur Nederland",
    "AI automatisering Nederland",
    "AI agents Nederland",
    "private AI Nederland",
    "lokale AI Nederland",
    "MKB AI",
    "Schiphol logistics AI",
    "private AI",
    "private AI infrastructure",
  ],
  metadataBase: new URL("https://aiow.ai"),
  alternates: { canonical: "/", languages: { nl: "/", "nl-NL": "/", en: "/en", "x-default": "/" } },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://aiow.ai/",
    siteName: "AIOW",
    title: "AIOW — jouw persoonlijke AI-medewerker",
    description: "Persoonlijke AI-medewerkers voor Nederlandse ondernemers en teams — lokaal waar nodig, cloud waar het mag, met menselijke approvals.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handsomebstrd",
    title: "AIOW — jouw persoonlijke AI-medewerker",
    description: "Persoonlijke AI-medewerkers voor klantvragen, offertes, planning en administratie — veilig geïnstalleerd voor Nederlandse bedrijven.",
    images: ["/opengraph-image"],
  },
  authors: [{ name: "AIOW BV" }],
  creator: "AIOW BV",
  publisher: "AIOW BV",
  category: "AI-systemen, AI-automatisering, private AI",
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  other: {
    "aiow:legal-name": "AIOW BV",
    "aiow:kvk": "71887466",
    "aiow:address": "Bijlmermeerstraat 30, 2131HC Hoofddorp, Netherlands",
    "aiow:whatsapp": "+31 6 21 89 80 39",
    "aiow:contact-route": "WhatsApp primary; forms and analytics disabled until safely configured",
  },
};

export const viewport: Viewport = {
  themeColor: "#100904",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://aiow.ai/#organization",
  name: "AIOW",
  legalName: "AIOW BV",
  url: "https://aiow.ai/",
  logo: "https://aiow.ai/opengraph-image",
  image: "https://aiow.ai/opengraph-image",
  description: "AIOW installeert persoonlijke AI-medewerkers en veilige AI-werklagen voor Nederlandse bedrijven: klantvragen, offertes, planning, administratie, private/lokale AI, modelrouting, menselijke approvals en meetbare procesverbetering.",
  identifier: { "@type": "PropertyValue", propertyID: "KvK", value: "71887466" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bijlmermeerstraat 30",
    postalCode: "2131HC",
    addressLocality: "Hoofddorp",
    addressRegion: "Noord-Holland",
    addressCountry: "NL",
  },
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", telephone: "+31621898039", areaServed: "NL", availableLanguage: ["nl", "en"] }],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": "https://aiow.ai/#localbusiness",
  name: "AIOW BV",
  url: "https://aiow.ai/",
  image: "https://aiow.ai/opengraph-image",
  priceRange: "€€€",
  telephone: "+31621898039",
  areaServed: ["Nederland", "Amsterdam", "Rotterdam", "Utrecht", "Schiphol", "Haarlemmermeer", "Eindhoven", "Den Haag"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bijlmermeerstraat 30",
    postalCode: "2131HC",
    addressLocality: "Hoofddorp",
    addressRegion: "Noord-Holland",
    addressCountry: "NL",
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI-systeemscan", serviceType: "AI scan voor processen, data, privacygrenzen en quick wins" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Persoonlijke AI Starter", serviceType: "Persoonlijke AI-medewerker voor klantvragen, offertes, content, planning en administratie" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Private en lokale AI", serviceType: "Lokale/private AI, cloudmodelbeleid, approvals en governance" } }
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://aiow.ai/#website",
  name: "AIOW",
  url: "https://aiow.ai/",
  inLanguage: ["nl-NL", "en"],
  publisher: { "@id": "https://aiow.ai/#organization" },
  potentialAction: {
    "@type": "CommunicateAction",
    name: "Plan een AI-scan via WhatsApp",
    target: "https://wa.me/31621898039",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://aiow.ai/#ai-system-scan-service",
  name: "Persoonlijke AI-medewerker en AI-scan",
  provider: { "@id": "https://aiow.ai/#organization" },
  areaServed: "NL",
  serviceType: "Persoonlijke AI-medewerker, AI-installateur Nederland, AI-oplossingen voor bedrijven, AI-integratie, AI-automatisering, AI agents, private AI, lokale AI en AI governance",
  description: "AIOW is een Nederlandse AI-installateur die persoonlijke AI-medewerkers en veilige AI-werklagen installeert voor ondernemers en teams: klantvragen, offertes, planning, administratie, lokale/private AI en menselijke approvals.",
  audience: { "@type": "BusinessAudience", audienceType: "Nederlandse MKB-bedrijven en technische teams" },
  offers: { "@type": "Offer", url: "https://aiow.ai/#scan", availability: "https://schema.org/InStock", itemOffered: { "@type": "Service", name: "AI-systeemscan" } },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
