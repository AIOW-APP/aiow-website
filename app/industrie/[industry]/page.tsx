import { notFound } from "next/navigation";
import { BuildingV10 } from "@/components/v10/BuildingV10";
import { Cursor, SmoothScroll } from "@/components/v2/ExperienceLayer";
import { getIndustry, INDUSTRIES } from "@/core/content/industries";
import type { Metadata } from "next";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const ind = getIndustry(industry);
  if (!ind) return {};
  return {
    title: `${ind.buildingName} — AIOW voor ${ind.label}`,
    description: ind.buildingTagline,
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const ind = getIndustry(industry);
  if (!ind) notFound();
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <main className="relative">
        <BuildingV10 industry={ind} />
      </main>
    </>
  );
}
