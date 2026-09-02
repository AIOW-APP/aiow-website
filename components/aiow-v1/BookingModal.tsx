"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { BOOKING_SLOTS } from "@/lib/aiow-v1/booking.mjs";
import { amsterdamDateISO } from "@/lib/aiow-v1/booking-runtime.mjs";
import { track } from "@/core/analytics/client";
import { requestBooking } from "./booking-request";
import { buildBookingRequest } from "./commercial-form-payloads.mjs";
import styles from "./AiowV1Homepage.module.css";

type Form = {
  subject: string; details: string; date: string; slot: string; name: string; email: string;
  company: string; website: string; consentAccepted: boolean; consentVersion: string;
};
const initial: Form = { subject: "bedrijf", details: "", date: "", slot: "", name: "", email: "", company: "", website: "", consentAccepted: false, consentVersion: "aiow-booking-v1" };
const focusableSelector = "button:not([disabled]),a[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function downloadIcs(form: Form, requestId: string, locale: "nl" | "en") {
  const [hour, minute] = form.slot.split(":").map(Number); const end = hour * 60 + minute + 30;
  const compactDate = form.date.replaceAll("-", ""); const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const en = locale === "en";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//AIOW//Scan booking//${en ? "EN" : "NL"}`, "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${requestId}@aiow.ai`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Amsterdam:${compactDate}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00`, `DTEND;TZID=Europe/Amsterdam:${compactDate}T${String(Math.floor(end / 60)).padStart(2, "0")}${String(end % 60).padStart(2, "0")}00`, `SUMMARY:${escapeIcs(`${en ? "AIOW introduction" : "AIOW kennismaking"} — ${form.subject}`)}`, `DESCRIPTION:${escapeIcs(en ? "AIOW received your booking request. Final practical confirmation follows directly." : "Boekingsaanvraag door AIOW ontvangen. De definitieve praktische afstemming volgt rechtstreeks.")}`, "END:VEVENT", "END:VCALENDAR"];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `aiow-scan-${form.date}.ics`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function BookingModal({ open, onClose, locale = "nl", returnFocus }: { open: boolean; onClose: () => void; locale?: "nl" | "en"; returnFocus?: HTMLElement | null }) {
  const [step, setStep] = useState(1); const [form, setForm] = useState<Form>(initial); const [errors, setErrors] = useState<Record<string, string>>({}); const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"); const [requestId, setRequestId] = useState("");
  const dialog = useRef<HTMLDivElement>(null); const operation = useRef({ fingerprint: "", key: "" }); const sending = useRef(false); const en = locale === "en";
  function focusError() { requestAnimationFrame(() => { const node = dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-summary]'); node?.focus(); }); }
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
  function next() { const nextErrors: Record<string, string> = {}; if (step === 1) { if (!form.subject) nextErrors.subject = en ? "Choose a subject." : "Kies een onderwerp."; if (!form.details.trim()) nextErrors.details = en ? "Describe the context." : "Beschrijf de context."; } if (step === 2) { if (!form.date) nextErrors.date = en ? "Choose a date." : "Kies een datum."; if (!form.slot) nextErrors.slot = en ? "Choose a time." : "Kies een tijd."; } setErrors(nextErrors); if (!Object.keys(nextErrors).length) setStep((value) => Math.min(3, value + 1)); else focusError(); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (sending.current) return;
    if (form.website) { setErrors({ form: en ? "Invalid request." : "Ongeldige aanvraag." }); setStatus("error"); focusError(); return; }
    sending.current = true; setStatus("sending"); setErrors({});
    const fingerprint = JSON.stringify(buildBookingRequest(form, locale));
    if (operation.current.fingerprint !== fingerprint) operation.current = { fingerprint, key: crypto.randomUUID() };
    const result = await requestBooking(fetch, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": operation.current.key }, body: fingerprint }, track);
    if (result.ok) { setRequestId(result.requestId); setStatus("success"); }
    else { setErrors(result.fields); setStatus("error"); focusError(); }
    sending.current = false;
  }
  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !sending.current) onClose(); }}>
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="booking-title" tabIndex={-1} ref={dialog}>
      <button type="button" className={styles.close} onClick={onClose} disabled={status === "sending"} aria-label={en ? "Close" : "Sluiten"}>×</button>
      {status === "success" ? <div className={styles.success} role="status"><span className={styles.successMark}>✓</span><p className={styles.eyebrow}>{en ? "Request received" : "Aanvraag ontvangen"}</p><h2 id="booking-title">{en ? "Your scan request has been received." : "Uw scanaanvraag is ontvangen."}</h2><p>{en ? "A person will contact you to confirm the practical date and time. The optional ICS file is only a local reminder generated on your device." : "Een medewerker neemt contact op om de praktische datum en tijd te bevestigen. Het optionele ICS-bestand is alleen een lokale herinnering op uw apparaat."}</p><button type="button" className={styles.primaryButton} onClick={() => downloadIcs(form, requestId, locale)}>{en ? "Download local reminder (.ics)" : "Download lokale herinnering (.ics)"}</button></div> : <form onSubmit={submit}>
        <p className={styles.eyebrow}>{en ? `Scan request · step ${step} of 3` : `Scanaanvraag · stap ${step} van 3`}</p><h2 id="booking-title">{en ? "Request a practical scan" : "Vraag een praktische scan aan"}</h2>
        <div className={styles.progress} aria-hidden="true"><i data-on={step >= 1} /><i data-on={step >= 2} /><i data-on={step >= 3} /></div>
        {step === 1 && <div className={styles.formFields}><label>{en ? "What is this about?" : "Waar gaat het om?"}<select id="booking-subject" value={form.subject} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "booking-subject-error" : undefined} onChange={(e) => update("subject", e.target.value)}><option value="bedrijf">{en ? "My business" : "Mijn bedrijf"}</option><option value="pand">{en ? "My building" : "Mijn pand"}</option><option value="woning">{en ? "My home" : "Mijn woning"}</option><option value="anders">{en ? "Something else" : "Iets anders"}</option></select>{errors.subject && <small id="booking-subject-error">{errors.subject}</small>}</label><label>{en ? "What would you like to make easier?" : "Wat wilt u eenvoudiger maken?"}<textarea id="booking-details" maxLength={1200} rows={4} required value={form.details} aria-invalid={Boolean(errors.details)} aria-describedby={errors.details ? "booking-details-error" : undefined} onChange={(e) => update("details", e.target.value)} />{errors.details && <small id="booking-details-error">{errors.details}</small>}</label></div>}
        {step === 2 && <div className={styles.formFields}><p className={styles.bookingQualification}>{en ? "This is a preferred request, not a reservation. A person confirms the date and time separately." : "Dit is een voorkeursaanvraag, geen reservering. Een mens bevestigt datum en tijd apart."}</p><label>{en ? "Date" : "Datum"}<input id="booking-date" type="date" min={amsterdamDateISO(new Date(), 1)} required value={form.date} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "booking-date-error" : undefined} onChange={(e) => update("date", e.target.value)} />{errors.date && <small id="booking-date-error">{errors.date}</small>}</label><fieldset tabIndex={errors.slot ? -1 : undefined} aria-invalid={Boolean(errors.slot)} aria-describedby={errors.slot ? "booking-slot-error" : undefined}><legend>{en ? "Time (Europe/Amsterdam)" : "Tijd (Europe/Amsterdam)"}</legend><div className={styles.slots}>{BOOKING_SLOTS.map((slot) => <button type="button" key={slot} aria-pressed={form.slot === slot} onClick={() => update("slot", slot)}>{slot}</button>)}</div>{errors.slot && <small id="booking-slot-error">{errors.slot}</small>}</fieldset></div>}
        {step === 3 && <div className={styles.formFields}><label>{en ? "Name" : "Naam"}<input id="booking-name" autoComplete="name" maxLength={100} required value={form.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "booking-name-error" : undefined} onChange={(e) => update("name", e.target.value)} />{errors.name && <small id="booking-name-error">{errors.name}</small>}</label><label>E-mail<input id="booking-email" type="email" autoComplete="email" maxLength={254} required value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "booking-email-error" : undefined} onChange={(e) => update("email", e.target.value)} />{errors.email && <small id="booking-email-error">{errors.email}</small>}</label><label>{en ? "Organisation (optional)" : "Organisatie (optioneel)"}<input id="booking-company" autoComplete="organization" maxLength={120} value={form.company} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "booking-company-error" : undefined} onChange={(e) => update("company", e.target.value)} />{errors.company && <small id="booking-company-error">{errors.company}</small>}</label><label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label><label className={styles.consent}><input id="booking-consent" type="checkbox" required checked={form.consentAccepted} aria-invalid={Boolean(errors.consentAccepted)} aria-describedby={errors.consentAccepted ? "booking-consent-error" : undefined} onChange={(e) => update("consentAccepted", e.target.checked)} /><span>{en ? "I agree that AIOW may use these details to handle this request. " : "Ik ga ermee akkoord dat AIOW deze gegevens gebruikt om mijn aanvraag te behandelen. "}<a href={en ? "/en/privacy#booking" : "/privacy#booking"} target="_blank">{en ? "Privacy explanation" : "Privacyuitleg"}</a>.</span></label>{errors.consentAccepted && <small id="booking-consent-error">{errors.consentAccepted}</small>}{status === "error" && <p role="alert" tabIndex={-1} data-error-summary className={styles.error}>{errors.form || (en ? "No durable receipt was received. Your preference remains pending and your input is preserved; check it or retry later." : "Er kwam geen duurzaam ontvangstbewijs terug. Je voorkeur blijft in afwachting en je invoer blijft staan; controleer hem of probeer later opnieuw.")}</p>}</div>}
        <div className={styles.modalActions}>{step > 1 && <button type="button" className={styles.textButton} onClick={() => setStep((value) => value - 1)}>{en ? "Back" : "Terug"}</button>}{step < 3 ? <button type="button" className={styles.primaryButton} onClick={next}>{en ? "Continue" : "Verder"}</button> : <button disabled={status === "sending"} className={styles.primaryButton}>{status === "sending" ? (en ? "Sending…" : "Bezig…") : (en ? "Send scan request" : "Verstuur scanaanvraag")}</button>}</div>
      </form>}
    </div>
  </div>;
}
