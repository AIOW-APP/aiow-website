import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["ai-oplossingen-bedrijven"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/ai-oplossingen-bedrijven" },
  openGraph: { locale: "nl_NL", url: "/nl/ai-oplossingen-bedrijven", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
