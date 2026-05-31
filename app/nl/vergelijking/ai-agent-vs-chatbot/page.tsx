import type { Metadata } from "next";
import { SeoLandingPage } from "../../SeoLandingPage";
import { seoPages } from "../../seo-page-data";

const page = seoPages["vergelijking/ai-agent-vs-chatbot"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/nl/vergelijking/ai-agent-vs-chatbot" },
  openGraph: { locale: "nl_NL", url: "/nl/vergelijking/ai-agent-vs-chatbot", title: page.title, description: page.description },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
