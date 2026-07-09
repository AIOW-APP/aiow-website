"use client";
import { motion } from "framer-motion";
import { manifestoPrinciples } from "@/core/content/manifesto";

export function Principles() {
  return (
    <section id="manifesto" className="relative py-24 md:py-36" style={{ zIndex: 10 }}>
      <div className="container-wide">
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              · Manifesto
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
          >
            Five statements.<br />
            <span className="italic text-white/40">Not negotiable.</span>
          </h2>
        </div>

        <div className="grid gap-8 md:gap-12">
          {manifestoPrinciples.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
              className="grid md:grid-cols-[auto_1fr_2fr] gap-4 md:gap-10 items-start py-8 border-t border-white/10"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)] min-w-[3rem]">
                {p.n}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight leading-tight">
                {p.title}
              </h3>
              <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
