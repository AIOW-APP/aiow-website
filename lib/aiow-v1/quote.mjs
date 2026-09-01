import { calculateBuildingPrice, calculateBusinessPrice, calculateSmartDesignPrice, formatEuroCents } from "./pricing.mjs";

export const QUOTE_CONTEXT_SLUGS = Object.freeze([
  "accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren",
  "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject",
]);
export const QUOTE_SMART_DESIGN_MODULES = Object.freeze(["scan", "blueprint", "supervision"]);
export const QUOTE_CONSENT_VERSION = "aiow-quote-v1";
export const QUOTE_VALIDITY_DAYS = 30;
export const QUOTE_QUALIFICATION_NL = "Offerte-indicatie · vanaf · excl. btw · excl. hardware en installatie · excl. cloud-, AI- en leveranciersgebruik · definitief na gratis AI-kansenscan.";
export const QUOTE_QUALIFICATION_EN = "Quote indication · from · excluding VAT · excluding hardware and installation · excluding cloud, AI and supplier usage · final after a free AI opportunity scan.";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+0-9][0-9 ()./-]{5,30}$/;
const POSTCODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
const KVK = /^[0-9]{8}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CONTROL = /[\u0000-\u001F\u007F]/;
const LIMITS = Object.freeze({ name: 100, email: 254, phone: 32, company: 120, postcode: 16, kvk: 8, note: 2000, honeypot: 200, route: 240, utm: 200 });
const ROOT_KEYS = new Set(["configuration", "contact", "consent", "source", "website"]);
const CONFIG_KEYS = new Set(["segment", "homeSubtype", "serviceRoute", "people", "squareMetres", "contextSlug", "smartDesign"]);
const CONTACT_KEYS = new Set(["name", "email", "phone", "company", "postcode", "kvk", "startDate", "note"]);
const CONSENT_KEYS = new Set(["accepted", "version"]);
const SOURCE_KEYS = new Set(["route", "utm", "locale"]);
const SMART_KEYS = new Set(["modules", "squareMetres", "technologyBudgetEuros"]);

function plain(value) { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function hasOnly(value, keys) { return plain(value) && Object.keys(value).every((key) => keys.has(key)); }
function clean(value) { return typeof value === "string" ? value.trim() : null; }
function optional(value) { if (value === undefined || value === "") return ""; return clean(value); }
function boundedInteger(value, min, max) { return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max; }
function validCalendarDate(value) {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
function field(errors, key, condition, message) { if (!condition) errors[key] = message; }
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const item of Object.values(value)) freeze(item); }
  return value;
}

