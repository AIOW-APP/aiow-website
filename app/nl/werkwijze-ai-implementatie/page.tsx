import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["werkwijze-ai-implementatie"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/werkwijze-ai-implementatie" },
  openGraph: { locale: "nl_NL", url: "/nl/werkwijze-ai-implementatie", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
