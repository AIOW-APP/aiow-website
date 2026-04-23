"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CAPABILITIES, CAMPUS_IMAGE } from "@/core/content/capabilities";

export default function IntroV11() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0618] text-white overflow-hidden">
      {/* ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0618] via-[#12093a] to-[#1a0f4a] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,184,32,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(79,195,247,0.1),transparent_50%)]" />

      {/* Breadcrumb */}
      <div className="relative z-10 px-6 py-4 text-xs uppercase tracking-widest text-white/60">
        AIOW
      </div>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-8 pb-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent">
            De AIOW-campus
          </span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
          Acht huizen. Elk huis een brok AI-kracht voor jouw bedrijf.
          <br className="hidden sm:block" />
          Kies een huis → stap een kamer binnen → zie wat AIOW voor jou kan doen.
        </p>
      </div>

      {/* Campus visual with clickable overlay */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 mt-6">
        <div className={`relative aspect-[3/2] rounded-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <img src={CAMPUS_IMAGE} alt="AIOW campus" className="w-full h-full object-cover"
               onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0618] via-transparent to-transparent" />
        </div>
      </div>

      {/* 8 capability cards grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 mt-12 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <Link
              key={cap.id}
              href={`/h/${cap.id}`}
              onMouseEnter={() => setHovered(cap.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-xl ring-1 ring-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:ring-[#FFB820]/50 hover:bg-white/10 hover:-translate-y-1 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={cap.buildingImage} alt={cap.label}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0618] via-[#0A0618]/30 to-transparent" />
              </div>
              <div className="p-4">
                <div className="text-2xl mb-1">{cap.emoji}</div>
                <div className="font-semibold text-white">{cap.label}</div>
                <div className="text-xs text-white/60 mt-1 line-clamp-2">{cap.tagline}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-[#FFB820]/80">
                  {cap.rooms.length} kamers →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/h/custom-ai" className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-semibold hover:scale-105 transition-transform">
            🧪 Past jouw vraag nergens in? Stap hier binnen
          </Link>
        </div>
      </div>
    </div>
  );
}
