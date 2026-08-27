export const BOOKING_SUBJECTS = Object.freeze(["bedrijf", "pand", "woning", "anders"]);
export const BOOKING_SLOTS = Object.freeze(["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"]);
import { amsterdamDateISO } from "./booking-runtime.mjs";

const LIMITS = Object.freeze({ name: 100, email: 254, company: 120, details: 1200, website: 200 });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function clean(value) { return typeof value === "string" ? value.trim() : ""; }
function validCalendarDate(value) {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
export function validateBooking(input, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  if (!input || typeof input !== "object" || Array.isArray(input) || Number.isNaN(now.getTime())) {
    return { ok: false, errors: { form: "Ongeldige aanvraag." } };
  }

  const data = {
    subject: clean(input.subject),
    details: clean(input.details),
    date: clean(input.date),
    slot: clean(input.slot),
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    company: clean(input.company),
    website: clean(input.website),
    consentAccepted: input.consentAccepted === true,
    consentVersion: clean(input.consentVersion),
  };
  const errors = {};
  if (!BOOKING_SUBJECTS.includes(data.subject)) errors.subject = "Kies een geldig onderwerp.";
  if (data.details.length > LIMITS.details) errors.details = "De toelichting is te lang.";
  if (!validCalendarDate(data.date)) errors.date = "Kies een geldige datum.";
  else if (data.date <= amsterdamDateISO(now)) errors.date = "Kies een datum in de toekomst.";
  if (!BOOKING_SLOTS.includes(data.slot)) errors.slot = "Kies een geldig tijdstip.";
  if (!data.name) errors.name = "Vul je naam in.";
  else if (data.name.length > LIMITS.name) errors.name = "De naam is te lang.";
  if (!EMAIL.test(data.email) || data.email.length > LIMITS.email) errors.email = "Vul een geldig e-mailadres in.";
  if (data.company.length > LIMITS.company) errors.company = "De organisatienaam is te lang.";
  if (data.website.length > LIMITS.website || data.website) errors.form = "Ongeldige aanvraag.";
  if (!data.consentAccepted || data.consentVersion !== "aiow-booking-v1") errors.consentAccepted = "Toestemming is vereist.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
