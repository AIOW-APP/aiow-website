"use client";
/**
 * SectorsV2 — 6 Spunky sector outfits as hover-reveal dioramas.
 */
import { motion } from "framer-motion";
import Image from "next/image";

const SECTORS = [
  { id: "baker",     name: "Ambacht",            subtitle: "Bakkers, kappers, monteurs", color: "#FFB820", img: "spunky-sector-baker.webp" },
  { id: "accountant",name: "Accountancy",        subtitle: "Boekhouding & administratie",color: "#B845FF", img: "spunky-sector-accountant.webp" },
  { id: "builder",   name: "Bouw",               subtitle: "Installatie & constructie",  color: "#FF8A00", img: "spunky-sector-builder.webp" },
  { id: "legal",     name: "Juridisch",          subtitle: "Advocatuur & notariaat",     color: "#FF4FD8", img: "spunky-sector-legal.webp" },
  { id: "horeca",    name: "Horeca",             subtitle: "Cafés, restaurants, hotels", color: "#FFB820", img: "spunky-sector-horeca.webp" },
  { id: "factory",   name: "Productie",          subtitle: "Maakindustrie & logistiek",  color: "#B845FF", img: "spunky-sector-factory.webp" },
];

export function SectorsV2() {
  return (
    <section id="sectors" className="relative py-28 md:py-40 bg-[#0A0618] overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-4">
            — Sectoren
          </p>
          <h2 className="font-display text-white text-4xl md:text-6xl font-medium tracking-tight mb-4">
            Spunky past zich aan
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Elk bedrijf is anders. Onze aanpak ook. Zes sectoren waar we al écht verstand van hebben.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
              style={{ background: `linear-gradient(145deg, ${s.color}18 0%, #1a0b2e 70%)` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${s.color}50 0%, transparent 60%)` }}
              />

              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-white/40">
                    Sector
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mt-1">
                    {s.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">
                    {s.subtitle}
                  </p>
                </div>
                <div className="relative h-48 md:h-56 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={`/spunky/${s.img}`}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