export function validateQuoteRequest(input) {
  const errors = {};
  if (!hasOnly(input, ROOT_KEYS) || !hasOnly(input.configuration, CONFIG_KEYS) || !hasOnly(input.contact, CONTACT_KEYS) || !hasOnly(input.consent, CONSENT_KEYS) || !hasOnly(input.source, SOURCE_KEYS)) {
    return { ok: false, errors: { form: "Ongeldige aanvraag." } };
  }
  const config = input.configuration;
  const contactInput = input.contact;
  const sourceInput = input.source;
  const segment = clean(config.segment);
  const serviceRoute = clean(config.serviceRoute);
  const homeSubtype = optional(config.homeSubtype);
  field(errors, "segment", ["business", "building", "home"].includes(segment), "Kies een geldig segment.");
  field(errors, "serviceRoute", ["standard", "comfort"].includes(serviceRoute), "Kies een geldige serviceroute.");
  if (segment === "home") field(errors, "homeSubtype", ["home", "signature"].includes(homeSubtype), "Kies Home of Signature.");
  else if (homeSubtype !== "") errors.homeSubtype = "Dit woningtype is hier niet van toepassing.";

  let people;
  let squareMetres;
  if (segment === "business") {
    people = config.people;
    field(errors, "people", boundedInteger(people, 1, 10_000), "Vul 1 tot 10.000 personen in.");
    if (config.squareMetres !== undefined) errors.squareMetres = "Oppervlakte is hier niet van toepassing.";
  } else if (segment === "building" || segment === "home") {
    squareMetres = config.squareMetres;
    field(errors, "squareMetres", boundedInteger(squareMetres, 25, 100_000), "Vul 25 tot 100.000 m² in.");
    if (config.people !== undefined) errors.people = "Teamgrootte is hier niet van toepassing.";
  }

  const contextSlug = optional(config.contextSlug);
  if (contextSlug === null || (contextSlug && !QUOTE_CONTEXT_SLUGS.includes(contextSlug))) errors.contextSlug = "Kies een geldige context.";

  const smart = config.smartDesign === undefined ? { modules: [], squareMetres: undefined, technologyBudgetEuros: undefined } : config.smartDesign;
  if (!hasOnly(smart, SMART_KEYS) || !Array.isArray(smart.modules) || smart.modules.some((item) => typeof item !== "string") || new Set(smart.modules).size !== smart.modules.length || smart.modules.some((item) => !QUOTE_SMART_DESIGN_MODULES.includes(item))) {
    errors.smartDesign = "Kies geldige Smart Design-modules.";
  }
  const modules = Array.isArray(smart.modules) ? smart.modules.filter((item) => QUOTE_SMART_DESIGN_MODULES.includes(item)) : [];
  let designSquareMetres;
  let technologyBudgetEuros = 0;
  if (modules.length) {
    designSquareMetres = smart.squareMetres ?? squareMetres;
    field(errors, "smartDesignSquareMetres", boundedInteger(designSquareMetres, 25, 100_000), "Vul 25 tot 100.000 Smart Design m² in.");
    if (smart.technologyBudgetEuros !== undefined) {
      technologyBudgetEuros = smart.technologyBudgetEuros;
      field(errors, "technologyBudgetEuros", boundedInteger(technologyBudgetEuros, 0, 100_000_000), "Vul een geldig technologiebudget in.");
    }
  } else if (smart.squareMetres !== undefined || smart.technologyBudgetEuros !== undefined) errors.smartDesign = "Smart Design-waarden vereisen een geselecteerde module.";

  const name = clean(contactInput.name); const email = clean(contactInput.email)?.toLowerCase(); const phone = clean(contactInput.phone);
  const company = optional(contactInput.company); const postcodeRaw = optional(contactInput.postcode); const postcode = typeof postcodeRaw === "string" ? postcodeRaw.toUpperCase().replace(/\s+/g, " ") : postcodeRaw;
  const kvk = optional(contactInput.kvk); const startDate = optional(contactInput.startDate); const note = optional(contactInput.note);
  field(errors, "name", typeof name === "string" && name.length >= 1 && name.length <= LIMITS.name && !CONTROL.test(name), "Vul een geldige naam in.");
  field(errors, "email", typeof email === "string" && email.length <= LIMITS.email && EMAIL.test(email), "Vul een geldig e-mailadres in.");
  field(errors, "phone", typeof phone === "string" && phone.length <= LIMITS.phone && PHONE.test(phone), "Vul een geldig telefoonnummer in.");
  if (segment === "home") field(errors, "postcode", typeof postcode === "string" && postcode.length <= LIMITS.postcode && POSTCODE.test(postcode), "Vul een geldige postcode in.");
  else field(errors, "company", typeof company === "string" && company.length >= 1 && company.length <= LIMITS.company && !CONTROL.test(company), "Vul de bedrijfsnaam in.");
  if (company === null || (company && (company.length > LIMITS.company || CONTROL.test(company)))) errors.company = "Vul een geldige bedrijfsnaam in.";
  if (postcode === null || (postcode && (postcode.length > LIMITS.postcode || !POSTCODE.test(postcode)))) errors.postcode = "Vul een geldige postcode in.";
  if (kvk === null || (kvk && (!KVK.test(kvk) || kvk.length > LIMITS.kvk))) errors.kvk = "Vul een geldig KvK-nummer in.";
  if (startDate === null || (startDate && !validCalendarDate(startDate))) errors.startDate = "Vul een geldige startdatum in.";
  if (note === null || (note && note.length > LIMITS.note)) errors.note = "De opmerking is te lang.";

  const website = optional(input.website);
  if (website === null || website || (typeof website === "string" && website.length > LIMITS.honeypot)) errors.form = "Ongeldige aanvraag.";
  if (input.consent.accepted !== true || input.consent.version !== QUOTE_CONSENT_VERSION) errors.consent = "Toestemming is vereist.";
  const route = clean(sourceInput.route); const utm = optional(sourceInput.utm); const locale = clean(sourceInput.locale);
  field(errors, "source", typeof route === "string" && route.startsWith("/") && !route.startsWith("//") && route.length <= LIMITS.route && ["nl", "en"].includes(locale) && typeof utm === "string" && utm.length <= LIMITS.utm, "Ongeldige bron.");

  if (Object.keys(errors).length) return { ok: false, errors };
  const normalized = {
    configuration: { segment, ...(segment === "home" ? { homeSubtype } : {}), serviceRoute, ...(segment === "business" ? { people } : { squareMetres }), ...(contextSlug ? { contextSlug } : {}), smartDesign: { modules, ...(modules.length ? { squareMetres: designSquareMetres, technologyBudgetEuros } : {}) } },
    contact: { name, email, phone, ...(company ? { company } : {}), ...(postcode ? { postcode } : {}), ...(kvk ? { kvk } : {}), ...(startDate ? { startDate } : {}), ...(note ? { note } : {}) },
    consent: { accepted: true, version: QUOTE_CONSENT_VERSION }, source: { route, ...(utm ? { utm } : {}), locale },
  };
  return { ok: true, data: freeze(normalized) };
}

