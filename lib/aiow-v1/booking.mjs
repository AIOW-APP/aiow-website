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
  const locale = input && typeof input === "object" && !Array.isArray(input) && input.locale === "en" ? "en" : "nl";
  const message = (nl, en) => locale === "en" ? en : nl;
  if (!input || typeof input !== "object" || Array.isArray(input) || Number.isNaN(now.getTime())) {
    return { ok: false, errors: { form: message("Ongeldige aanvraag.", "Invalid request.") } };
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
    locale,
  };
  const errors = {};
  if (input.locale !== undefined && !["nl", "en"].includes(clean(input.locale))) errors.form = message("Ongeldige aanvraag.", "Invalid request.");
  if (!BOOKING_SUBJECTS.includes(data.subject)) errors.subject = message("Kies een geldig onderwerp.", "Choose a valid subject.");
  if (data.details.length > LIMITS.details) errors.details = message("De toelichting is te lang.", "The explanation is too long.");
  if (!validCalendarDate(data.date)) errors.date = message("Kies een geldige datum.", "Choose a valid date.");
  else if (data.date <= amsterdamDateISO(now)) errors.date = message("Kies een datum in de toekomst.", "Choose a future date.");
  if (!BOOKING_SLOTS.includes(data.slot)) errors.slot = message("Kies een geldig tijdstip.", "Choose a valid time.");
  if (!data.name) errors.name = message("Vul je naam in.", "Enter your name.");
  else if (data.name.length > LIMITS.name) errors.name = message("De naam is te lang.", "The name is too long.");
  if (!EMAIL.test(data.email) || data.email.length > LIMITS.email) errors.email = message("Vul een geldig e-mailadres in.", "Enter a valid email address.");
  if (data.company.length > LIMITS.company) errors.company = message("De organisatienaam is te lang.", "The organisation name is too long.");
  if (data.website.length > LIMITS.website || data.website) errors.form = message("Ongeldige aanvraag.", "Invalid request.");
  if (!data.consentAccepted || data.consentVersion !== "aiow-booking-v1") errors.consentAccepted = message("Toestemming is vereist.", "Consent is required.");

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
