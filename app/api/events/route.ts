// /api/events?latest=6
//
// Returns a scrubbed feed of recent Debbie events.
// Strategy: if ~/debbie/logs/events.jsonl exists on the deployed server,
// stream the last N lines. Otherwise fall back to the static mock so the
// tile never looks broken.
//
// NOTE: On Vercel Edge the filesystem is ephemeral, so in practice the
// static mock will be served in prod until we wire the feed through a
// real backend (KV, Upstash, or an external webhook). For now: mock.

import { NextResponse } from "next/server";
import { debbieEventsMock } from "@/core/content/manifesto";

export const runtime = "edge";
export const revalidate = 8;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latest = Math.min(
    12,
    Math.max(1, Number(searchParams.get("latest") ?? 6)),
  );

  // Rotate through the mock so multiple hits feel alive.
  const offset = Math.floor(Date.now() / 8000) % debbieEventsMock.length;
  const rotated = [
    ...debbieEventsMock.slice(offset),
    ...debbieEventsMock.slice(0, offset),
  ].slice(0, latest);

  return NextResponse.json(
    {
      source: "mock",
      generatedAt: new Date().toISOString(),
      events: rotated,
    },
    {
      headers: {
        "cache-control": "public, s-maxage=8, stale-while-revalidate=30",
      },
    },
  );
}
