import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["ai-implementatie-bedrijf"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/ai-implementatie-bedrijf" },
  openGraph: { locale: "nl_NL", url: "/nl/ai-implementatie-bedrijf", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
