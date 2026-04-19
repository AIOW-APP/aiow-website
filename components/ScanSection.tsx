"use client";
import { motion } from "framer-motion";
import { ScanFlow } from "./ScanFlow";

export function ScanSection() {
  return (
    <section id="scan" className="relative section-pad hairline overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="container-wide relative z-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="md:col-span-5"
          >
            <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
              — AI-scan
            </p>
            <h2
              className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02] mb-6"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              <span className="gradient-text">5 minuten.</span>
              <br />
              3 AI-kansen op<br />je bureau.
            </h2>
            <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed mb-8">
              Beantwoord 8 vragen. Onze lokale AI-fleet (4× Ollama modellen op Big Mac) analyseert je situatie en levert een concreet rapport met top-3 AI-kansen voor jouw bedrijf.
            </p>

            <div className="flex flex-col gap-3 text-sm">
              {[
                "100% privé — jouw data blijft op onze servers",
                "Lokale AI — geen OpenAI/Anthropic kosten",
                "Rapport per mail (PDF-waardig)",
                "Directe vervolgafspraak mogelijk",
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                  {f}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--color-line)]">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
                Scan modules
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-ink-soft)]">
                <div className="flex items-center gap-2">⚡ Werkprocessen</div>
                <div className="flex items-center gap-2">🌐 Vindbaarheid</div>
                <div className="flex items-center gap-2">📱 Social media</div>
                <div className="flex items-center gap-2">📄 Documenten</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="md:col-span-7"
          >
            <ScanFlow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
