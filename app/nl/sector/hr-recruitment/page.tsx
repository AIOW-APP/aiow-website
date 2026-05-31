import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { seoPages } from "../../seo-page-data";

const page = seoPages["sector/hr-recruitment"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/sector/hr-recruitment" },
  openGraph: { locale: "nl_NL", url: "/nl/sector/hr-recruitment", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
