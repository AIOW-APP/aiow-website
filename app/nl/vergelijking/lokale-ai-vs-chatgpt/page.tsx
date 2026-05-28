import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { seoPages } from "../../seo-page-data";

const page = seoPages["vergelijking/lokale-ai-vs-chatgpt"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/vergelijking/lokale-ai-vs-chatgpt" },
  openGraph: { locale: "nl_NL", url: "/nl/vergelijking/lokale-ai-vs-chatgpt", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
