"use client";
/**
 * PillarsV3 — replaces Problem + Moment with editorial "Approach" + 3 pillars.
 * No Spunky. Pro typography.
 */
import { motion } from "framer-motion";

const PILLARS = [
  {
    n: "01",
    title: "Scan",
    subtitle: "Van nul naar inzicht in 5 minuten",
    body: "Een gesprek met onze AI. Geen formulier. Aan het einde krijg je drie concrete kansen waar je morgen mee aan de slag kunt — inclusief geschatte impact.",
    accent: "#FFB820",
  },
  {
    n: "02",
    title: "Strategie",
    subtitle: "2-uur sessie met mensen, geen deck",
    body: "We vertalen de scan naar een prioriteitenlijst. Wat nu, wat later, wat nooit. Geen consultancy-pitch — alleen wat je bedrijf écht nodig heeft.",
    accent: "#FF4FD8",
  },
  {
    n: "03",
    title: "Implementatie",
    subtitle: "Van A tot Z geregeld",
    body: "Workflow-automatisering, AI-agents, proces-integraties. Wij bouwen, jij gebruikt. Vast tarief, vaste deadline, volledig eigendom bij jou.",
    accent: "#B845FF",
  },
];

export function PillarsV3() {
  return (
    <section
      id="approach"
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0618 0%,#140A24 50%,#0A0618 100%)" }}
    >
      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mb-20 md:mb-28"
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            · Onze aanpak
          </p>
          <h2
            className="font-display font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Drie stappen.<br />
            Geen gedoe.
          </h2>
          <p className="mt-6 text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
            AI-transformatie die werkt voor een bakkerij, een bouwbedrijf en een advocatenkantoor.
            Geen abstracties. Geen 80-pagina roadmaps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative"
            >
              {/* Accent line */}
              <div
                className="w-full h-px mb-8 origin-left transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: `linear-gradient(90deg, ${p.accent} 0%, transparent 100%)` }}
              />
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: p.accent }}>
                {p.n} · {p.title}
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mb-4 leading-[1.1]">
                {p.subtitle}
              </h3>
              <p className="text-white/55 text-sm md:text-base leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ManifestoV3() {
  return (
    <section
      className="relative py-32 md:py-48 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0618 0%,#1F0A3A 50%,#0A0618 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse at 50% 50%, #FFB82030 0%, transparent 60%)" }}
      />
      <div className="container-wide relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820]/80 mb-8">
            · Manifest
          </p>
          <h2
            className="font-display font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}
          >
            AI is geen project.<br />
            Het is <span
              className="bg-clip-text text-transparent italic"
              style={{ backgroundImage: "linear-gradient(120deg,#FFB820,#FF4FD8)" }}
            >
              infrastructuur
            </span>.
          </h2>
          <p className="mt-10 text-white/60 text-base md:text-lg leading-[1.7] max-w-2xl mx-auto">
            De bedrijven die vandaag investeren, compounden. De bedrijven die wachten, raken achterop.
            Wij bouwen de fundering. Jij groeit erop.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function FinalCtaV3() {
  return (
    <section
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0618 0%,#050210 100%)" }}
    >
      <div className="container-wide text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-2xl mx-auto"
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            · Start vandaag
          </p>
          <h2
            className="font-display font-medium text-white leading-[1.05] tracking-tight mb-10"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Vijf minuten.<br />Drie kansen.
          </h2>
          <a
            href="#scan"
            className="inline-block px-9 py-4 rounded-full font-medium text-base tracking-wide"
            style={{
              background: "linear-gradient(135deg,#FFB820,#FF8A00)",
              color: "#14071F",
              boxShadow: "0 20px 60px rgba(255,184,32,0.35)",
            }}
          >
            Start de AI-scan →
          </a>
          <p className="text-white/35 text-xs mt-6 font-mono tracking-[0.2em] uppercase">
            Gratis · Lokaal verwerkt · Geen verplichtingen
          </p>
        </motion.div>
      </div>
    </section>
  );
}
