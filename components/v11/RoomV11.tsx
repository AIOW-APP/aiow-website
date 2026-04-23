"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Capability, Room } from "@/core/content/capabilities";

export default function RoomV11({ cap, room }: { cap: Capability; room: Room }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const idx = cap.rooms.findIndex((r) => r.id === room.id);
  const prev = idx > 0 ? cap.rooms[idx - 1] : null;
  const next = idx < cap.rooms.length - 1 ? cap.rooms[idx + 1] : null;

  return (
    <div className="relative min-h-screen bg-[#0A0618] text-white overflow-hidden">
      {/* Room image as full-bleed backdrop */}
      <div className="absolute inset-0 opacity-40">
        <img src={room.image || ""} alt=""
             className="w-full h-full object-cover"
             onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0618]/85 via-[#0A0618]/75 to-[#0A0618]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,184,32,0.15),transparent_50%)]" />

      {/* Breadcrumb */}
      <div className="relative z-10 px-6 py-4 text-xs uppercase tracking-widest text-white/60">
        <Link href="/" className="hover:text-[#FFB820]">AIOW</Link>
        <span className="mx-2">/</span>
        <Link href={`/h/${cap.id}`} className="hover:text-[#FFB820]">{cap.label}</Link>
        <span className="mx-2">/</span>
        <span>{room.title}</span>
      </div>

      <div className={`relative z-10 mx-auto max-w-3xl px-6 pt-8 pb-24 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">{room.emoji}</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent">
              {room.title}
            </span>
          </h1>
          <p className="mt-3 text-lg text-white/70">{room.subtitle}</p>
        </div>

        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">Vanaf</div>
              <div className="text-2xl font-bold text-[#FFB820]">{room.priceFrom}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">Live in</div>
              <div className="text-2xl font-bold text-[#4FC3F7]">{room.liveIn}</div>
            </div>
          </div>

          <p className="text-white/80 leading-relaxed">
            Wij regelen de integratie met jouw bestaande systemen, trainen de AI op jouw brand, en leveren een werkende oplossing binnen bovenstaande doorlooptijd. Geen templates — wel snelheid.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="mailto:office@aiow.io?subject=Interesse%20in%20AIOW"
               className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-semibold text-center hover:scale-[1.02] transition-transform">
              Plan een gesprek
            </a>
            <Link href={`/h/${cap.id}`}
                  className="flex-1 px-6 py-3 rounded-full ring-1 ring-white/20 text-white text-center hover:bg-white/5 transition-colors">
              Bekijk andere kamers
            </Link>
          </div>
        </div>

        {/* Prev/Next */}
        <div className="mt-10 flex justify-between text-sm">
          {prev ? (
            <Link href={`/h/${cap.id}/${prev.id}`} className="text-white/60 hover:text-[#FFB820]">
              ← {prev.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/h/${cap.id}/${next.id}`} className="text-white/60 hover:text-[#FFB820]">
              {next.title} →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