export function buildQuoteSnapshot(normalized, options = {}) {
  if (!normalized || !plain(normalized.configuration)) throw new TypeError("normalized quote data required");
  const c = normalized.configuration;
  const primary = c.segment === "business" ? calculateBusinessPrice(c.people) : calculateBuildingPrice(c.segment === "building" ? "office" : c.homeSubtype, c.squareMetres);
  const englishSmartLabels = { scan: "Smart Design Scan", blueprint: "Smart Design Blueprint", supervision: "Smart Design Supervision" };
  const smartDesign = c.smartDesign.modules.map((service) => {
    const result = calculateSmartDesignPrice(service, c.smartDesign.squareMetres, c.smartDesign.technologyBudgetEuros);
    return normalized.source.locale === "en" ? { ...result, label: englishSmartLabels[result.service] } : result;
  });
  const issueDate = options.issueDate || amsterdamDateISO(options.now || new Date());
  if (!validCalendarDate(issueDate)) throw new TypeError("issueDate must be a calendar date");
  const validUntil = addCalendarDays(issueDate, QUOTE_VALIDITY_DAYS);
  return freeze({ schemaVersion: 1, locale: normalized.source.locale, issueDate, validUntil, configuration: c, primary, smartDesign, comfort: c.serviceRoute === "comfort" ? { subscriptions: "provider cost + 25%", providerIncreases: "1-to-1 + 25% margin", hardware: "cost + 15%", thirdPartyCostsIncluded: false } : null, qualification: normalized.source.locale === "en" ? QUOTE_QUALIFICATION_EN : QUOTE_QUALIFICATION_NL, bookingUrl: options.bookingUrl || (normalized.source.locale === "en" ? "https://aiow.ai/en#booking" : "https://aiow.ai/#booking") });
}

