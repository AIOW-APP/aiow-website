"use client";
import { motion } from "framer-motion";
import { technicalCopy } from "@/core/content/manifesto";

export function Technical() {
  return (
    <section id="technical" className="relative py-24 md:py-36" style={{ zIndex: 10 }}>
      <div className="container-wide">
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              {technicalCopy.eyebrow}
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {technicalCopy.title}
          </h2>
          <p className="mt-5 text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
            {technicalCopy.sub}
          </p>
        </div>

        <dl className="grid gap-6 md:gap-4">
          {technicalCopy.blocks.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid md:grid-cols-[9rem_1fr] gap-2 md:gap-8 items-baseline py-6 border-t border-white/10"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                {b.label}
              </dt>
              <dd>
                <div className="font-mono text-sm md:text-base text-white break-all leading-snug">
                  {b.value}
                </div>
                <div className="mt-1 text-white/45 text-sm leading-relaxed">
                  {b.note}
                </div>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
