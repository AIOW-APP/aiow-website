"use client";
import { motion } from "framer-motion";
import { fleet } from "@/lib/content";

export function Fleet() {
  return (
    <section id="fleet" className="relative section-pad hairline overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,240,255,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,79,216,0.1) 0%, transparent 40%)",
        }}
      />

      <div className="container-wide relative z-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="md:col-span-7"
          >
            <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
              — {fleet.overline}
            </p>
            <h2
              className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02] mb-6"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {fleet.title}
              <br />
              <span className="gradient-text">{fleet.subtitle}</span>
            </h2>
            <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed max-w-[52ch]">
              {fleet.body}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="md:col-span-5"
          >
            <div className="grid grid-cols-2 gap-px bg-[var(--color-line)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-line)]">
              {fleet.stats.map((s) => (
                <div
                  key={s.label}
                  className="p-6 md:p-8 bg-[var(--color-canvas-soft)] flex flex-col gap-2"
                >
                  <span
                    className="font-display font-medium tracking-tight text-[var(--color-ink)] leading-none"
                    style={{ fontSize: "var(--text-4xl)" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Fleet graph */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="mt-[var(--space-9)] p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)]/50 backdrop-blur-sm"
        >
          <p className="font-mono text-xs tracking-wider uppercase text-[var(--color-ink-muted)] mb-6">
            Live AI-fleet
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Debbie", role: "Orchestrator", status: "online" },
              { name: "Handsome", role: "Strategist", status: "online" },
              { name: "Narrator", role: "Reporting", status: "online" },
              { name: "Memory", role: "Recall engine", status: "online" },
              { name: "Broker", role: "Credentials", status: "online" },
              { name: "Trading", role: "Paper runner", status: "online" },
              { name: "Research", role: "Weekly scan", status: "scheduled" },
              { name: "Backup", role: "4x redundant", status: "online" },
            ].map((agent, i) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)]"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === "online"
                      ? "bg-[var(--color-success)]"
                      : "bg-[var(--color-warning)]"
                  } animate-pulse`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                    {agent.name}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate">
                    {agent.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
