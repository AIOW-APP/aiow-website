import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { regionPages } from "../../seo-page-data";

const page = regionPages["schiphol-haarlemmermeer"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/regio/schiphol-haarlemmermeer" },
  openGraph: { locale: "nl_NL", url: "/nl/regio/schiphol-haarlemmermeer", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
