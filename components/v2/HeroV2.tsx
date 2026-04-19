"use client";
/**
 * HeroV2 — cinematic Spunky hero with stacked tagline above image.
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function HeroV2() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", String(x));
      el.style.setProperty("--my", String(y));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #2A0D4F 0%, #14071F 50%, #06020D 100%)",
      }}
    >
      {/* Floating cubes backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => {
          const size = 20 + ((i * 13) % 50);
          const left = (i * 7) % 100;
          const top = (i * 11) % 100;
          const delay = (i * 0.37) % 4;
          const hue = i % 3 === 0 ? "#FFB820" : i % 3 === 1 ? "#B845FF" : "#FF4FD8";
          return (
            <motion.div
              key={i}
              className="absolute rounded-md"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: `linear-gradient(135deg, ${hue} 0%, ${hue}55 100%)`,
                filter: "blur(0.5px)",
                boxShadow: `0 0 20px ${hue}66`,
              }}
              animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
            />
          );
        })}
      </div>

      {/* Energy ribbons */}
      <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B845FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF4FD8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0 60 Q 25 40 50 55 T 100 45"
          stroke="url(#ribbon1)"
          strokeWidth="0.3"
          fill="none"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 0 70 Q 30 85 60 65 T 100 72"
          stroke="#FFB820"
          strokeWidth="0.25"
          fill="none"
          opacity="0.5"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </svg>

      <div className="relative z-10 container-wide flex flex-col items-center gap-10 md:gap-14">
        {/* Tagline ON TOP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#FFB820] mb-5">
            — AI-transformatie voor Nederlandse MKB
          </p>
          <h1
            className="font-display font-medium leading-[0.95] tracking-tight text-white"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
          >
            Maak kennis met{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(120deg, #FFB820, #FF4FD8, #B845FF)",
              }}
            >
              Spunky.
            </span>
          </h1>
          <p className="mt-6 text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Onze AI-kameleon kent jouw bedrijf in 5 minuten — en levert 3 concrete AI-kansen waar je morgen mee aan de slag kunt.
          </p>
        </motion.div>

        {/* Spunky hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="relative w-full max-w-4xl"
          style={{
            transform:
              "translate3d(calc(var(--mx, 0) * -10px), calc(var(--my, 0) * -10px), 0)",
          }}
        >
          <Image
            src="/spunky/hero-official.jpg"
            alt="Spunky de AIOW-kameleon tussen gouden AIOW letters"
            width={1600}
            height={900}
            priority
            className="w-full h-auto rounded-3xl shadow-[0_30px_80px_rgba(184,69,255,0.4)]"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
        >
          <a
            href="#scan"
            className="px-7 py-3.5 rounded-full font-medium text-base"
            style={{
              background: "linear-gradient(135deg, #FFB820, #FF8A00)",
              color: "#14071F",
              boxShadow: "0 12px 40px rgba(255,184,32,0.4)",
            }}
          >
            Chat met Spunky →
          </a>
          <a
            href="#journey"
            className="px-7 py-3.5 rounded-full font-medium text-base text-white/80 hover:text-white transition-colors border border-white/20 hover:border-white/50"
          >
            Hoe werkt het?
          </a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest uppercase animate-pulse">
        ↓ scroll
      </div>
    </section>
  );
}
