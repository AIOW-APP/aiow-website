"use client";
/**
 * SectorsV3 — editorial grid, no Spunky outfits. Pro iconography via geometric shapes.
 */
import { motion } from "framer-motion";

const SECTORS = [
  { name: "Accountancy", desc: "Boekhouding, fiscaal, administratie", result: "47% sneller factureren" },
  { name: "Juridisch", desc: "Advocatuur, notariaat, juridisch advies", result: "3× snellere contractreview" },
  { name: "Bouw & Installatie", desc: "Aannemers, installateurs, constructie", result: "€4.200/mnd bespaard per team" },
  { name: "Horeca", desc: "Cafés, restaurants, hotels", result: "2 uur/dag minder administratie" },
  { name: "Productie", desc: "Maakindustrie, logistiek, distributie", result: "18% minder voorraadfouten" },
  { name: "Zakelijke diensten", desc: "Consultancy, marketing, HR", result: "5× meer leads uit content" },
];

export function SectorsV3() {
  return (
    <section
      id="sectors"
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "#0A0618" }}
    >
      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mb-16 md:mb-24"
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            · Sectoren waar we leverden
          </p>
          <h2
            className="font-display font-medium text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Niet theoretisch.<br />
            Gewoon <span className="italic">gedaan</span>.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="group relative bg-[#0A0618] p-8 md:p-10 hover:bg-[#140A24] transition-colors duration-500 min-h-[260px] flex flex-col justify-between"
            >
              {/* Hover accent */}
              <div
                className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
                style={{ background: "linear-gradient(90deg,#FFB820,#FF4FD8,transparent)" }}
              />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mb-3 leading-[1.1]">
                  {s.name}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFB820]/80">
                  Resultaat
                </p>
                <p className="text-white text-base md:text-lg font-medium mt-1">
                  {s.result}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
