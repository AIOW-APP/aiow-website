import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "AIOW, AI venture & growth partner",
    template: "%s · AIOW",
  },
  description:
    "AIOW.ai bouwt AI, software, automatisering, marketing en digitale groeisystemen in startups en gevestigde bedrijven via private intake, AI Deal Card, contract, projectgroep met Spunky en resultaatgedreven samenwerking.",
  keywords: [
    "AIOW",
    "AI venture studio",
    "AI growth partner",
    "AI voor startups",
    "AI voor bedrijven",
    "AI softwareontwikkeling",
    "AI automatisering Nederland",
    "AI revenue share",
    "AI agents bedrijven",
    "AI implementatie Nederland",
    "AI platform bouwen",
    "AI marketing automation",
    "private AI intake",
    "venture builder AI",
    "digitale groeipartner",
  ],
  metadataBase: new URL("https://aiow.ai"),
  alternates: { canonical: "/", languages: { nl: "/", "nl-NL": "/", en: "/en", "x-default": "/" } },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://aiow.ai/",
    siteName: "AIOW",
    title: "AIOW, AI venture & growth partner",
    description: "AIOW bouwt AI, software, automatisering en growth in startups en gevestigde bedrijven met private intake, Deal Card, contract en resultaatgedreven samenwerking.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handsomebstrd",
    title: "AIOW, AI venture & growth partner",
    description: "AI, software, automatisering, marketing en digitale groeisystemen voor startups en gevestigde bedrijven.",
    images: ["/opengraph-image"],
  },
  authors: [{ name: "AIOW BV" }],
  creator: "AIOW BV",
  publisher: "AIOW BV",
  category: "AI venture studio, AI growth, softwareontwikkeling, automatisering",
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  other: {
    "aiow:legal-name": "AIOW BV",
    "aiow:kvk": "71887466",
    "aiow:address": "Bijlmermeerstraat 30, 2131HC Hoofddorp, Netherlands",
    "aiow:whatsapp": "+31 6 21 89 80 39",
    "aiow:email": "info@aiow.ai",
    "aiow:contact-route": "WhatsApp primary; private intake route for venture/growth inquiries",
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
  description: "AIOW is een AI-gedreven venture & growth partner die AI, software, automatisering, marketing en digitale groeisystemen bouwt voor startups en gevestigde bedrijven.",
  identifier: { "@type": "PropertyValue", propertyID: "KvK", value: "71887466" },
  email: "info@aiow.ai",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bijlmermeerstraat 30",
    postalCode: "2131HC",
    addressLocality: "Hoofddorp",
    addressRegion: "Noord-Holland",
    addressCountry: "NL",
  },
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", telephone: "+316****8039", email: "info@aiow.ai", areaServed: "NL", availableLanguage: ["nl", "en"] }],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": "https://aiow.ai/#localbusiness",
  name: "AIOW BV",
  url: "https://aiow.ai/",
  image: "https://aiow.ai/opengraph-image",
  priceRange: "€€€",
  telephone: "+316****8039",
  email: "info@aiow.ai",
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
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Private Venture Intake", serviceType: "AI due diligence, Deal Card en venture/growth advies" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Platform Build", serviceType: "Software, agents, automatisering, dashboards en klantportalen" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Growth Partner", serviceType: "AI, marketing automation, KPI-sturing en resultaatgedreven groei" } }
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
    name: "Start private intake via WhatsApp",
    target: "https://wa.me/31621898039",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://aiow.ai/#ai-venture-growth-service",
  name: "AI venture & growth partner",
  provider: { "@id": "https://aiow.ai/#organization" },
  areaServed: "NL",
  serviceType: "AI venture studio, AI growth partner, softwareontwikkeling, AI automatisering, AI agents, marketing automation, private venture intake en Deal Card",
  description: "AIOW helpt startups en gevestigde bedrijven groeien door AI, software, automatisering, marketing en digitale strategie te bouwen en mee te sturen op resultaat.",
  audience: { "@type": "BusinessAudience", audienceType: "Founders, startups, ondernemers en gevestigde bedrijven" },
  offers: { "@type": "Offer", url: "https://aiow.ai/#scan", availability: "https://schema.org/InStock", itemOffered: { "@type": "Service", name: "Private Venture Intake" } },
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
