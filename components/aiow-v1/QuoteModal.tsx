"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PRICING_CONTEXT_SLUGS, pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import styles from "./AiowV1Homepage.module.css";

export type CalculatorQuoteConfig = { segment: "business" | "building" | "home"; serviceRoute: "standard" | "comfort"; people?: number; squareMetres?: number; homeSubtype?: "home" | "signature" };
type Form = { contextSlug: string; modules: ("scan" | "blueprint" | "supervision")[]; designSquareMetres: string; technologyBudgetEuros: string; name: string; email: string; phone: string; company: string; postcode: string; kvk: string; startDate: string; note: string; website: string; consentAccepted: boolean };
const focusableSelector = "button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
const emptyForm: Form = { contextSlug: "", modules: [], designSquareMetres: "", technologyBudgetEuros: "", name: "", email: "", phone: "", company: "", postcode: "", kvk: "", startDate: "", note: "", website: "", consentAccepted: false };

export function QuoteModal({ open, onClose, locale = "nl", returnFocus, calculatorConfig }: { open: boolean; onClose: () => void; locale?: "nl" | "en"; returnFocus?: HTMLElement | null; calculatorConfig: CalculatorQuoteConfig | null }) {
  const [form, setForm] = useState<Form>(emptyForm); const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"); const [errorKind, setErrorKind] = useState<number>(0); const [quoteNumber, setQuoteNumber] = useState("");
  const dialog = useRef<HTMLDivElement>(null); const operation = useRef({ fingerprint: "", key: "" }); const sending = useRef(false); const en = locale === "en";
  const configFingerprint = JSON.stringify(calculatorConfig);
  useEffect(() => {
    if (!open || !calculatorConfig) return;
    setForm((current) => ({ ...current, contextSlug: "", modules: [], designSquareMetres: String(calculatorConfig.squareMetres || ""), technologyBudgetEuros: "" }));
    setErrors({}); setStatus("idle"); setQuoteNumber("");
  }, [open, calculatorConfig, configFingerprint]);
  useEffect(() => {
    if (!open) return;
    const previous = returnFocus || document.activeElement as HTMLElement | null; const dialogNode = dialog.current; const backdrop = dialogNode?.parentElement; const site = backdrop?.parentElement;
    const inertNodes = Array.from(site?.children || []).filter((node) => node !== backdrop) as HTMLElement[]; inertNodes.forEach((node) => { node.inert = true; });
    const focusables = () => Array.from(dialogNode?.querySelectorAll<HTMLElement>(focusableSelector) || []).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
    const frame = requestAnimationFrame(() => (focusables()[0] || dialogNode)?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending.current) { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return; const items = focusables(); if (!items.length) { event.preventDefault(); dialogNode?.focus(); return; }
      const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", key); document.body.style.overflow = ""; inertNodes.forEach((node) => { node.inert = false; }); previous?.focus(); };
  }, [open, onClose, returnFocus]);
  const contextOptions = useMemo(() => pricingContexts.filter((item) => calculatorConfig?.segment === "business" ? item.category === "business" : item.category === "building"), [calculatorConfig?.segment]);
  if (!open || !calculatorConfig) return null;
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "", form: "" })); if (status === "error") setStatus("idle"); }
  function toggleModule(module: Form["modules"][number]) { update("modules", form.modules.includes(module) ? form.modules.filter((item) => item !== module) : [...form.modules, module]); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (sending.current) return;
    const hasBudgetModule = form.modules.some((module) => module !== "scan");
    const smartDesign = form.modules.length ? { modules: form.modules, squareMetres: Number(form.designSquareMetres), ...(hasBudgetModule && form.technologyBudgetEuros ? { technologyBudgetEuros: Number(form.technologyBudgetEuros) } : {}) } : { modules: [] };
    const configuration = { ...calculatorConfig, ...(form.contextSlug ? { contextSlug: form.contextSlug } : {}), smartDesign };
    const params = new URLSearchParams(location.search); const utm = [...params.entries()].filter(([key]) => key.startsWith("utm_")).map(([key, value]) => `${key}=${value}`).join("&").slice(0, 200);
    const payload = { configuration, contact: { name: form.name, email: form.email, phone: form.phone, company: form.company, postcode: form.postcode, kvk: form.kvk, startDate: form.startDate, note: form.note }, consent: { accepted: form.consentAccepted, version: "aiow-quote-v1" }, source: { route: location.pathname.slice(0, 240), ...(utm ? { utm } : {}), locale }, website: form.website };
    const fingerprint = JSON.stringify(payload); if (operation.current.fingerprint !== fingerprint) operation.current = { fingerprint, key: crypto.randomUUID() };
    sending.current = true; setStatus("sending"); setErrors({}); setErrorKind(0);
    try {
      const response = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": operation.current.key }, body: fingerprint });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.toLowerCase().startsWith("application/pdf")) {
        let body: { fields?: Record<string, string> } = {}; if (contentType.includes("application/json")) { try { body = await response.json(); } catch { /* generic failure below */ } }
        setErrors(body.fields || {}); setErrorKind(response.status); throw new Error("not durably accepted");
      }
      const number = response.headers.get("x-aiow-quote-number") || ""; const bytes = await response.arrayBuffer();
      const expectedYear = new Date().toLocaleDateString("en", { timeZone: "Europe/Amsterdam", year: "numeric" });
      const magic = new TextDecoder().decode(bytes.slice(0, 5));
      if (!new RegExp(`^AIOW-${expectedYear}-[0-9]{4}$`).test(number) || magic !== "%PDF-") throw new Error("invalid pdf response");
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = `${number}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setQuoteNumber(number); setStatus("success");
    } catch { setStatus((current) => current === "success" ? current : "error"); }
    finally { sending.current = false; }
  }
  const explicitError = errorKind === 429 ? (en ? "Too many attempts. Your input is preserved; wait and retry." : "Te veel pogingen. Je invoer blijft staan; wacht en probeer opnieuw.") : errorKind === 503 ? (en ? "The durable quote service is unavailable. No PDF or receipt was created; your input is preserved." : "De duurzame offertevoorziening is niet beschikbaar. Er is geen PDF of ontvangstbewijs aangemaakt; je invoer blijft staan.") : errorKind === 502 ? (en ? "Durable acceptance of the lead, PDF and both mail jobs failed. No PDF was released; your input is preserved." : "Duurzame acceptatie van lead, PDF en beide mailtaken mislukte. Er is geen PDF vrijgegeven; je invoer blijft staan.") : (en ? "The request was not accepted. Check the fields or retry later; no PDF was released." : "De aanvraag is niet geaccepteerd. Controleer de velden of probeer later; er is geen PDF vrijgegeven.");
  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !sending.current) onClose(); }}>
    <div className={`${styles.modal} ${styles.quoteModal}`} role="dialog" aria-modal="true" aria-labelledby="quote-title" tabIndex={-1} ref={dialog}>
      <button type="button" className={styles.close} onClick={onClose} disabled={status === "sending"} aria-label={en ? "Close quote form" : "Offerteformulier sluiten"}>×</button>
      {status === "success" ? <div className={styles.success}><span className={styles.successMark}>✓</span><p className={styles.eyebrow}>{en ? "Durably accepted" : "Duurzaam geaccepteerd"}</p><h2 id="quote-title">{quoteNumber}</h2><p>{en ? "The lead, PDF and both mail jobs were accepted by the durable adapter. The PDF download has started." : "De lead, PDF en beide mailtaken zijn door de duurzame adapter geaccepteerd. De PDF-download is gestart."}</p><button type="button" className={styles.primaryButton} onClick={onClose}>{en ? "Close" : "Sluiten"}</button></div> : <form onSubmit={submit} noValidate>
        <p className={styles.eyebrow}>{en ? "Quote indication" : "Offerte-indicatie"}</p><h2 id="quote-title">{en ? "Your configuration, clearly documented." : "Je configuratie, helder vastgelegd."}</h2><p className={styles.quoteIntro}>{en ? "Prices are recomputed on the server. A PDF is released only after the lead, document and both mail jobs have been durably accepted." : "Prijzen worden op de server opnieuw berekend. De PDF komt pas vrij nadat lead, document en beide mailtaken duurzaam zijn geaccepteerd."}</p>
        <div className={styles.quoteSummary}><span>{calculatorConfig.segment === "business" ? (en ? "Business" : "Bedrijf") : calculatorConfig.segment === "building" ? (en ? "Building" : "Pand") : "Home"}</span><b>{calculatorConfig.segment === "business" ? `${calculatorConfig.people} ${en ? "people" : "mensen"}` : `${calculatorConfig.squareMetres} m²`}</b><span>{calculatorConfig.serviceRoute === "comfort" ? "Comfort" : (en ? "Standard" : "Standaard")}</span></div>
        <div className={styles.quoteGrid}>
          <fieldset className={styles.quoteSection}><legend>{en ? "Context and Smart Design" : "Context en Smart Design"}</legend>
            <label>{en ? "Context (optional)" : "Context (optioneel)"}<select value={form.contextSlug} onChange={(event) => update("contextSlug", event.target.value)}><option value="">{en ? "No selection" : "Geen selectie"}</option>{contextOptions.map((item) => <option key={item.slug} value={item.slug}>{en ? item.labelEn : item.labelNl}</option>)}</select></label>
            <div className={styles.checkGroup} aria-label="Smart Design modules">{(["scan", "blueprint", "supervision"] as const).map((module) => <label key={module}><input type="checkbox" checked={form.modules.includes(module)} onChange={() => toggleModule(module)} /><span>{module === "scan" ? "Scan" : module === "blueprint" ? (en ? "Blueprint" : "Blauwdruk") : (en ? "Supervision" : "Regie")}</span></label>)}</div>
            {form.modules.length > 0 && <><label>{en ? "Smart Design surface (m²)" : "Smart Design-oppervlakte (m²)"}<input type="number" min="25" max="100000" step="1" required value={form.designSquareMetres} onChange={(event) => update("designSquareMetres", event.target.value)} />{errors.smartDesignSquareMetres && <small>{errors.smartDesignSquareMetres}</small>}</label>{form.modules.some((item) => item !== "scan") && <label>{en ? "Technology budget (€; optional)" : "Technologiebudget (€; optioneel)"}<input type="number" min="0" max="100000000" step="1" value={form.technologyBudgetEuros} onChange={(event) => update("technologyBudgetEuros", event.target.value)} />{errors.technologyBudgetEuros && <small>{errors.technologyBudgetEuros}</small>}</label>}</>}
          </fieldset>
          <fieldset className={styles.quoteSection}><legend>{en ? "Contact" : "Contact"}</legend>
            <label>{en ? "Name" : "Naam"}<input autoComplete="name" maxLength={100} required value={form.name} onChange={(event) => update("name", event.target.value)} />{errors.name && <small>{errors.name}</small>}</label><label>E-mail<input type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={(event) => update("email", event.target.value)} />{errors.email && <small>{errors.email}</small>}</label><label>{en ? "Phone" : "Telefoon"}<input type="tel" autoComplete="tel" maxLength={32} required value={form.phone} onChange={(event) => update("phone", event.target.value)} />{errors.phone && <small>{errors.phone}</small>}</label>
            {calculatorConfig.segment === "home" ? <label>{en ? "Postcode" : "Postcode"}<input autoComplete="postal-code" maxLength={16} required value={form.postcode} onChange={(event) => update("postcode", event.target.value)} />{errors.postcode && <small>{errors.postcode}</small>}</label> : <label>{en ? "Company" : "Bedrijfsnaam"}<input autoComplete="organization" maxLength={120} required value={form.company} onChange={(event) => update("company", event.target.value)} />{errors.company && <small>{errors.company}</small>}</label>}
            <label>{en ? "Chamber of Commerce (optional)" : "KvK (optioneel)"}<input inputMode="numeric" maxLength={8} value={form.kvk} onChange={(event) => update("kvk", event.target.value)} />{errors.kvk && <small>{errors.kvk}</small>}</label><label>{en ? "Desired start (optional)" : "Gewenste start (optioneel)"}<input type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />{errors.startDate && <small>{errors.startDate}</small>}</label><label className={styles.quoteWide}>{en ? "Note (optional)" : "Opmerking (optioneel)"}<textarea rows={3} maxLength={2000} value={form.note} onChange={(event) => update("note", event.target.value)} />{errors.note && <small>{errors.note}</small>}</label>
          </fieldset>
        </div>
        <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
        <label className={styles.consent}><input type="checkbox" required checked={form.consentAccepted} onChange={(event) => update("consentAccepted", event.target.checked)} /><span>{en ? "I agree that AIOW processes these details to generate the transactional quote indication and contact me about this request. This is not newsletter consent. " : "Ik ga ermee akkoord dat AIOW deze gegevens verwerkt voor de transactionele offerte-indicatie en contact over deze aanvraag. Dit is geen nieuwsbriefinschrijving. "}<Link href="/privacy#quote" target="_blank">{en ? "Privacy explanation" : "Privacyuitleg"}</Link>.</span></label>{errors.consent && <small>{errors.consent}</small>}{errors.form && <p role="alert" className={styles.error}>{errors.form}</p>}{status === "error" && <p role="alert" className={styles.error}>{explicitError}</p>}
        <div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={onClose} disabled={status === "sending"}>{en ? "Cancel" : "Annuleren"}</button><button type="submit" disabled={status === "sending"} className={styles.primaryButton}>{status === "sending" ? (en ? "Securing…" : "Duurzaam vastleggen…") : (en ? "Generate and download PDF" : "Genereer en download PDF")}</button></div>
      </form>}
    </div>
  </div>;
}

export { PRICING_CONTEXT_SLUGS };
