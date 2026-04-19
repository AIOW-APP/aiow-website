"use client";
import dynamic from "next/dynamic";

const HeroPro = dynamic(
  () => import("./HeroPro").then((m) => ({ default: m.HeroPro })),
  {
    ssr: false,
    loading: () => (
      <section className="relative h-screen w-full flex items-center justify-center" style={{ background: "#050210" }}>
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FFB820] mb-3">
            · Laden
          </div>
          <div className="w-48 h-px bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 animate-pulse" style={{ background: "linear-gradient(90deg,#FFB820,#FF4FD8)" }} />
          </div>
        </div>
      </section>
    ),
  }
);

export default HeroPro;
