import { notFound } from "next/navigation";
import BuildingV11 from "@/components/v11/BuildingV11";
import AmbientAudio from "@/components/v11/AmbientAudio";
import { CAPABILITIES, getCapability } from "@/core/content/capabilities";

export function generateStaticParams() {
  return CAPABILITIES.map((c) => ({ capability: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ capability: string }> }) {
  const { capability } = await params;
  const cap = getCapability(capability);
  return {
    title: cap ? `${cap.label} — AIOW` : "AIOW",
    description: cap?.tagline,
  };
}

export default async function CapabilityPage({ params }: { params: Promise<{ capability: string }> }) {
  const { capability } = await params;
  const cap = getCapability(capability);
  if (!cap) notFound();
  return (
    <>
      <BuildingV11 cap={cap} />
      <AmbientAudio src="/audio/ambient-building.mp3" />
    </>
  );
}
