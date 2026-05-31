import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["ai-automatisering-logistiek-transport"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/ai-automatisering-logistiek-transport" },
  openGraph: { locale: "nl_NL", url: "/nl/ai-automatisering-logistiek-transport", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
