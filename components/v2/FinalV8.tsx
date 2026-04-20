"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function FinalV8() {
  return (
    <section className="relative py-32 md:py-48" style={{ zIndex: 10 }}>
      <div className="container-wide text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="relative w-40 h-40 mx-auto mb-10">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{ background: "radial-gradient(circle, #FFB820 0%, #FF4FD8 50%, transparent 80%)" }}
            />
            <div
              className="absolute inset-0 rounded-full overflow-hidden border-2"
              style={{ borderColor: "rgba(255,184,32,0.4)" }}
            >
              <Image src="/debbie/chat-avatar.jpg" alt="Debbie" fill sizes="160px" className="object-cover" />
            </div>
          </div>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#FFB820] mb-6">
            · Begin vandaag
          </p>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight mb-10"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Praat met mij.<br />
            <span className="italic text-white/40">5 minuten.</span>
          </h2>
          <a
            href="#scan"
            data-cursor
            className="inline-block px-10 py-5 rounded-full font-medium text-base tracking-wide relative group overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#FFB820,#FF8A00)",
              color: "#14071F",
              boxShadow: "0 20px 60px rgba(255,184,32,0.4)",
            }}
          >
            <span className="relative z-10">Start de AI-scan →</span>
          </a>
          <p className="text-white/35 text-xs mt-8 font-mono tracking-[0.3em] uppercase">
            Gratis · lokaal verwerkt · geen verplichting
          </p>
        </motion.div>
      </div>
    </section>
  );
}
