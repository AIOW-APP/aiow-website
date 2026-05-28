import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { regionPages } from "../../seo-page-data";

const page = regionPages["nijmegen"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/regio/nijmegen" },
  openGraph: { locale: "nl_NL", url: "/nl/regio/nijmegen", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
