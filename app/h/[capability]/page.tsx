import { notFound } from "next/navigation";
import { LangProvider } from "@/components/v12/LangContext";
import BuildingV12 from "@/components/v12/BuildingV12";
import AmbientAudio from "@/components/v12/AmbientAudio";
import { CAPABILITIES, getCapability } from "@/core/content/capabilities";

export function generateStaticParams() {
  return CAPABILITIES.map((c) => ({ capability: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ capability: string }> }) {
  const { capability } = await params;
  const cap = getCapability(capability);
  return {
    title: cap ? `${cap.label.nl} — AIOW` : "AIOW",
    description: cap?.tagline.nl,
  };
}

export default async function CapabilityPage({ params }: { params: Promise<{ capability: string }> }) {
  const { capability } = await params;
  const cap = getCapability(capability);
  if (!cap) notFound();
  return (
    <LangProvider>
      <BuildingV12 cap={cap} />
      <AmbientAudio src="/audio/ambient-building.mp3" />
    </LangProvider>
  );
}
