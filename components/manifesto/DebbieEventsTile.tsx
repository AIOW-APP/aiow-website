"use client";
/**
 * DebbieEventsTile — the live hero differentiator.
 *
 * Fetches /api/events?latest=6, fades items in, rotates every 8s.
 * Graceful fallback: if fetch fails, uses the inlined mock so the tile
 * is never empty.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debbieEventsMock, debbieTileCopy } from "@/core/content/manifesto";

type Event = {
  ts: string;
  kind: string;
  subject: string;
  result: string;
};

const ROTATE_MS = 8000;

export function DebbieEventsTile() {
  const [events, setEvents] = useState<Event[]>(
    debbieEventsMock.slice(0, 6) as unknown as Event[],
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`/api/events?latest=6&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { events: Event[] };
        if (!cancelled && Array.isArray(j.events) && j.events.length > 0) {
          setEvents(j.events);
        }
      } catch {
        // keep mock
      }
    }
    load();
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      load();
    }, ROTATE_MS);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <section
      id="debbie"
      className="relative py-24 md:py-36"
      style={{ zIndex: 10 }}
    >
      <div className="container-wide">
        <div className="max-w-2xl mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              {debbieTileCopy.eyebrow}
            </p>
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent,#C6FF3D)] animate-pulse"
              aria-hidden
            />
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {debbieTileCopy.title}
          </h2>
          <p className="mt-5 text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
            {debbieTileCopy.sub}
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* terminal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            <span>debbie · events.jsonl</span>
            <span>latest 6 · refresh 8s</span>
          </div>

          <ul className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {events.map((e, i) => (
                <motion.li
                  key={`${tick}-${i}-${e.ts}-${e.subject}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                  className="grid grid-cols-[auto_auto_1fr_auto] gap-4 md:gap-6 items-center px-5 py-4 font-mono text-xs md:text-sm"
                >
                  <span className="text-white/35 tabular-nums">{e.ts}</span>
                  <span className="text-[var(--color-accent,#C6FF3D)] uppercase tracking-[0.15em] text-[10px] md:text-[11px] min-w-[120px]">
                    {e.kind}
                  </span>
                  <span className="text-white/80 truncate">{e.subject}</span>
                  <span className="text-white/50 text-right truncate max-w-[40ch]">
                    → {e.result}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="px-5 py-3 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
            scrubbed · public-safe · not every event is shown
          </div>
        </div>
      </div>
    </section>
  );
}
