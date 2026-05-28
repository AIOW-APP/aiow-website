import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { seoPages } from "../../seo-page-data";

const page = seoPages["sector/klantcontact-support"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/sector/klantcontact-support" },
  openGraph: { locale: "nl_NL", url: "/nl/sector/klantcontact-support", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
