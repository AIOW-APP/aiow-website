"use client";
/**
 * HeroV2 — cinematic Spunky hero with floating 3D AIOW letters.
 * Uses the official Spunky hero render + CSS 3D transforms for letters.
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #2A0D4F 0%, #14071F 50%, #06020D 100%)",
      }}
    >
      {/* Floating cubes backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => {
          const size = 20 + Math.random() * 60;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 4;
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
                transform:
                  "rotateX(calc(var(--my, 0) * 20deg)) rotateY(calc(var(--mx, 0) * 20deg))",
              }}
              animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
            />
          );
        })}
      </div>

      {/* Energy ribbons */}
      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
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

      {/* Main hero image — Spunky with AIOW letters */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 w-full max-w-5xl px-4"
        style={{
          transform:
            "translate3d(calc(var(--mx, 0) * -12px), calc(var(--my, 0) * -12px), 0)",
        }}
      >
        <Image
          src="/spunky/hero-official.jpg"
          alt="Spunky — AIOW's AI-kameleon"
          width={1600}
          height={900}
          priority
          className="w-full h-auto rounded-3xl shadow-[0_30px_80px_rgba(184,69,255,0.4)]"
        />
      </motion.div>

      {/* Tagline below hero image */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
        className="absolute bottom-16 left-0 right-0 z-20 text-center px-4"
      >
        <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#FFB820] mb-4">
          — AI-transformatie voor Nederlandse MKB
        </p>
        <h1
          className="font-display font-medium leading-[0.95] tracking-tight text-white"
          style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
        >
          Spunky kent<br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(120deg, #FFB820, #FF4FD8, #B845FF)",
            }}
          >
            jouw bedrijf.
          </span>
        </h1>
        <div className="flex items-center justify-center gap-4 mt-8">
          <a
            href="#scan"
            className="btn-gold px-7 py-3.5 rounded-full font-medium text-base"
            style={{
              background: "linear-gradient(135deg, #FFB820, #FF8A00)",
              color: "#14071F",
              boxShadow: "0 12px 40px rgba(255,184,32,0.4)",
            }}
          >
            Start gratis scan →
          </a>
          <a
            href="#journey"
            className="px-7 py-3.5 rounded-full font-medium text-base text-white/80 hover:text-white transition-colors border border-white/20 hover:border-white/50"
          >
            Hoe werkt het?
          </a>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest uppercase animate-pulse">
        ↓ scroll
      </div>
    </section>
  );
}
