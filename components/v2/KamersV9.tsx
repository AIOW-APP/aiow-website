"use client";
/**
 * KamersV9 — De 10 kamers van de AIOW Toren.
 * Elke kamer = een AI-dienst, een Kling v3 video-loop, en een on-click flight naar kamerdetail.
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Kamer = {
  num: number;
  emoji: string;
  name: string;
  service: string;
  tagline: string;
  video: string;
  accent: string; // gradient
};

const KAMERS: Kamer[] = [
  {
    num: 1,
    emoji: "📬",
    name: "De Brievenbus-gang",
    service: "Email automation",
    tagline: "Mails sorteren zichzelf. Jij leest alleen wat je moet lezen.",
    video: "/videos/kamer1_v3.mp4",
    accent: "from-amber-400/20 to-rose-500/10",
  },
  {
    num: 2,
    emoji: "⚙️",
    name: "De Fabriekshal",
    service: "Process automation",
    tagline: "Je bedrijfsprocessen, geautomatiseerd en verbonden.",
    video: "/videos/kamer2_v3.mp4",
    accent: "from-orange-400/20 to-red-500/10",
  },
  {
    num: 3,
    emoji: "📻",
    name: "Het Broadcast Studio",
    service: "Social media",
    tagline: "Content die jouw verhaal vertelt — op autopilot.",
    video: "/videos/kamer3_v3.mp4",
    accent: "from-pink-400/20 to-fuchsia-500/10",
  },
  {
    num: 4,
    emoji: "🪞",
    name: "De Spiegelkamer",
    service: "Website / content",
    tagline: "Een website die meegroeit met je bedrijf.",
    video: "/videos/kamer4_v3.mp4",
    accent: "from-sky-400/20 to-indigo-500/10",
  },
  {
    num: 5,
    emoji: "🗺️",
    name: "De Kaartenkamer",
    service: "SEO & GEO",
    tagline: "Gevonden worden door mens én AI. Overal.",
    video: "/videos/kamer5_v3.mp4",
    accent: "from-emerald-400/20 to-teal-500/10",
  },
  {
    num: 6,
    emoji: "📚",
    name: "De Bibliotheek",
    service: "Data & insights",
    tagline: "Je data praat terug. Je weet wat er speelt.",
    video: "/videos/kamer6_v3.mp4",
    accent: "from-yellow-400/20 to-amber-500/10",
  },
  {
    num: 7,
    emoji: "🍃",
    name: "De Zen-tuin",
    service: "Customer service",
    tagline: "Klanten geholpen — ook als jij slaapt.",
    video: "/videos/kamer7_v3.mp4",
    accent: "from-lime-400/20 to-green-500/10",
  },
  {
    num: 8,
    emoji: "🪙",
    name: "De Rekenkamer",
    service: "Finance & boekhouding",
    tagline: "Cijfers kloppen. Facturen gaan eruit. Rust.",
    video: "/videos/kamer8_v3.mp4",
    accent: "from-amber-500/20 to-yellow-600/10",
  },
  {
    num: 9,
    emoji: "📞",
    name: "De Ontvangsthal",
    service: "Contact & sales",
    tagline: "Leads komen binnen, worden gekwalificeerd, en landen bij jou.",
    video: "/videos/kamer9_v3.mp4",
    accent: "from-violet-400/20 to-purple-500/10",
  },
];

function KamerCard({ k, i }: { k: Kamer; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });

  // autoplay when visible, pause otherwise (saves battery)
  if (videoRef.current) {
    if (inView) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.19, 1, 0.22, 1] }}
      data-cursor
      className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
      style={{
        aspectRatio: "16/10",
        background: "#0A0618",
      }}
    >
      <video
        ref={videoRef}
        src={k.video}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
      />
      {/* gradient scrim for readability */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${k.accent} mix-blend-overlay opacity-60 pointer-events-none`}
      />

      {/* content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-7">
        <div className="flex items-start justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Kamer {k.num.toString().padStart(2, "0")}
          </div>
          <div className="text-2xl">{k.emoji}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFB820] mb-2">
            {k.service}
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight leading-[1.1] mb-3">
            {k.name}
          </h3>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
            {k.tagline}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function KamersV9() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-20%" });

  return (
    <section id="kamers" className="relative py-32 md:py-40 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16 md:mb-20 max-w-3xl"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFB820] mb-4">
            · De AIOW Toren
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-tight leading-[1.05] mb-6">
            9 kamers.<br />
            <span className="text-white/50">1 bedrijfsbrein.</span>
          </h2>
          <p className="text-white/60 text-lg md:text-xl leading-relaxed">
            Elke kamer is een AI-dienst. Ze werken samen als één team — dat nooit slaapt, nooit vergeet, en meegroeit met jouw bedrijf.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {KAMERS.map((k, i) => (
            <KamerCard key={k.num} k={k} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
