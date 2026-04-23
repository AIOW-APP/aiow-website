import { notFound } from "next/navigation";
import { LangProvider } from "@/components/v12/LangContext";
import RoomV12 from "@/components/v12/RoomV12";
import AmbientAudio from "@/components/v12/AmbientAudio";
import { CAPABILITIES, getCapability, getRoom } from "@/core/content/capabilities";

export function generateStaticParams() {
  const out: { capability: string; room: string }[] = [];
  for (const c of CAPABILITIES) for (const r of c.rooms) out.push({ capability: c.id, room: r.id });
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ capability: string; room: string }> }) {
  const { capability, room: roomId } = await params;
  const room = getRoom(capability, roomId);
  const cap = getCapability(capability);
  return {
    title: room ? `${room.title.nl} — ${cap?.label.nl} — AIOW` : "AIOW",
    description: room?.subtitle.nl,
  };
}

export default async function RoomPage({ params }: { params: Promise<{ capability: string; room: string }> }) {
  const { capability, room: roomId } = await params;
  const cap = getCapability(capability);
  const room = getRoom(capability, roomId);
  if (!cap || !room) notFound();
  return (
    <LangProvider>
      <RoomV12 cap={cap} room={room} />
      <AmbientAudio src="/audio/ambient-room.mp3" />
    </LangProvider>
  );
}
