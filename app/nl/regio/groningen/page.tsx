import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { regionPages } from "../../seo-page-data";

const page = regionPages["groningen"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/regio/groningen" },
  openGraph: { locale: "nl_NL", url: "/nl/regio/groningen", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
