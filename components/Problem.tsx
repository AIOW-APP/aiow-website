"use client";
import { motion } from "framer-motion";
import { problems } from "@/lib/content";

export function Problem() {
  return (
    <section id="problem" className="relative section-pad hairline">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[40ch] mb-[var(--space-9)]"
        >
          <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
            — Het probleem
          </p>
          <h2 className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02]"
              style={{ fontSize: "var(--text-4xl)" }}>
            AI <span className="text-[var(--color-ink-muted)]">overal.</span>
            <br />
            Impact <span className="text-[var(--color-accent-alt)]">nergens.</span>
          </h2>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] leading-relaxed">
            Je bedrijf hoort overal dat “AI de game verandert”. En intern? Chaos. Stagiairs experimenteren, boekhouders zijn bang, directie wil visie. Resultaat: stilstand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-6 md:p-8 rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)] overflow-hidden hover:border-[var(--color-line-strong)] transition-all"
              data-cursor="interactive"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(0,240,255,0.08), transparent 60%)",
                }}
              />
              <span className="text-4xl mb-5 block">{p.icon}</span>
              <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-3">
                {p.title}
              </h3>
              <p className="text-[var(--color-ink-soft)] leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
