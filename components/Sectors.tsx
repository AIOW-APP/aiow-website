"use client";
import { motion } from "framer-motion";
import { sectors } from "@/lib/content";

export function Sectors() {
  return (
    <section id="sectors" className="relative section-pad hairline">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="max-w-[44ch] mb-[var(--space-9)]"
        >
          <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
            — Sectoren
          </p>
          <h2
            className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02]"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            Elk bedrijf is uniek.
            <br />
            <span className="text-[var(--color-ink-muted)]">Maar de aanpak schaalt.</span>
          </h2>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] leading-relaxed">
            We hebben AI-transformaties geleid in zes sectoren. Elke sector heeft z’n eigen patronen — wij kennen ze.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sectors.map((s, i) => (
            <motion.div
              key={s.sector}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="group relative p-6 md:p-8 rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)] hover:border-[var(--color-line-strong)] overflow-hidden transition-all"
              data-cursor="interactive"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,240,255,0.06) 0%, transparent 50%)",
                }}
              />
              <div className="relative">
                <div className="text-5xl mb-6 transition-transform group-hover:scale-110 origin-left">
                  {s.emoji}
                </div>
                <h3 className="text-2xl font-medium tracking-tight mb-2">
                  {s.sector}
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] mb-6">
                  {s.examples}
                </p>
                <ul className="space-y-2.5">
                  {s.solutions.map((sol) => (
                    <li
                      key={sol}
                      className="flex items-start gap-2.5 text-sm text-[var(--color-ink-soft)]"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-accent)] shrink-0" />
                      {sol}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
