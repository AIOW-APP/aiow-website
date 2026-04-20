"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ManifestoV8() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 1.05]);

  return (
    <section
      ref={ref as any}
      className="relative py-40 md:py-56 flex items-center justify-center"
      style={{ zIndex: 10 }}
    >
      <motion.div
        style={{ y, scale }}
        className="container-wide text-center max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-10 bg-[#FFB820]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#FFB820]">
              · Manifest
            </p>
            <div className="h-px w-10 bg-[#FFB820]" />
          </div>
          <h2
            className="font-display font-medium text-white leading-[0.95] tracking-tighter"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6.5rem)" }}
          >
            <span className="block">AI is geen</span>
            <span className="block italic text-white/40">project.</span>
            <span className="block mt-4">Het is{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg,#FFB820 0%,#FF4FD8 50%,#B845FF 100%)",
                }}
              >
                infrastructuur.
              </span>
            </span>
          </h2>
          <p className="mt-12 text-white/60 text-lg md:text-xl leading-[1.7] max-w-2xl mx-auto">
            De bedrijven die vandaag investeren, compounden. Die wachten, raken achterop.
            Ik verlaag de drempel. Jij bouwt door.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
