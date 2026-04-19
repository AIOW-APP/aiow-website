"use client";
/**
 * ScanFlow — 4-stage interactive AIOW AI-scan.
 * Stages: intake → verify → questions → streaming result
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES, SECTORS, TEAM_SIZES, AI_USAGE, TIME_LOSERS, type ScanModule } from "@/lib/scan/content";

type Stage = "intake" | "verify" | "questions" | "running" | "done";

export function ScanFlow() {
  const [stage, setStage] = useState<Stage>("intake");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [code, setCode] = useState("");
  const [session, setSession] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Questionnaire
  const [sector, setSector] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [aiUsage, setAiUsage] = useState<string[]>([]);
  const [timeLosers, setTimeLosers] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [socials, setSocials] = useState("");
  const [pain, setPain] = useState("");
  const [goals, setGoals] = useState("");
  const [modules, setModules] = useState<ScanModule[]>(["workflow", "geo", "social", "documents"]);

  // Result streaming
  const [report, setReport] = useState("");

  async function submitIntake(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/scan/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Kon code niet versturen");
      setStage("verify");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitVerify(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/scan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Ongeldige code");
      setSession(j.session);
      setStage("questions");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitScan(e: React.FormEvent) {
    e.preventDefault();
    if (!sector || !teamSize) { setErr("Kies sector en teamgrootte"); return; }
    setErr(""); setStage("running"); setReport("");
    try {
      const r = await fetch("/api/scan/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session, name, company, sector, teamSize,
          aiUsage, timeLosers, website, socials, pain, goals, modules,
        }),
      });
      if (!r.ok || !r.body) throw new Error("Scan kon niet starten");

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setReport(acc);
      }

      // Finalize — email report
      await fetch("/api/scan/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, name, company, sector, email, report: acc }),
      });

      setStage("done");
    } catch (e: any) {
      setErr(e.message);
      setStage("questions");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {stage === "intake" && (
          <motion.form
            key="intake"
            onSubmit={submitIntake}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)]"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-canvas)] flex items-center justify-center font-medium">1</span>
              Stap 1 van 3 · Gegevens
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight">
              Start je gratis AI-scan
            </h3>
            <p className="text-[var(--color-ink-soft)]">
              In 5 minuten weet je welke 3 AI-kansen direct impact maken voor jouw bedrijf. Geregisseerd door onze lokale AI-fleet. Gratis, geen verplichtingen.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Naam" value={name} onChange={setName} required />
              <Field label="Bedrijf" value={company} onChange={setCompany} required />
            </div>
            <Field label="Email (zakelijk)" value={email} onChange={setEmail} type="email" required />

            {err && <div className="text-sm text-[var(--color-danger)]">{err}</div>}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--color-ink-muted)]">
                We sturen een 6-cijferige code ter verificatie.
              </p>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                {loading ? "Sturen…" : "Stuur code"}
              </button>
            </div>
          </motion.form>
        )}

        {stage === "verify" && (
          <motion.form
            key="verify"
            onSubmit={submitVerify}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)]"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-canvas)] flex items-center justify-center font-medium">2</span>
              Stap 2 van 3 · Verificatie
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight">
              Check je mail
            </h3>
            <p className="text-[var(--color-ink-soft)]">
              We hebben een 6-cijferige code naar <strong className="text-[var(--color-ink)]">{email}</strong> gestuurd.
            </p>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">Code</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full bg-[var(--color-canvas)] border border-[var(--color-line-strong)] rounded-[var(--radius-md)] px-4 py-4 text-center font-mono text-2xl tracking-[0.3em] text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
                autoComplete="one-time-code"
                maxLength={6}
                required
              />
            </label>

            {err && <div className="text-sm text-[var(--color-danger)]">{err}</div>}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStage("intake")} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                ← Terug
              </button>
              <button type="submit" disabled={loading || code.length !== 6} className="btn-primary disabled:opacity-60">
                {loading ? "Verifieren…" : "Verifieer"}
              </button>
            </div>
          </motion.form>
        )}

        {stage === "questions" && (
          <motion.form
            key="questions"
            onSubmit={submitScan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)]"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-canvas)] flex items-center justify-center font-medium">3</span>
              Stap 3 van 3 · Vragen
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight">
              Vertel ons over je bedrijf
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Select label="Sector" value={sector} onChange={setSector} options={SECTORS} required />
              <Select label="Teamgrootte" value={teamSize} onChange={setTeamSize} options={TEAM_SIZES} required />
            </div>

            <Chips label="Huidig AI-gebruik" options={AI_USAGE} selected={aiUsage} onChange={setAiUsage} />
            <Chips label="Grootste tijd-verliezers" options={TIME_LOSERS} selected={timeLosers} onChange={setTimeLosers} />

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Website (optioneel)" value={website} onChange={setWebsite} placeholder="https://…" />
              <Field label="Social handles (optioneel)" value={socials} onChange={setSocials} placeholder="@handle, LinkedIn URL, …" />
            </div>

            <Field label="Specifieke pijn (optioneel)" value={pain} onChange={setPain} textarea placeholder="Waar zit je het meeste mee?" />
            <Field label="Ambities komende 12 maanden" value={goals} onChange={setGoals} textarea placeholder="Waar wil je heen?" />

            <ModuleSelector modules={modules} setModules={setModules} />

            {err && <div className="text-sm text-[var(--color-danger)]">{err}</div>}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Scan neemt 30-60s · Rapport komt per mail
              </p>
              <button type="submit" className="btn-primary" data-cursor="interactive">
                Run AI-scan →
              </button>
            </div>
          </motion.form>
        )}

        {(stage === "running" || stage === "done") && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5 p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${stage === "running" ? "bg-[var(--color-accent)] animate-pulse" : "bg-[var(--color-success)]"}`} />
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
                {stage === "running" ? "AI-scan draait op onze fleet…" : "Scan voltooid"}
              </p>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight">
              Rapport · {company}
            </h3>

            <div
              className="prose prose-invert max-w-none text-[var(--color-ink-soft)] leading-relaxed scan-report"
              dangerouslySetInnerHTML={{ __html: renderMd(report) }}
            />

            {stage === "done" && (
              <div className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 mt-4">
                <p className="text-sm text-[var(--color-ink)]">
                  ✓ Rapport is ook naar <strong>{email}</strong> gemaild.
                </p>
                <a
                  href="https://cal.com/handsomebstrd/aiow-scan"
                  target="_blank"
                  rel="noopener"
                  className="btn-primary w-fit"
                >
                  Plan 2-uur strategie-call →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scan-report h2 { font-size: 1.5rem; color: var(--color-ink); margin: 1.5em 0 0.5em; letter-spacing: -0.01em; }
        .scan-report h3 { font-size: 1.15rem; color: var(--color-ink); margin: 1em 0 0.3em; }
        .scan-report strong { color: var(--color-ink); }
        .scan-report p { margin: 0.8em 0; }
        .scan-report ul { margin: 0.8em 0; padding-left: 1.25em; }
        .scan-report li { margin: 0.3em 0; }
        .scan-report li::marker { color: var(--color-accent); }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  required?: boolean; placeholder?: string; textarea?: boolean;
}) {
  const cls =
    "w-full bg-[var(--color-canvas)] border border-[var(--color-line-strong)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none transition-colors";
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}{required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={cls} />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}{required ? " *" : ""}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-[var(--color-canvas)] border border-[var(--color-line-strong)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
      >
        <option value="">— Kies —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Chips({ label, options, selected, onChange }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v));
    else onChange([...selected, v]);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            type="button"
            key={o.value}
            onClick={() => toggle(o.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
              selected.includes(o.value)
                ? "bg-[var(--color-accent)] text-[var(--color-canvas)] border-[var(--color-accent)]"
                : "border-[var(--color-line-strong)] text-[var(--color-ink-soft)] hover:border-[var(--color-ink)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModuleSelector({ modules, setModules }: { modules: ScanModule[]; setModules: (m: ScanModule[]) => void }) {
  const toggle = (id: ScanModule) => {
    if (modules.includes(id)) setModules(modules.filter(x => x !== id));
    else setModules([...modules, id]);
  };
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
        Scan modules (kies één of meer)
      </span>
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(m => (
          <button
            type="button"
            key={m.id}
            onClick={() => toggle(m.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              modules.includes(m.id)
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                : "border-[var(--color-line)] bg-[var(--color-canvas)] hover:border-[var(--color-line-strong)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{m.emoji}</span>
              <div>
                <div className="font-medium text-[var(--color-ink)]">{m.label}</div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-1">{m.tagline}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Tiny md → html for live streaming render
function renderMd(md: string): string {
  let s = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/^- (.+)$/gm, "<li>$1</li>");
  s = s.replace(/((?:<li>.*<\/li>\s*)+)/g, "<ul>$1</ul>");
  s = s.split(/\n\n+/).map(p => /^\s*<(h\d|ul|li)/.test(p) ? p : `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  return s;
}
