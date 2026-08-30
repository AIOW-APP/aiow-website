"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { BOOKING_SLOTS } from "@/lib/aiow-v1/booking.mjs";
import { amsterdamDateISO } from "@/lib/aiow-v1/booking-runtime.mjs";
import { track } from "@/core/analytics/client";
import styles from "./AiowV1Homepage.module.css";

type Form = {
  subject: string; details: string; date: string; slot: string; name: string; email: string;
  company: string; website: string; consentAccepted: boolean; consentVersion: string;
};
const initial: Form = { subject: "bedrijf", details: "", date: "", slot: "", name: "", email: "", company: "", website: "", consentAccepted: false, consentVersion: "aiow-booking-v1" };
const focusableSelector = "button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function downloadIcs(form: Form, requestId: string, locale: "nl" | "en") {
  const [hour, minute] = form.slot.split(":").map(Number); const end = hour * 60 + minute + 45;
  const compactDate = form.date.replaceAll("-", ""); const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const en = locale === "en";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//AIOW//Scan booking//${en ? "EN" : "NL"}`, "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${requestId}@aiow.ai`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Amsterdam:${compactDate}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00`, `DTEND;TZID=Europe/Amsterdam:${compactDate}T${String(Math.floor(end / 60)).padStart(2, "0")}${String(end % 60).padStart(2, "0")}00`, `SUMMARY:${escapeIcs(`${en ? "AIOW introduction" : "AIOW kennismaking"} — ${form.subject}`)}`, `DESCRIPTION:${escapeIcs(en ? "AIOW received your booking request. Final practical confirmation follows directly." : "Boekingsaanvraag door AIOW ontvangen. De definitieve praktische afstemming volgt rechtstreeks.")}`, "END:VEVENT", "END:VCALENDAR"];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `aiow-scan-${form.date}.ics`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function BookingModal({ open, onClose, locale = "nl", returnFocus }: { open: boolean; onClose: () => void; locale?: "nl" | "en"; returnFocus?: HTMLElement | null }) {
  const [step, setStep] = useState(1); const [form, setForm] = useState<Form>(initial); const [errors, setErrors] = useState<Record<string, string>>({}); const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"); const [requestId, setRequestId] = useState("");
  const dialog = useRef<HTMLDivElement>(null); const operation = useRef({ fingerprint: "", key: "" }); const sending = useRef(false); const en = locale === "en";
  useEffect(() => {
    if (!open) return;
    void track("booking_opened", {});
    const previous = returnFocus || document.activeElement as HTMLElement | null;
    const dialogNode = dialog.current;
    const backdrop = dialogNode?.parentElement;
    const site = backdrop?.parentElement;
    const inertNodes = Array.from(site?.children || []).filter((node) => node !== backdrop) as HTMLElement[];
    inertNodes.forEach((node) => { node.inert = true; });
    const focusables = () => Array.from(dialogNode?.querySelectorAll<HTMLElement>(focusableSelector) || []).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
    const frame = requestAnimationFrame(() => (focusables()[0] || dialogNode)?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending.current) { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const items = focusables(); if (!items.length) { event.preventDefault(); dialogNode?.focus(); return; }
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", key); document.body.style.overflow = ""; inertNodes.forEach((node) => { node.inert = false; }); previous?.focus(); };
  }, [open, onClose, returnFocus]);
  if (!open) return null;
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); if (status === "error") setStatus("idle"); }
  function next() { const nextErrors: Record<string, string> = {}; if (step === 1 && !form.subject) nextErrors.subject = en ? "Choose a subject." : "Kies een onderwerp."; if (step === 2) { if (!form.date) nextErrors.date = en ? "Choose a date." : "Kies een datum."; if (!form.slot) nextErrors.slot = en ? "Choose a time." : "Kies een tijd."; } setErrors(nextErrors); if (!Object.keys(nextErrors).length) setStep((value) => Math.min(3, value + 1)); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (sending.current) return; sending.current = true; setStatus("sending"); setErrors({});
    const fingerprint = JSON.stringify({ ...form, locale });
    if (operation.current.fingerprint !== fingerprint) operation.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/booking", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": operation.current.key }, body: fingerprint });
      const body = await response.json(); if (!response.ok || !body.ok) { setErrors(body.fields || {}); void track("booking_failed", { failureClass: response.status === 429 ? "rate_limit" : response.status === 409 ? "conflict" : response.status >= 500 ? "unavailable" : "validation" }); throw new Error(body.error || "failed"); }
      setRequestId(body.requestId); setStatus("success"); void track("booking_succeeded", { experiment: null });
    } catch { setStatus("error"); }
    finally { sending.current = false; }
  }
  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !sending.current) onClose(); }}>
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="booking-title" tabIndex={-1} ref={dialog}>
      <button type="button" className={styles.close} onClick={onClose} disabled={status === "sending"} aria-label={en ? "Close" : "Sluiten"}>×</button>
      {status === "success" ? <div className={styles.success} role="status"><span className={styles.successMark}>✓</span><p className={styles.eyebrow}>{en ? "Durable receipt" : "Duurzaam ontvangstbewijs"}</p><h2 id="booking-title">{en ? "Your preferred scan request was received." : "Je voorkeur voor een scan is ontvangen."}</h2><p>{en ? "This does not reserve provider calendar capacity. A person will confirm the practical date and time separately. The optional ICS file is only a local reminder generated on your device." : "Dit reserveert geen capaciteit in een agenda van AIOW of een leverancier. Een mens bevestigt datum en tijd apart. Het optionele ICS-bestand is alleen een lokale herinnering die op je apparaat wordt gemaakt."}</p><button type="button" className={styles.primaryButton} onClick={() => downloadIcs(form, requestId, locale)}>{en ? "Download local reminder (.ics)" : "Download lokale herinnering (.ics)"}</button></div> : <form onSubmit={submit}>
        <p className={styles.eyebrow}>{en ? `Preferred request · step ${step} of 3` : `Voorkeursaanvraag · stap ${step} van 3`}</p><h2 id="booking-title">{en ? "Request a practical scan" : "Vraag een praktische scan aan"}</h2>
        <div className={styles.progress} aria-hidden="true"><i data-on={step >= 1} /><i data-on={step >= 2} /><i data-on={step >= 3} /></div>
        {step === 1 && <div className={styles.formFields}><label>{en ? "Subject" : "Onderwerp"}<select value={form.subject} onChange={(e) => update("subject", e.target.value)}><option value="bedrijf">{en ? "AI for business" : "AI voor bedrijf"}</option><option value="pand">Smart Office</option><option value="woning">Home</option><option value="anders">{en ? "Other" : "Anders"}</option></select></label><label>{en ? "Context (optional)" : "Toelichting (optioneel)"}<textarea maxLength={1200} rows={4} value={form.details} onChange={(e) => update("details", e.target.value)} /></label></div>}
        {step === 2 && <div className={styles.formFields}><label>{en ? "Date" : "Datum"}<input type="date" min={amsterdamDateISO(new Date(), 1)} required value={form.date} onChange={(e) => update("date", e.target.value)} />{errors.date && <small>{errors.date}</small>}</label><fieldset><legend>{en ? "Time (Europe/Amsterdam)" : "Tijd (Europe/Amsterdam)"}</legend><div className={styles.slots}>{BOOKING_SLOTS.map((slot) => <button type="button" key={slot} aria-pressed={form.slot === slot} onClick={() => update("slot", slot)}>{slot}</button>)}</div>{errors.slot && <small>{errors.slot}</small>}</fieldset></div>}
        {step === 3 && <div className={styles.formFields}><label>{en ? "Name" : "Naam"}<input autoComplete="name" maxLength={100} required value={form.name} onChange={(e) => update("name", e.target.value)} />{errors.name && <small>{errors.name}</small>}</label><label>E-mail<input type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={(e) => update("email", e.target.value)} />{errors.email && <small>{errors.email}</small>}</label><label>{en ? "Organisation (optional)" : "Organisatie (optioneel)"}<input autoComplete="organization" maxLength={120} value={form.company} onChange={(e) => update("company", e.target.value)} />{errors.company && <small>{errors.company}</small>}</label><label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label><label className={styles.consent}><input type="checkbox" required checked={form.consentAccepted} onChange={(e) => update("consentAccepted", e.target.checked)} /><span>{en ? "I agree that AIOW may use these details to handle this request. " : "Ik ga ermee akkoord dat AIOW deze gegevens gebruikt om mijn aanvraag te behandelen. "}<a href={en ? "/en/privacy#booking" : "/privacy#booking"} target="_blank">{en ? "Privacy explanation" : "Privacyuitleg"}</a>.</span></label>{errors.consentAccepted && <small>{errors.consentAccepted}</small>}{status === "error" && <p role="alert" className={styles.error}>{en ? "No confirmation was received. Your input is preserved; check it or retry later." : "Er kwam geen bevestiging terug. Je invoer blijft staan; controleer hem of probeer later opnieuw."}</p>}</div>}
        <div className={styles.modalActions}>{step > 1 && <button type="button" className={styles.textButton} onClick={() => setStep((value) => value - 1)}>{en ? "Back" : "Terug"}</button>}{step < 3 ? <button type="button" className={styles.primaryButton} onClick={next}>{en ? "Continue" : "Verder"}</button> : <button disabled={status === "sending"} className={styles.primaryButton}>{status === "sending" ? (en ? "Checking durable receipt…" : "Duurzame ontvangst controleren…") : (en ? "Send preferred request" : "Verstuur voorkeursaanvraag")}</button>}</div>
      </form>}
    </div>
  </div>;
}
