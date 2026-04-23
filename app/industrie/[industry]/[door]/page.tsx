import { notFound } from "next/navigation";
import { RoomV10 } from "@/components/v10/RoomV10";
import { Cursor, SmoothScroll } from "@/components/v2/ExperienceLayer";
import { getIndustry, getDoor, INDUSTRIES } from "@/core/content/industries";
import type { Metadata } from "next";

export function generateStaticParams() {
  return INDUSTRIES.flatMap((i) =>
    i.doors.map((d) => ({ industry: i.id, door: d.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string; door: string }>;
}): Promise<Metadata> {
  const { industry, door } = await params;
  const ind = getIndustry(industry);
  const d = getDoor(industry, door);
  if (!ind || !d) return {};
  return {
    title: `${d.title} — AIOW voor ${ind.label}`,
    description: d.tagline,
  };
}

export default async function DoorPage({
  params,
}: {
  params: Promise<{ industry: string; door: string }>;
}) {
  const { industry, door } = await params;
  const ind = getIndustry(industry);
  const d = getDoor(industry, door);
  if (!ind || !d) notFound();
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <main className="relative">
        <RoomV10 industry={ind} door={d} />
      </main>
    </>
  );
}
