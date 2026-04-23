import { notFound } from "next/navigation";
import RoomV11 from "@/components/v11/RoomV11";
import AmbientAudio from "@/components/v11/AmbientAudio";
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
    title: room ? `${room.title} — ${cap?.label} — AIOW` : "AIOW",
    description: room?.subtitle,
  };
}

export default async function RoomPage({ params }: { params: Promise<{ capability: string; room: string }> }) {
  const { capability, room: roomId } = await params;
  const cap = getCapability(capability);
  const room = getRoom(capability, roomId);
  if (!cap || !room) notFound();
  return (
    <>
      <RoomV11 cap={cap} room={room} />
      <AmbientAudio src="/audio/ambient-room.mp3" />
    </>
  );
}
