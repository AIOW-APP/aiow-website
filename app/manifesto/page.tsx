import type { Metadata } from "next";
import { ManifestoHero } from "@/components/manifesto/ManifestoHero";
import { Principles } from "@/components/manifesto/Principles";
import { DebbieEventsTile } from "@/components/manifesto/DebbieEventsTile";
import { Projects } from "@/components/manifesto/Projects";
import { Technical } from "@/components/manifesto/Technical";
import { FooterCta } from "@/components/manifesto/FooterCta";

export const metadata: Metadata = {
  title: "AIOW — Manifesto",
  description:
    "Six projects. One intelligence. Built in public. AIOW is the orchestration layer Team Handsome runs on.",
  openGraph: {
    title: "AIOW — Manifesto",
    description:
      "Six projects. One intelligence. Built in public.",
    url: "https://aiow.ai/manifesto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIOW — Manifesto",
    description: "Six projects. One intelligence. Built in public.",
  },
};

export default function ManifestoPage() {
  return (
    <main className="relative bg-[#0a0a0a] text-white">
      <ManifestoHero />
      <Principles />
      <DebbieEventsTile />
      <Projects />
      <Technical />
      <FooterCta />
    </main>
  );
}
