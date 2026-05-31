"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Capability, Room } from "@/core/content/capabilities";
import { useLang, LangToggle } from "@/components/v12/LangContext";

export default function RoomV12({ cap, room }: { cap: Capability; room: Room }) {
  const [mounted, setMounted] = useState(false);
  const { lang, t } = useLang();
  useEffect(() => { setMounted(true); }, []);

  const idx = cap.rooms.findIndex((r) => r.id === room.id);
  const prev = idx > 0 ? cap.rooms[idx - 1] : null;
  const next = idx < cap.rooms.length - 1 ? cap.rooms[idx + 1] : null;

  return (
    <div className="relative min-h-screen bg-[#0A0618] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <Image src={room.image} alt="" fill sizes="100vw" className="object-cover"
             onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0618]/85 via-[#0A0618]/75 to-[#0A0618]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,184,32,0.15),transparent_50%)]" />

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

      <div className="relative z-10 px-6 text-xs uppercase tracking-widest text-white/60">
        <Link href="/" className="hover:text-[#FFB820]">Campus</Link>
        <span className="mx-2">/</span>
        <Link href={`/h/${cap.id}`} className="hover:text-[#FFB820]">{cap.label[lang]}</Link>
        <span className="mx-2">/</span>
        <span>{room.title[lang]}</span>
      </div>

      <div className={`relative z-10 mx-auto max-w-3xl px-6 pt-8 pb-24 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">{room.emoji}</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#FFB820] via-[#FF4FD8] to-[#4FC3F7] bg-clip-text text-transparent">
              {room.title[lang]}
            </span>
          </h1>
          <p className="mt-3 text-lg text-white/70">{room.subtitle[lang]}</p>
        </div>

        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">{t("priceFromLabel")}</div>
              <div className="text-2xl font-bold text-[#FFB820]">{room.priceFrom[lang]}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">{t("liveInLabel")}</div>
              <div className="text-2xl font-bold text-[#4FC3F7]">{room.liveIn[lang]}</div>
            </div>
          </div>

          <p className="text-white/80 leading-relaxed">
            {lang === "nl"
              ? "Wij regelen de integratie met jouw bestaande systemen, trainen de AI op jouw brand, en leveren een werkende oplossing binnen bovenstaande doorlooptijd. Geen templates — wel snelheid."
              : "We handle integration with your existing stack, train the AI on your brand, and deliver a working solution within the lead time above. No templates — just speed."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="https://wa.me/31621898039" target="_blank" rel="noopener"
               className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-semibold text-center hover:scale-[1.02] transition-transform">
              {t("planCall")}
            </a>
            <Link href={`/h/${cap.id}`}
                  className="flex-1 px-6 py-3 rounded-full ring-1 ring-white/20 text-white text-center hover:bg-white/5 transition-colors">
              {t("moreRooms")}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex justify-between text-sm">
          {prev ? (
            <Link href={`/h/${cap.id}/${prev.id}`} className="text-white/60 hover:text-[#FFB820]">
              ← {prev.title[lang]}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/h/${cap.id}/${next.id}`} className="text-white/60 hover:text-[#FFB820]">
              {next.title[lang]} →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
