"use client";
/**
 * PillarsV8 — sticky parallax pillars. Each pillar has a huge number that
 * scrolls in sync with the copy. GSAP ScrollTrigger ties them together.
 */
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PILLARS = [
  {
    n: "01",
    label: "Scan",
    title: "Ik leer je bedrijf kennen",
    body: "Vijf minuten chat. Ik vraag wat ertoe doet, analyseer met vier AI-modellen op onze eigen machines, en geef je drie concrete kansen die morgen al waarde leveren. Gratis.",
    metric: "5 min",
    sub: "gemiddelde scan",
    accent: "#FFB820",
  },
  {
    n: "02",
    label: "Strategie",
    title: "We maken een scherp plan",
    body: "Na de scan sessie met mijn team van specialisten. Wat nu, wat later, wat nooit. Eerlijk advies zonder hidden agenda — je betaalt alleen als je door wil.",
    metric: "2 uur",
    sub: "strategie-call",
    accent: "#FF4FD8",
  },
  {
    n: "03",
    label: "Implementatie",
    title: "Ik zet het voor je neer",
    body: "Workflow-automatisering, AI-agents, integraties. Wij bouwen, jij gebruikt. Vaste deadline, vaste prijs, volledig eigendom bij jou. Support de eerste 90 dagen inbegrepen.",
    metric: "90 dgn",
    sub: "support inbegrepen",
    accent: "#B845FF",
  },
];

function Pillar({ p, idx }: { p: (typeof PILLARS)[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center py-20"
    >
      <div className="container-wide w-full grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Huge number */}
        <motion.div style={{ y, opacity }} className="relative">
          <div
            className="font-display font-medium leading-[0.8] tracking-tighter select-none"
            style={{
              fontSize: "clamp(8rem, 22vw, 22rem)",
              background: `linear-gradient(180deg, ${p.accent} 0%, ${p.accent}33 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
            }}
          >
            {p.n}
          </div>
          <div
            className="absolute inset-0 font-display font-medium leading-[0.8] tracking-tighter select-none"
            style={{
              fontSize: "clamp(8rem, 22vw, 22rem)",
              color: "transparent",
              WebkitTextStroke: `1px ${p.accent}50`,
              transform: "translate(6px, 6px)",
              zIndex: -1,
            }}
          >
            {p.n}
          </div>

          <div className="mt-8 md:mt-10 pl-2 border-l-2" style={{ borderColor: p.accent }}>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.35em] mb-2 pl-4"
              style={{ color: p.accent }}
            >
              · {p.label}
            </p>
            <p className="font-display text-5xl md:text-6xl text-white font-medium tracking-tight pl-4 leading-none">
              {p.metric}
            </p>
            <p className="font-mono text-xs text-white/40 tracking-wider uppercase pl-4 mt-2">
              {p.sub}
            </p>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div style={{ opacity }}>
          <h3
            className="font-display font-medium text-white tracking-tight leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            {p.title}
          </h3>
          <p className="text-white/65 text-lg leading-relaxed max-w-lg">{p.body}</p>
        </motion.div>
      </div>
    </div>
  );
}

export function PillarsV8() {
  return (
    <section id="approach" className="relative" style={{ zIndex: 10 }}>
      {/* Section header */}
      <div className="container-wide py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#FFB820]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#FFB820]">
              · Zo werk ik
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Drie stappen.<br />
            <span className="italic text-white/50">Zonder gedoe.</span>
          </h2>
        </motion.div>
      </div>

      {PILLARS.map((p, i) => (
        <Pillar key={p.n} p={p} idx={i} />
      ))}
    </section>
  );
}
