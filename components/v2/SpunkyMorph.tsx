"use client";
/**
 * SpunkyMorph — scroll-triggered cross-fade between Spunky color states.
 * Four color phases driven by scroll position: purple → cyan → gold → pink.
 */
import { useEffect, useRef } from "react";
import Image from "next/image";

const PHASES = ["purple", "cyan", "gold", "pink"] as const;

export function SpunkyMorph() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!wrap.current) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      // 4 phases: [0-0.25]=purple, [0.25-0.5]=cyan, [0.5-0.75]=gold, [0.75-1]=pink
      const scaled = p * (PHASES.length - 1);
      const idx = Math.floor(scaled);
      const frac = scaled - idx;
      const imgs = wrap.current.querySelectorAll<HTMLElement>("[data-phase]");
      imgs.forEach((el) => {
        const phase = Number(el.dataset.phase);
        let op = 0;
        if (phase === idx) op = 1 - frac;
        else if (phase === idx + 1) op = frac;
        el.style.opacity = String(op);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrap}
      className="fixed bottom-6 right-6 w-28 h-28 md:w-36 md:h-36 z-40 pointer-events-none select-none"
      aria-hidden
    >
      {PHASES.map((p, i) => (
        <div
          key={p}
          data-phase={i}
          className="absolute inset-0 transition-opacity duration-150"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <Image
            src={`/spunky/spunky-color-${p}.webp`}
            alt="Spunky"
            fill
            sizes="144px"
            className="object-contain drop-shadow-[0_0_20px_rgba(255,75,216,0.35)]"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
