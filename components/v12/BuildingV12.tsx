"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Capability } from "@/core/content/capabilities";
import { useLang, LangToggle } from "@/components/v12/LangContext";

export default function BuildingV12({ cap }: { cap: Capability }) {
  const [mounted, setMounted] = useState(false);
  const { lang, t } = useLang();
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0618] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0618] via-[#12093a] to-[#1a0f4a] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,32,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(79,195,247,0.08),transparent_50%)]" />

      {/* Top AIOW + lang toggle */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFB820] to-[#FF4FD8] flex items-center justify-center text-[#0A0618] font-black group-hover:scale-110 transition-transform">A</div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent leading-none">AIOW</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 leading-none mt-1">{t("tagline")}</span>
          </div>
        </Link>
        <LangToggle />
      </div>

      {/* Breadcrumb */}
      <div className="relative z-10 px-6 text-xs uppercase tracking-widest text-white/60">
        <Link href="/" className="hover:text-[#FFB820]">{lang === "nl" ? "Campus" : "Campus"}</Link>
        <span className="mx-2">/</span>
        <span>{cap.label[lang]}</span>
      </div>

      <div className="relative z-10 px-6 pt-6 pb-4 text-center max-w-4xl mx-auto">
        <div className="text-5xl mb-2">{cap.emoji}</div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent">
            {cap.label[lang]}
          </span>
        </h1>
        <p className="mt-3 text-lg text-white/70">{cap.tagline[lang]}</p>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 mt-4">
        <div className={`relative aspect-[3/2] rounded-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-700 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <img src={cap.buildingImage} alt={cap.label[lang]} className="w-full h-full object-cover"
               onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0618] via-transparent to-transparent" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 mt-12 pb-24">
        <div className="text-xs uppercase tracking-widest text-white/50 mb-4 text-center">
          {cap.rooms.length} {lang === "nl" ? "kamers in dit huis" : "rooms in this house"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cap.rooms.map((room, i) => (
            <Link
              key={room.id}
              href={`/h/${cap.id}/${room.id}`}
              className={`group relative overflow-hidden rounded-xl ring-1 ring-white/10 bg-white/5 backdrop-blur-sm hover:ring-[#FFB820]/50 hover:bg-white/10 hover:-translate-y-1 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={room.image} alt={room.title[lang]}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0618] via-[#0A0618]/30 to-transparent" />
              </div>
              <div className="p-4">
                <div className="text-2xl mb-1">{room.emoji}</div>
                <div className="font-semibold text-white text-sm">{room.title[lang]}</div>
                <div className="text-xs text-white/60 mt-1 line-clamp-2">{room.subtitle[lang]}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  <span className="text-[#FFB820]/80">{room.priceFrom[lang]}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/50">{room.liveIn[lang]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-white/50">
          <Link href="/" className="hover:text-[#FFB820]">← {lang === "nl" ? "Terug naar campus" : "Back to campus"}</Link>
        </div>
      </div>
    </div>
  );
}
