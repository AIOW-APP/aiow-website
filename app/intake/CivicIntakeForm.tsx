"use client";

import { useMemo, useState } from "react";
import styles from "../civicPortal.module.css";

/* Civic venture-intake: idee + bedrijfsgegevens → account via bestaande /api/customer-accounts.
   Zelfde toon als de homepage: het systeem weegt zichtbaar mee terwijl je typt. */

const MODULES = [
  "AI-automatisering",
  "Platform of app bouwen",
  "Marketing en groei",
  "Data en dashboards",
] as const;

const PROJECT_TYPES = [
  "Nieuw product of startup-idee",
  "Bestaand bedrijf digitaliseren",
  "AI-automatisering van processen",
  "Anders",
] as const;

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success"; accountId: string; accessCode: string; portalUrl: string }
  | { status: "error"; message: string };

export function CivicIntakeForm() {
  const [idea, setIdea] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [modules, setModules] = useState<string[]>([MODULES[0]]);
  const [terms, setTerms] = useState(false);
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const signal = useMemo(() => {
    const n = idea.trim().length;
    if (n === 0) return { score: 0, label: "het systeem luistert" };
    if (n < 25) return { score: Math.min(38 + n, 55), label: "signaal opgevangen, vertel meer" };
    return { score: Math.min(38 + Math.round(n * 0.6), 74), label: "sterk signaal, open je dossier" };
  }, [idea]);

  function toggleModule(m: string) {
    setModules((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  const canSubmit =
    idea.trim().length >= 12 &&
    companyName.trim().length > 1 &&
    contactName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(contactEmail.trim()) &&
    modules.length > 0 &&
    terms &&
    state.status !== "sending";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/customer-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          legalName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          projectName: idea.trim().slice(0, 120),
          projectType,
          projectDescription: idea.trim(),
          telegramHandle: telegramHandle.trim() || undefined,
          moduleInterests: modules,
          accountTermsAccepted: true,
          emailFollowupConsent: true,
          honeyWebsite: "",
          sourceRoute: "/intake-civic",
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error === "Incomplete customer account"
          ? "Er ontbreekt nog iets: " + (data.missing || []).join(", ")
          : data.error || "Aanmelden is niet gelukt.");
      }
      const accountId = data.account?.accountId || data.accountId || String(data.portalUrl || "").split("/portal/customer/")[1] || "";
      if (!accountId) throw new Error("Dossier is aangemaakt, maar accountnummer ontbreekt in de API-response.");
      try {
        localStorage.setItem("aiow:lastAccountId", accountId);
        localStorage.setItem("aiow:lastAccessCode", data.accessCode);
      } catch { /* privé-modus: geen blocker */ }
      setState({ status: "success", accountId, accessCode: data.accessCode, portalUrl: data.portalUrl || `/portal/customer/${accountId}` });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Aanmelden is niet gelukt." });
    }
  }

  if (state.status === "success") {
    return (
      <section className={styles.success} aria-live="polite">
        <span className={styles.stamp}>DOSSIER GEOPEND</span>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 8 }}>
          Het systeem is aan het wegen.
        </h2>
        <p className={styles.lead}>
          Je dossier is aangemaakt. Bewaar je toegangscode goed; daarmee log je in op je dossier en volg je
          het oordeel, het voorstel en straks elke gerealiseerde stap.
        </p>
        <div className={styles.codeBox}>Toegangscode: {state.accessCode}</div>
        <div className={styles.ctaRow}>
          <a className={styles.ctaSolid} href={state.portalUrl}>Open mijn dossier</a>
          <a className={styles.ctaLine} href="https://wa.me/31621898039">Vraag via WhatsApp</a>
        </div>
        <p className={styles.note}>Binnen een werkdag krijg je een eerlijk antwoord: meebouwen voor een omzetdeel, een betaalde scan met plan, of een afwijzing met verbetertip.</p>
      </section>
    );
  }

  return (
    <form className={styles.card} onSubmit={submit}>
      <label className={styles.field}>
        Beschrijf je idee of bedrijf
        <textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Wat wil je bouwen of laten groeien, voor wie, en wat is er al?"
          required
        />
      </label>
      <p className={styles.meta}>venture-signaal <b>{signal.score}</b>/100 · {signal.label}</p>

      <div className={styles.grid2}>
        <label className={styles.field}>Bedrijfsnaam
          <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} autoComplete="organization" required />
        </label>
        <label className={styles.field}>Je naam
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} autoComplete="name" required />
        </label>
        <label className={styles.field}>E-mail
          <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label className={styles.field}>Telegram (optioneel, voor je projectgroep met Spunky)
          <input value={telegramHandle} onChange={(event) => setTelegramHandle(event.target.value)} placeholder="@jouwnaam" />
        </label>
      </div>

      <label className={styles.field}>Wat past het best?
        <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
          {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>

      <div className={styles.field}>Waar moet AIOW mee bouwen?
        <div className={styles.chips}>
          {MODULES.map((m) => (
            <button key={m} type="button" className={modules.includes(m) ? styles.chipOn : styles.chip} onClick={() => toggleModule(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.consent}>
        <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} required />
        <span>Ik ga akkoord met de accountvoorwaarden en dat AIOW mij per e-mail opvolgt over dit dossier.</span>
      </label>

      {state.status === "error" && <p className={styles.error}>{state.message}</p>}

      <button className={styles.submit} type="submit" disabled={!canSubmit}>
        {state.status === "sending" ? "Dossier openen..." : "Open mijn dossier"}
      </button>
      <p className={styles.note}>Eerlijk oordeel binnen een werkdag. Wij zeggen vaker nee dan ja; daarom betekent onze ja iets.</p>
    </form>
  );
}
