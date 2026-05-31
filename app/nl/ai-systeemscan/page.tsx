import type { Metadata } from "next";
import { SeoLandingPage } from "../SeoLandingPage";
import { seoPages } from "../seo-page-data";

const page = seoPages["ai-systeemscan"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/ai-systeemscan" },
  openGraph: { locale: "nl_NL", url: "/nl/ai-systeemscan", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
