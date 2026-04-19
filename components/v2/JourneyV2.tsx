"use client";
/**
 * JourneyV2 — running Spunky through 5 transformation steps with GSAP pinned scroll.
 */
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STEPS = [
  { n: "01", title: "Ontdekken", desc: "Gratis AI-scan van je bedrijf. Spunky analyseert je werkprocessen, vindbaarheid, social media en documenten.", color: "#B845FF" },
  { n: "02", title: "Plannen", desc: "We prioriteren 3 AI-kansen met de hoogste impact × haalbaarheid voor jouw situatie.", color: "#FF4FD8" },
  { n: "03", title: "Bouwen", desc: "Onze agents bouwen de AI-oplossingen. Tools, integraties, workflows — van A tot Z geregeld.", color: "#FFB820" },
  { n: "04", title: "Leren", desc: "Jouw team krijgt 1-op-1 training. AI wordt onderdeel van de dagelijkse praktijk.", color: "#FF8A00" },
  { n: "05", title: "Schalen", desc: "Volgende set optimalisaties. Het systeem wordt elke maand slimmer.", color: "#B845FF" },
];

export function JourneyV2() {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const total = STEPS.length;
      const trackWidth = (total - 1) * 100;
      gsap.to(track.current, {
        xPercent: -trackWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=${total * 80}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" ref={container} className="relative h-screen overflow-hidden bg-[#0A0618]">
      <div className="absolute inset-0 opacity-30" style={{
        background: "radial-gradient(ellipse at 50% 50%, #2A0D4F 0%, transparent 70%)",
      }} />

      <div className="absolute top-10 left-0 right-0 z-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-3">— De reis</p>
        <h2 className="font-display text-white/95 text-3xl md:text-4xl font-medium tracking-tight">
          Van vraag naar AI-oplossing in 5 stappen
        </h2>
      </div>

      <div ref={track} className="flex h-full w-[500vw] items-center pt-24">
        {STEPS.map((s, i) => (
          <div key={s.n} className="w-screen h-full flex items-center justify-center px-6">
            <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span
                    className="font-mono text-6xl md:text-7xl font-bold"
                    style={{ color: s.color, textShadow: `0 0 40px ${s.color}88` }}
                  >
                    {s.n}
                  </span>
                  <div className="h-px flex-1 opacity-30" style={{ background: s.color }} />
                </div>
                <h3 className="font-display text-4xl md:text-5xl text-white font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="text-white/70 text-lg leading-relaxed max-w-md">
                  {s.desc}
                </p>
              </div>
              <div className="relative aspect-square max-w-md mx-auto w-full">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-40"
                  style={{ background: s.color }}
                />
                <Image
                  src={i % 2 === 0 ? "/spunky/spunky-running.webp" : "/spunky/spunky-thinking.webp"}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 400px"
                  className="object-contain relative z-10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
