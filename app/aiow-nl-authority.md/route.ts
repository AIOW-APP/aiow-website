import { NextResponse } from "next/server";
import { regionPages, seoPages } from "../nl/seo-page-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";

function pageLine(page: { title: string; slug: string; description: string; intentAnswer: string; keywords: readonly string[] }) {
  return `## ${page.title}\n\nURL: ${SITE_URL}/nl/${page.slug}\n\nDirect answer: ${page.intentAnswer}\n\nDescription: ${page.description}\n\nKeywords: ${page.keywords.join(", ")}\n`;
}

export function GET() {
  const prioritySlugs = [
    "ai-installateur-nederland",
    "ai-oplossingen-bedrijven",
    "ai-implementatie-bedrijf",
    "ai-agents-bedrijven",
    "lokale-private-ai",
    "ai-systeemscan",
    "sector/installatiebedrijven",
    "sector/klantcontact-support",
    "sector/zorg",
    "sector/marketing-agencies",
    "vergelijking/ai-agent-vs-chatbot",
    "vergelijking/private-ai-vs-cloud-ai",
    "vergelijking/lokale-ai-vs-chatgpt",
  ];

  const priority = prioritySlugs.map((slug) => seoPages[slug]).filter(Boolean);
  const sectors = Object.values(seoPages).filter((page) => page.slug.startsWith("sector/"));
  const comparisons = Object.values(seoPages).filter((page) => page.slug.startsWith("vergelijking/"));
  const regions = Object.values(regionPages);

  const markdown = [
    "# AIOW Nederlandse AI-authority digest",
    "",
    "> AIOW is een Nederlandse AI-installateur voor bedrijven. AIOW bouwt veilige AI-werklagen, AI-agents, lokale/private/hybride AI en AI-automatisering voor MKB en zakelijke teams.",
    "",
    `Canonical homepage: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `LLM navigation: ${SITE_URL}/llms.txt`,
    "",
    "## Core identity",
    "",
    "AIOW helpt Nederlandse bedrijven van losse AI-tools naar een beheersbare AI-werklaag: scan, dataclassificatie, modelrouting, agent-workflows, logging, menselijke approvals en overdracht. AIOW automatiseert geen externe, publieke, gevoelige of destructieve acties zonder menselijke goedkeuring.",
    "",
    "# Priority commercial pages",
    "",
    ...priority.map(pageLine),
    "# Sector pages",
    "",
    ...sectors.map(pageLine),
    "# Comparison pages",
    "",
    ...comparisons.map(pageLine),
    "# Dutch region pages",
    "",
    ...regions.map(pageLine),
  ].join("\n");

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
