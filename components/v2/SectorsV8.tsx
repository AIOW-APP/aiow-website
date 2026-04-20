"use client";
/**
 * SectorsV8 — marquee + hover-tilt cards grid. Real results.
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const SECTORS = [
  { name: "Accountancy",   desc: "Boekhouding, fiscaal, administratie",  metric: "47%", label: "sneller factureren" },
  { name: "Juridisch",     desc: "Advocatuur, notariaat",                 metric: "3×",  label: "snellere contract-review" },
  { name: "Bouw",          desc: "Aannemers, installateurs",              metric: "€4.2k", label: "per maand per team" },
  { name: "Horeca",        desc: "Cafés, restaurants, hotels",            metric: "2u",  label: "per dag minder admin" },
  { name: "Productie",     desc: "Maakindustrie, logistiek",              metric: "18%", label: "minder voorraadfouten" },
  { name: "Dienstverlening", desc: "Consultancy, marketing, HR",          metric: "5×",  label: "meer leads uit content" },
];

function TiltCard({ s, i }: { s: (typeof SECTORS)[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -8, y: (px - 0.5) * 8 });
  }
  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor
      className="group relative p-8 md:p-10 cursor-pointer min-h-[280px] flex flex-col justify-between"
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors"
        style={{
          background: "linear-gradient(145deg, rgba(20,7,31,0.8) 0%, rgba(10,6,24,0.4) 100%)",
          backdropFilter: "blur(10px)",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), border-color 0.3s",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,184,32,0.1) 0%, transparent 40%, rgba(255,79,216,0.1) 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
            0{i + 1}
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mb-2 leading-[1.1]">
            {s.name}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFB820] mb-1">
              · Gedaan
            </p>
            <p className="text-white text-xs tracking-wider">{s.label}</p>
          </div>
          <div
            className="font-display text-4xl md:text-5xl font-medium tracking-tight"
            style={{
              background: "linear-gradient(135deg,#FFB820,#FF4FD8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {s.metric}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SectorsV8() {
  return (
    <section id="sectors" className="relative py-28 md:py-40" style={{ zIndex: 10 }}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#FFB820]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#FFB820]">
              · Sectoren
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Niet theoretisch.<br />
            <span className="italic text-white/50">Gewoon gedaan.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {SECTORS.map((s, i) => (
            <TiltCard key={s.name} s={s} i={i} />
          ))}
        </div>
      </div>

      {/* Metrics marquee */}
      <div className="mt-24 md:mt-32 border-y border-white/10 py-6 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...SECTORS, ...SECTORS].map((s, i) => (
            <span
              key={i}
              className="font-display text-xl md:text-3xl text-white/40 font-medium tracking-tight"
            >
              <span className="text-[#FFB820]">{s.metric}</span> {s.label}
              <span className="mx-8 text-white/20">·</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
