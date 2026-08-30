"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/core/analytics/client";
import { PRICING_CONTEXT_SLUGS, pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import { httpFailureClass, type FailureClass } from "./booking-request";
import { buildQuoteRequest } from "./commercial-form-payloads.mjs";
import styles from "./AiowV1Homepage.module.css";

export type CalculatorQuoteConfig = { segment: "business" | "building" | "home"; serviceRoute: "standard" | "comfort"; people?: number; squareMetres?: number; homeSubtype?: "home" | "signature" };
type Form = { contextSlug: string; modules: ("scan" | "blueprint" | "supervision")[]; name: string; email: string; phone: string; company: string; postcode: string; kvk: string; startDate: string; note: string; website: string; consentAccepted: boolean };
const focusableSelector = "button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
const emptyForm: Form = { contextSlug: "", modules: [], name: "", email: "", phone: "", company: "", postcode: "", kvk: "", startDate: "", note: "", website: "", consentAccepted: false };
const CONTRACT_CONTEXT_SLUGS = new Set(["accountants", "business-services", "care", "education", "hospitality", "retail", "logistics", "manufacturing", "real-estate", "government", "woning", "bedrijfshal-industrie"]);
const englishFieldErrors: Record<string, string> = {
  "Kies een geldig segment.":"Choose a valid segment.", "Kies een geldige serviceroute.":"Choose a valid service route.", "Kies Home of Signature.":"Choose Home or Signature.", "Dit woningtype is hier niet van toepassing.":"This home type does not apply here.", "Vul 1 tot 10.000 personen in.":"Enter between 1 and 10,000 people.", "Oppervlakte is hier niet van toepassing.":"Surface area does not apply here.", "Vul 25 tot 100.000 m² in.":"Enter between 25 and 100,000 m².", "Teamgrootte is hier niet van toepassing.":"Team size does not apply here.", "Kies een geldige context.":"Choose a valid context.", "Kies geldige Smart Design-modules.":"Choose valid Smart Design modules.", "Vul een geldig technologiebudget in.":"Enter a valid technology budget.", "Smart Design-waarden vereisen een geselecteerde module.":"Smart Design values require a selected module.", "Vul een geldig telefoonnummer in.":"Enter a valid phone number.", "Vul een geldige postcode in.":"Enter a valid postcode.", "Vul de bedrijfsnaam in.":"Enter the company name.", "Vul een geldige bedrijfsnaam in.":"Enter a valid company name.", "Vul een geldig KvK-nummer in.":"Enter a valid Chamber of Commerce number.", "Vul een geldige startdatum in.":"Enter a valid start date.", "De opmerking is te lang.":"The note is too long.", "Ongeldige aanvraag.":"Invalid request.", "Toestemming is vereist.":"Consent is required.", "Ongeldige bron.":"Invalid source.",
};
function localizedFieldErrors(fields: Record<string, string>, en: boolean) { return en ? Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, englishFieldErrors[value] || "Check this field."])) : fields; }

