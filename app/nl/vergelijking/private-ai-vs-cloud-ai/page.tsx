import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { seoPages } from "../../seo-page-data";

const page = seoPages["vergelijking/private-ai-vs-cloud-ai"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/vergelijking/private-ai-vs-cloud-ai" },
  openGraph: { locale: "nl_NL", url: "/nl/vergelijking/private-ai-vs-cloud-ai", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
