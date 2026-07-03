"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { finalCta } from "@/lib/content";

export function Contact() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...body,
          consentAccepted: body.consentAccepted === "on",
          consentText: "AIOW mag mijn contactgegevens en intakecontext gebruiken om mijn aanvraag persoonlijk per e-mail op te volgen. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.",
          consentVersion: "aiow-followup-v1",
          source: "aiow.ai",
          sourceRoute: typeof window !== "undefined" ? window.location.pathname : "/",
          sourceComponent: "homepage-scan-contact",
          intentType: "scan",
          intentText: body.message,
          projectType: body.sector,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      setState("ok");
      e.currentTarget.reset();
    } catch (e: any) {
      setErr(e.message || "Onbekende fout");
      setState("err");
    }
  }

  return (
    <section id="scan" className="relative section-pad hairline overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="container relative z-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="md:col-span-5"
          >
            <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
              {finalCta.eyebrow}
            </p>
            <h2
              className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02] mb-6"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              <span className="gradient-text">{finalCta.title}</span>
            </h2>
            <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed mb-10">
              {finalCta.body}
            </p>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                2 uur video-call
              </div>
              <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                Concreet PDF rapport
              </div>
              <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                3 prioritaire use cases
              </div>
              <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                Budget & roadmap
              </div>
              <div className="flex items-center gap-3 text-[var(--color-ink-soft)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-success)]" />
                <strong className="text-[var(--color-success)]">Gratis, geen verplichtingen</strong>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="md:col-span-7"
          >
            <form
              onSubmit={onSubmit}
              className="p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)] flex flex-col gap-5"
            >
              <input className="hidden" tabIndex={-1} autoComplete="off" name="honeyWebsite" aria-hidden="true" />
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Naam" name="name" required />
                <Field label="Bedrijf" name="company" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email" name="email" type="email" required />
                <Field label="Telefoon" name="phone" type="tel" />
              </div>
              <Field label="Sector" name="sector" placeholder="bv. accountancy, ambacht, juridisch…" required />
              <Field
                label="Waar wil je AI inzetten?"
                name="message"
                textarea
                placeholder="Kort wat speelt, wat je probeert op te lossen, wat je hebt geprobeerd…"
              />

              <label className="flex gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-canvas)]/70 p-4 text-sm text-[var(--color-ink-soft)]">
                <input type="checkbox" name="consentAccepted" required className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
                <span>
                  AIOW mag mijn e-mail en aanvraagcontext gebruiken om mij persoonlijk op te volgen over deze AI-scan. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Verstuurd naar <span className="text-[var(--color-ink-soft)]">{finalCta.emailTo}</span>. We reageren binnen 24u.
                </p>
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="btn-primary disabled:opacity-60"
                  data-cursor="interactive"
                >
                  {state === "loading" ? "Versturen…" : "Scan aanvragen"}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {state === "ok" && (
                <div className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-lg p-4">
                  ✓ Aanvraag verstuurd. Je krijgt direct een bevestigingsmail en wij reageren binnen 24 uur met beschikbare tijden.
                </div>
              )}
              {state === "err" && (
                <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg p-4">
                  Er ging iets mis: {err}. Probeer opnieuw of mail rechtstreeks naar {finalCta.emailTo}.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full bg-[var(--color-canvas)] border border-[var(--color-line-strong)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none transition-colors";
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}{required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required={required}
          placeholder={placeholder}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}