export function QuoteModal({ open, onClose, locale = "nl", returnFocus, calculatorConfig }: { open: boolean; onClose: () => void; locale?: "nl" | "en"; returnFocus?: HTMLElement | null; calculatorConfig: CalculatorQuoteConfig | null }) {
  const [form, setForm] = useState<Form>(emptyForm); const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"); const [errorKind, setErrorKind] = useState<number>(0); const [quoteNumber, setQuoteNumber] = useState("");
  const dialog = useRef<HTMLDivElement>(null); const operation = useRef({ fingerprint: "", key: "" }); const sending = useRef(false); const en = locale === "en";
  function focusError() { requestAnimationFrame(() => { const node = dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-summary]'); node?.focus(); }); }
  const configFingerprint = JSON.stringify(calculatorConfig);
  useEffect(() => {
    if (!open || !calculatorConfig) return;
    setForm((current) => ({ ...current, contextSlug: "", modules: [] }));
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
  const contextOptions = useMemo(() => pricingContexts.filter((item) => CONTRACT_CONTEXT_SLUGS.has(item.slug) && (calculatorConfig?.segment === "business" ? item.category === "business" : item.category === "building")), [calculatorConfig?.segment]);
  if (!open || !calculatorConfig) return null;
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "", form: "" })); if (status === "error") setStatus("idle"); }
  function toggleModule(module: Form["modules"][number]) { update("modules", form.modules.includes(module) ? form.modules.filter((item) => item !== module) : [...form.modules, module]); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (sending.current) return;
    if (form.website) { setErrors({ form: en ? "Invalid request." : "Ongeldige aanvraag." }); setStatus("error"); focusError(); return; }
    const config = calculatorConfig!;
    const clientErrors: Record<string,string> = {};
    if (!form.name.trim()) clientErrors.name = en ? "Enter your name." : "Vul je naam in.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) clientErrors.email = en ? "Enter a valid email address." : "Vul een geldig e-mailadres in.";
    if (form.phone.trim().length < 6) clientErrors.phone = en ? "Enter a valid phone number." : "Vul een geldig telefoonnummer in.";
    if (config.segment === "home" ? !/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(form.postcode.trim()) : !form.company.trim()) clientErrors[config.segment === "home" ? "postcode" : "company"] = en ? (config.segment === "home" ? "Enter a valid postcode." : "Enter the company name.") : (config.segment === "home" ? "Vul een geldige postcode in." : "Vul de bedrijfsnaam in.");
    if (!form.consentAccepted) clientErrors.consent = en ? "Consent is required." : "Toestemming is vereist.";
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); setStatus("error"); setErrorKind(400); focusError(); return; }
    const payload = buildQuoteRequest(config, form, locale, location.pathname);
    const fingerprint = JSON.stringify(payload); if (operation.current.fingerprint !== fingerprint) operation.current = { fingerprint, key: crypto.randomUUID() };
    sending.current = true; setStatus("sending"); setErrors({}); setErrorKind(0);
    let failureTracked = false;
    const trackFailure = (failureClass: FailureClass) => { if (failureTracked) return; failureTracked = true; void track("quote_failed", { failureClass }); };
    try {
      const response = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": operation.current.key }, body: fingerprint });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.toLowerCase().startsWith("application/pdf")) {
        let body: { fields?: Record<string, string> } = {}; if (contentType.includes("application/json")) { try { body = await response.json(); } catch { /* generic failure below */ } }
        setErrors(localizedFieldErrors(body.fields || {}, en)); setErrorKind(response.status); trackFailure(response.ok ? "unavailable" : httpFailureClass(response.status)); focusError(); throw new Error("not durably accepted");
      }
      const number = response.headers.get("x-aiow-quote-number") || ""; const bytes = await response.arrayBuffer();
      const expectedYear = new Date().toLocaleDateString("en", { timeZone: "Europe/Amsterdam", year: "numeric" });
      const magic = new TextDecoder().decode(bytes.slice(0, 5));
      if (!new RegExp(`^AIOW-${expectedYear}-[0-9]{4}$`).test(number) || magic !== "%PDF-") throw new Error("invalid pdf response");
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = `${number}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setQuoteNumber(number); setStatus("success"); void track("quote_succeeded", { experiment: null });
    } catch { trackFailure("unavailable"); setStatus((current) => current === "success" ? current : "error"); focusError(); }
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
            <label>{en ? "Context (optional)" : "Context (optioneel)"}<select id="quote-context" value={form.contextSlug} aria-invalid={Boolean(errors.contextSlug)} aria-describedby={errors.contextSlug ? "quote-context-error" : undefined} onChange={(event) => update("contextSlug", event.target.value)}><option value="">{en ? "No selection" : "Geen selectie"}</option>{contextOptions.map((item) => <option key={item.slug} value={item.slug}>{en ? item.labelEn : item.labelNl}</option>)}</select>{errors.contextSlug && <small id="quote-context-error">{errors.contextSlug}</small>}</label>
            <div className={styles.checkGroup} aria-label="Smart Design modules">{(["scan", "blueprint", "supervision"] as const).map((module) => <label key={module}><input type="checkbox" checked={form.modules.includes(module)} onChange={() => toggleModule(module)} /><span>{module === "scan" ? "Scan" : module === "blueprint" ? (en ? "Blueprint" : "Blauwdruk") : (en ? "Supervision" : "Regie")}</span></label>)}</div>
            {form.modules.length > 0 && <p className={styles.quoteIntro}>{en ? "Smart Design uses the calculator surface (for Business: the canonical estimate of 12 m² per person, minimum 25 m²). The frozen quote request has no technology budget field, so technology budget is excluded rather than collected and discarded." : "Smart Design gebruikt de oppervlakte uit de calculator (voor Bedrijf: de canonieke schatting van 12 m² per persoon, minimaal 25 m²). De bevroren offerteaanvraag heeft geen veld voor technologiebudget; daarom vragen we geen bedrag dat vervolgens verloren zou gaan."}</p>}
          </fieldset>
          <fieldset className={styles.quoteSection}><legend>{en ? "Contact" : "Contact"}</legend>
            <label>{en ? "Name" : "Naam"}<input id="quote-name" autoComplete="name" maxLength={100} required value={form.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "quote-name-error" : undefined} onChange={(event) => update("name", event.target.value)} />{errors.name && <small id="quote-name-error">{errors.name}</small>}</label><label>E-mail<input id="quote-email" type="email" autoComplete="email" maxLength={254} required value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "quote-email-error" : undefined} onChange={(event) => update("email", event.target.value)} />{errors.email && <small id="quote-email-error">{errors.email}</small>}</label><label>{en ? "Phone" : "Telefoon"}<input id="quote-phone" type="tel" autoComplete="tel" maxLength={40} required value={form.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "quote-phone-error" : undefined} onChange={(event) => update("phone", event.target.value)} />{errors.phone && <small id="quote-phone-error">{errors.phone}</small>}</label>
            {calculatorConfig.segment === "home" ? <label>Postcode<input id="quote-postcode" autoComplete="postal-code" maxLength={16} required value={form.postcode} aria-invalid={Boolean(errors.postcode)} aria-describedby={errors.postcode ? "quote-postcode-error" : undefined} onChange={(event) => update("postcode", event.target.value)} />{errors.postcode && <small id="quote-postcode-error">{errors.postcode}</small>}</label> : <label>{en ? "Company" : "Bedrijfsnaam"}<input id="quote-company" autoComplete="organization" maxLength={120} required value={form.company} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "quote-company-error" : undefined} onChange={(event) => update("company", event.target.value)} />{errors.company && <small id="quote-company-error">{errors.company}</small>}</label>}
            <label>{en ? "Chamber of Commerce (optional)" : "KvK (optioneel)"}<input id="quote-kvk" inputMode="numeric" maxLength={8} value={form.kvk} aria-invalid={Boolean(errors.kvk)} aria-describedby={errors.kvk ? "quote-kvk-error" : undefined} onChange={(event) => update("kvk", event.target.value)} />{errors.kvk && <small id="quote-kvk-error">{errors.kvk}</small>}</label><label>{en ? "Desired start (optional)" : "Gewenste start (optioneel)"}<input id="quote-start-date" type="date" value={form.startDate} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? "quote-start-date-error" : undefined} onChange={(event) => update("startDate", event.target.value)} />{errors.startDate && <small id="quote-start-date-error">{errors.startDate}</small>}</label><label className={styles.quoteWide}>{en ? "Note (optional)" : "Opmerking (optioneel)"}<textarea id="quote-note" rows={3} maxLength={2000} value={form.note} aria-invalid={Boolean(errors.note)} aria-describedby={errors.note ? "quote-note-error" : undefined} onChange={(event) => update("note", event.target.value)} />{errors.note && <small id="quote-note-error">{errors.note}</small>}</label>
          </fieldset>
        </div>
        <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
        <label className={styles.consent}><input id="quote-consent" type="checkbox" required checked={form.consentAccepted} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "quote-consent-error" : undefined} onChange={(event) => update("consentAccepted", event.target.checked)} /><span>{en ? "I agree that AIOW processes these details to generate the transactional quote indication and contact me about this request. This is not newsletter consent. " : "Ik ga ermee akkoord dat AIOW deze gegevens verwerkt voor de transactionele offerte-indicatie en contact over deze aanvraag. Dit is geen nieuwsbriefinschrijving. "}<Link href={en ? "/en/privacy#quote" : "/privacy#quote"} target="_blank">{en ? "Privacy explanation" : "Privacyuitleg"}</Link>.</span></label>{errors.consent && <small id="quote-consent-error">{errors.consent}</small>}{(errors.form || status === "error") && <p role="alert" tabIndex={-1} data-error-summary className={styles.error}>{errors.form || explicitError}</p>}
        <div className={styles.modalActions}><button type="button" className={styles.textButton} onClick={onClose} disabled={status === "sending"}>{en ? "Cancel" : "Annuleren"}</button><button type="submit" disabled={status === "sending"} className={styles.primaryButton}>{status === "sending" ? (en ? "Securing…" : "Duurzaam vastleggen…") : (en ? "Generate and download PDF" : "Genereer en download PDF")}</button></div>
      </form>}
    </div>
  </div>;
}

export { PRICING_CONTEXT_SLUGS };
