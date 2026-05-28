import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["lokale-private-ai"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/lokale-private-ai" },
  openGraph: { locale: "nl_NL", url: "/nl/lokale-private-ai", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
