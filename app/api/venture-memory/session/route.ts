import { NextResponse } from "next/server";
import { aiowDurableStoreMode } from "@/lib/aiow-durable-store";
import { buildVentureCanvasSnapshot, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = clamp(url.searchParams.get("sessionId") || "", 160);
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const events = await listVentureMemoryEvents(sessionId, 120);
    const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
    const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
    const dealCardEvent = [...events].reverse().find((event) => event.type === "deal_card");
    const dealCard = parseJson(dealCardEvent?.content);

    return NextResponse.json({
      ok: true,
      storageMode: aiowDurableStoreMode(),
      memorySessionId: sessionId,
      canvas,
      ventureSnapshot: canvas,
      dealCard,
      events: events.slice(-40).map((event) => ({
        id: event.id,
        role: event.role,
        type: event.type,
        content: event.content,
        createdAt: event.createdAt,
        retention: event.retention,
        hasCanvas: Boolean(event.canvas),
      })),
    });
  } catch (error) {
    console.error("[venture-memory/session] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function parseJson(value?: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
