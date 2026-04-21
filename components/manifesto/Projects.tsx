"use client";
import { motion } from "framer-motion";
import { projectsCopy } from "@/core/content/manifesto";

const STATUS_COLOR: Record<string, string> = {
  live: "#6FC043",
  building: "#FFB820",
  concept: "#8A8A8A",
};

export function Projects() {
  return (
    <section id="projects" className="relative py-24 md:py-36" style={{ zIndex: 10 }}>
      <div className="container-wide">
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              {projectsCopy.eyebrow}
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {projectsCopy.title}
          </h2>
          <p className="mt-5 text-white/55 text-base md:text-lg leading-relaxed max-w-xl">
            {projectsCopy.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {projectsCopy.items.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="group relative p-8 border border-white/10 hover:border-white/30 transition-colors rounded-xl bg-black/20"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-3xl" aria-hidden>{p.emoji}</span>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_COLOR[p.status] ?? "#8A8A8A" }}
                    aria-hidden
                  />
                  {p.status}
                </span>
              </div>
              <h3 className="font-display text-xl md:text-2xl text-white font-medium tracking-tight mb-2">
                {p.name}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                {p.oneliner}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