export function buildQuoteMailContent({ quoteNumber, snapshot, contact, source, country = "", receivedAt }) {
  if (!validateQuoteNumber(quoteNumber, Number(snapshot.issueDate.slice(0, 4)))) throw new TypeError("invalid quote number");
  if (typeof receivedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(receivedAt) || Number.isNaN(Date.parse(receivedAt))) throw new TypeError("invalid receivedAt");
  const en = snapshot.locale === "en"; const moneyLocale = en ? "en-IE" : "nl-NL";
  const primary = snapshot.primary; const setup = formatEuroCents(primary.setupCents, moneyLocale); const monthly = formatEuroCents(primary.monthlyCents, moneyLocale);
  const smartRows = snapshot.smartDesign.map((item) => `${item.label}: ${formatEuroCents(item.totalCents, moneyLocale)}`);
  const greeting = en ? `Dear ${contact.name},` : `Beste ${contact.name},`;
  const customerText = [
    greeting, "",
    en ? `Attached is your AIOW quote indication ${quoteNumber}.` : `Bijgaand ontvangt u uw AIOW offerte-indicatie ${quoteNumber}.`,
    `${en ? "Implementation" : "Aansluiting"}: ${setup}`,
    `${en ? "Management per month" : "Beheer per maand"}: ${monthly}`,
    ...smartRows, "", snapshot.qualification,
    en ? `Valid through ${snapshot.validUntil}.` : `Geldig tot en met ${snapshot.validUntil}.`,
    en ? `Request a scan: ${snapshot.bookingUrl}` : `Vraag een scan aan: ${snapshot.bookingUrl}`,
    en ? "This is a preferred request, not a reservation. A person confirms the date and time separately." : "Dit is een voorkeursaanvraag, geen reservering. Een mens bevestigt datum en tijd apart.",
  ].join("\n");
  const customerSubject = en ? `Your AIOW quote indication ${quoteNumber}` : `Uw AIOW offerte-indicatie ${quoteNumber}`;
  const leadName = contact.company || contact.name;
  const internalSubject = `🔔 LEAD: ${leadName} — ${primary.label} — ${monthly}/mnd`;
  const internalText = [`Quote: ${quoteNumber}`, `Ontvangen: ${receivedAt}`, `Lead: ${leadName}`, `Naam: ${contact.name}`, `E-mail: ${contact.email}`, `Telefoon: ${contact.phone}`, contact.postcode ? `Postcode: ${contact.postcode}` : "", contact.kvk ? `KvK: ${contact.kvk}` : "", `Configuratie: ${snapshot.configuration.segment} / ${primary.label} / ${snapshot.configuration.serviceRoute}`, `Aansluiting: ${setup}`, `Maand: ${monthly}`, ...smartRows, snapshot.configuration.contextSlug ? `Context: ${snapshot.configuration.contextSlug}` : "", `Bron: ${source.route}${source.utm ? ` · ${source.utm}` : ""}`, `Taal: ${snapshot.locale}`, country ? `IP-land: ${country}` : "IP-land: onbekend", contact.startDate ? `Gewenste start: ${contact.startDate}` : "", contact.note ? `Opmerking:\n${contact.note}` : ""].filter(Boolean).join("\n");
  return freeze({
    customerMail: { from: "info@aiow.io", to: [contact.email], subject: customerSubject, text: customerText, html: textToSafeHtml(customerText, snapshot.bookingUrl) },
    internalMail: { from: "info@aiow.io", to: ["info@aiow.io"], subject: internalSubject, text: internalText, html: textToSafeHtml(internalText) },
  });
}

export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]); }
function textToSafeHtml(value, ctaUrl) { const body = escapeHtml(value).replace(/\n/g, "<br>\n"); return ctaUrl ? `<p>${body}</p><p><a href="${escapeHtml(ctaUrl)}">${escapeHtml(ctaUrl)}</a></p>` : `<p>${body}</p>`; }
export function validateQuoteNumber(value, expectedYear) { return typeof value === "string" && Number.isSafeInteger(expectedYear) && new RegExp(`^AIOW-${expectedYear}-[0-9]{4}$`).test(value); }
export function amsterdamDateISO(now = new Date()) { if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError("now must be valid"); return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
function addCalendarDays(date, days) { const [year, month, day] = date.split("-").map(Number); return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10); }
