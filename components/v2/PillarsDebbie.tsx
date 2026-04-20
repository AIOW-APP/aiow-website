"use client";
/**
 * PillarsDebbie — 3 steps rewritten in first person as Debbie.
 */
import { motion } from "framer-motion";
import Image from "next/image";

const PILLARS = [
  {
    n: "01",
    title: "Ik leer je bedrijf kennen",
    subtitle: "Vijf minuten. Eén gesprek.",
    body: "Geen formulier, geen intake-meeting. We chatten. Ik vraag wat ertoe doet, analyseer met vier AI-modellen, en geef je drie concrete kansen. Gratis.",
    img: "/debbie/thinking.webp",
    accent: "#FFB820",
  },
  {
    n: "02",
    title: "We maken een plan",
    subtitle: "Twee uur, mensen, geen deck.",
    body: "Na de scan zetten we samen met mijn team prioriteiten. Wat nu, wat later, wat nooit. Eerlijk advies. Je betaalt alleen als je door wil.",
    img: "/debbie/pointing.webp",
    accent: "#FF4FD8",
  },
  {
    n: "03",
    title: "Ik zet het voor je neer",
    subtitle: "Van A tot Z geregeld.",
    body: "Workflow-automatisering, AI-agents, integraties. Mijn team bouwt, jij gebruikt. Vaste deadline, vaste prijs, volledig eigendom bij jou.",
    img: "/debbie/laptop.webp",
    accent: "#B845FF",
  },
];

export function PillarsDebbie() {
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
            · Zo werk ik
          </p>
          <h2 className="font-display font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}>
            Drie stappen.<br />Geen gedoe.
          </h2>
          <p className="mt-6 text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
            Ik ben AIOW's eerste autonome AI-partner. Mijn team van mensen backt me — maar de intake, analyse en het werk gebeuren grotendeels bij mij. Dat scheelt jou tijd, en scheelt ons overhead.
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
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10 group-hover:border-white/30 transition-colors">
                <Image src={p.img} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(180deg, transparent 30%, ${p.accent}22 75%, #0A0618 100%)`,
                }} />
                <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 rounded-full bg-black/60 backdrop-blur"
                  style={{ color: p.accent }}>
                  {p.n}
                </div>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mb-2 leading-[1.1]">
                {p.title}
              </h3>
              <p className="text-white/50 text-sm font-medium mb-3 italic">{p.subtitle}</p>
              <p className="text-white/60 text-sm md:text-base leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ManifestoDebbie() {
  return (
    <section
      className="relative py-32 md:py-48 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0618 0%,#1F0A3A 50%,#0A0618 100%)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{
        background: "radial-gradient(ellipse at 50% 50%, #FFB82030 0%, transparent 60%)",
      }} />
      <div className="container-wide relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820]/80 mb-8">
            · Waarom ik besta
          </p>
          <h2 className="font-display font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}>
            AI is geen project.<br />
            Het is <span className="bg-clip-text text-transparent italic"
              style={{ backgroundImage: "linear-gradient(120deg,#FFB820,#FF4FD8)" }}>infrastructuur</span>.
          </h2>
          <p className="mt-10 text-white/60 text-base md:text-lg leading-[1.7] max-w-2xl mx-auto">
            De bedrijven die vandaag investeren, compounden. Die wachten, raken achterop.
            Ik ben gebouwd om het drempel-verlagend te maken. Geen consultants. Geen jargon. Gewoon: praat met mij.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function FinalCtaDebbie() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0618 0%,#050210 100%)" }}>
      <div className="container-wide text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative w-32 h-40 mx-auto mb-8 rounded-2xl overflow-hidden border border-white/10">
            <Image src="/debbie/wave.webp" alt="Debbie waves" fill sizes="128px" className="object-cover" />
          </div>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            · Start vandaag
          </p>
          <h2 className="font-display font-medium text-white leading-[1.05] tracking-tight mb-10"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            Praat met mij.<br />Vijf minuten.
          </h2>
          <a href="#scan" className="inline-block px-9 py-4 rounded-full font-medium text-base tracking-wide"
            style={{
              background: "linear-gradient(135deg,#FFB820,#FF8A00)", color: "#14071F",
              boxShadow: "0 20px 60px rgba(255,184,32,0.35)",
            }}>
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
