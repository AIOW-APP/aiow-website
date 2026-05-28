"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./QuoteBuilder.module.css";

const packages = {
  starter: { label: "Persoonlijke AI Starter", setup: 2500, maintenance: 650, description: "Eigen AI-medewerker voor één duidelijke startflow." },
  private: { label: "Private Worklayer", setup: 8500, maintenance: 950, description: "Private werklaag voor meerdere workflows en strengere datagrens." },
  local: { label: "Local AI Node", setup: 18500, maintenance: 1750, description: "Lokale/private AI-infrastructuur met zwaardere controle." },
};

const workflowOptions = ["Klantvragen", "Offertes", "Content", "Planning", "Administratie", "Interne kennis", "Documenten", "Inbox triage"];

function euro(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function QuoteBuilder() {
  const [company, setCompany] = useState("Voorbeeldbedrijf BV");
  const [contact, setContact] = useState("Richard / eigenaar");
  const [pkg, setPkg] = useState<keyof typeof packages>("starter");
  const [workflows, setWorkflows] = useState(["Klantvragen", "Offertes", "Planning"]);
  const [extraHours, setExtraHours] = useState(6);
  const [risk, setRisk] = useState("Cloud toegestaan voor niet-gevoelige tekst. Menselijke approval vóór externe acties.");

  const selected = packages[pkg];
  const extra = extraHours * 175;
  const setupEstimate = selected.setup + Math.max(0, workflows.length - 3) * 450;

  const portalDraft = useMemo(() => ({
    company,
    contact,
    package: selected.label,
    setupFrom: setupEstimate,
    maintenanceFrom: selected.maintenance,
    extraWork: extra,
    hourlyRate: 175,
    workflows,
    dataBoundary: risk,
    status: "draft_manual_safe",
  }), [company, contact, selected, setupEstimate, extra, workflows, risk]);

  const toggleWorkflow = (item: string) => {
    setWorkflows((current) => current.includes(item) ? current.filter((x) => x !== item) : [...current, item]);
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/portal" className={styles.back}>← Klantportal</Link>
      <div><strong>AIOW Admin Quote Builder</strong><small>manual-safe · geen opslag · geen verzending</small></div>
    </header>

    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>Interne veilige vervolgstap</p>
        <h1>Maak in minuten een portal-draft voor een geïnteresseerde klant.</h1>
        <p>Deze builder is bewust lokaal/manual-safe: hij helpt scope, prijsverwachting, onderhoud, uurtarief en datagrens consistent formuleren zonder live database, auth, betaling of echte acceptatie.</p>
      </div>
      <aside className={styles.guardrail}><strong>Hard gate</strong><span>Dit is nog geen CRM, geen offerte-acceptatie en geen klantlogin. Publiceren/live maken pas na expliciet akkoord.</span></aside>
    </section>

    <section className={styles.workspace}>
      <form className={styles.builder}>
        <label>Bedrijf<input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
        <label>Contact / rol<input value={contact} onChange={(e) => setContact(e.target.value)} /></label>
        <label>Pakket<select value={pkg} onChange={(e) => setPkg(e.target.value as keyof typeof packages)}>{Object.entries(packages).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
        <fieldset><legend>Eerste workflows</legend><div className={styles.chips}>{workflowOptions.map((item) => <button type="button" key={item} className={workflows.includes(item) ? styles.activeChip : ""} onClick={() => toggleWorkflow(item)}>{item}</button>)}</div></fieldset>
        <label>Extra begeleidingsuren buiten onderhoud<input type="range" min="0" max="30" value={extraHours} onChange={(e) => setExtraHours(Number(e.target.value))} /><span>{extraHours} uur · {euro(extra)}</span></label>
        <label>Datagrens / approval-notitie<textarea value={risk} onChange={(e) => setRisk(e.target.value)} rows={4} /></label>
      </form>

      <aside className={styles.preview} aria-label="Quote preview">
        <div className={styles.previewTop}><span>Portal draft</span><span>{portalDraft.status}</span></div>
        <h2>{company || "Nieuwe klant"}</h2>
        <p>{selected.description}</p>
        <div className={styles.priceGrid}>
          <div><span>Setup vanaf</span><strong>{euro(setupEstimate)}</strong></div>
          <div><span>Onderhoud/mnd</span><strong>{euro(selected.maintenance)}</strong></div>
          <div><span>Extra werk</span><strong>{euro(extra)}</strong></div>
          <div><span>Uurtarief</span><strong>€175/u</strong></div>
        </div>
        <div className={styles.block}><span>Workflows</span><p>{workflows.join(" · ") || "Nog kiezen"}</p></div>
        <div className={styles.block}><span>Datagrens</span><p>{risk}</p></div>
        <div className={styles.nextSteps}><strong>Portalstatus</strong><ol><li>Interesse ontvangen</li><li>Mini-intake aanvullen</li><li>Offerte/scope reviewen</li><li>Planning pas na akkoord</li></ol></div>
      </aside>
    </section>

    <section className={styles.jsonBlock}>
      <div><p className={styles.eyebrow}>Mock payload</p><h2>Klaar voor latere API/database stap, maar nu nog veilig als preview.</h2></div>
      <pre>{JSON.stringify(portalDraft, null, 2)}</pre>
    </section>
  </main>;
}
