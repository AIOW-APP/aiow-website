"use client";
/**
 * Dynamic import wrapper — Three.js is client-only.
 */
import dynamic from "next/dynamic";

const Hero3D = dynamic(
  () => import("./Hero3D").then((m) => ({ default: m.Hero3D })),
  {
    ssr: false,
    loading: () => (
      <section className="relative h-screen w-full flex items-center justify-center" style={{ background: "#06020D" }}>
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-3">
            Spunky wordt wakker
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 animate-pulse" style={{ background: "linear-gradient(90deg,#FFB820,#FF4FD8)" }} />
          </div>
        </div>
      </section>
    ),
  }
);

export default Hero3D;
