"use client";
/**
 * StoryV2 — Problem + Moment sections, Spunky-driven narrative.
 */
import { motion } from "framer-motion";
import Image from "next/image";

export function ProblemV2() {
  return (
    <section className="relative py-28 md:py-40 bg-[#0A0618] overflow-hidden">
      <div className="container-wide grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF4FD8] mb-6">
            — Het probleem
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05] mb-8">
            Je bent <span className="italic text-[#FF4FD8]">moe</span><br />
            van alles zelf doen.
          </h2>
          <div className="flex flex-col gap-4 text-white/70 text-lg leading-relaxed">
            <p>Email stapelt zich op. Offertes liggen te wachten. Je agenda explodeert.</p>
            <p>Je <strong className="text-white">weet</strong> dat AI kan helpen. Maar waar begin je?</p>
            <p className="text-white/50 italic">Elke dag die je wacht, word je bedrijf inefficiënter.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1 }}
          className="relative aspect-square max-w-md mx-auto w-full"
        >
          <div className="absolute inset-0 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, #FF4FD8 0%, transparent 70%)" }} />
          <Image
            src="/spunky/spunky-thinking.webp"
            alt="Spunky thinking"
            fill
            sizes="(max-width: 768px) 80vw, 400px"
            className="object-contain relative z-10 drop-shadow-[0_30px_60px_rgba(255,79,216,0.4)]"
          />
        </motion.div>
      </div>
    </section>
  );
}

export function MomentV2() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A0618 0%, #2A0D4F 50%, #0A0618 100%)",
      }}
    >
      <div className="container-wide text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-6">
            — Het moment
          </p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-[0.95] mb-10">
            Wat als je<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(120deg, #FFB820, #FF4FD8, #B845FF)" }}>
              gewoon kon bellen<br />met een AI-team?
            </span>
          </h2>
          <p className="text-white/70 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Geen cursus. Geen tool-jungle. Geen consultancy met 10 deadlines.<br />
            <strong className="text-white">Eén partij. Van A tot Z geregeld.</strong>
          </p>
        </motion.div>
      </div>

      {/* Floating glow elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{ background: "#FFB820" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-30"
        style={{ background: "#FF4FD8" }} />
    </section>
  );
}

export function FinalCtaV2() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0618 0%, #14071F 100%)" }}
    >
      <div className="container-wide text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{ background: "radial-gradient(circle, #FF4FD8 0%, transparent 70%)" }} />
            <Image
              src="/spunky/spunky-waving.webp"
              alt="Spunky says hi"
              fill
              sizes="192px"
              className="object-contain relative z-10"
            />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white mb-6">
            Klaar om Spunky te leren kennen?
          </h2>
          <a
            href="#scan"
            className="inline-block px-8 py-4 rounded-full font-medium text-lg"
            style={{
              background: "linear-gradient(135deg, #FFB820, #FF8A00)",
              color: "#14071F",
              boxShadow: "0 20px 60px rgba(255,184,32,0.5)",
            }}
          >
            Start gratis scan →
          </a>
          <p className="text-white/40 text-sm mt-6 font-mono tracking-wider">
            5 minuten · lokale AI · gratis rapport
          </p>
        </motion.div>
      </div>
    </section>
  );
}
