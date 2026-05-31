import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["veiligheid-governance-ai"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/veiligheid-governance-ai" },
  openGraph: { locale: "nl_NL", url: "/nl/veiligheid-governance-ai", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
