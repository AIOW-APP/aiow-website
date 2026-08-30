const BOOKING_SUBJECTS = Object.freeze({ bedrijf: "bedrijf", pand: "gebouw", gebouw: "gebouw", woning: "woning", anders: "anders" });
const QUOTE_ROUTES = Object.freeze({ nl: new Set(["/", "/booking", "/quote", "/knowledge", "/context"]), en: new Set(["/en", "/en/booking", "/en/quote", "/en/knowledge"]) });

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function nullable(value) { const valueText = text(value); return valueText || null; }

export function buildBookingRequest(form, locale) {
  return {
    schemaKind: "booking_request",
    subject: BOOKING_SUBJECTS[form.subject] ?? form.subject,
    details: text(form.details),
    date: form.date,
    slot: form.slot,
    name: text(form.name),
    email: text(form.email).toLowerCase(),
    company: text(form.company),
    locale,
    consentAccepted: form.consentAccepted,
    consentVersion: form.consentVersion,
  };
}

export function buildQuoteRequest(calculatorConfig, form, locale, routeValue) {
  const pathname = String(routeValue || "").split(/[?#]/, 1)[0];
  const route = QUOTE_ROUTES[locale]?.has(pathname) ? pathname : locale === "en" ? "/en" : "/";
  const segment = calculatorConfig.segment;
  return {
    schemaKind: "quote_request",
    configuration: {
      segment,
      serviceRoute: calculatorConfig.serviceRoute,
      contextSlug: nullable(form.contextSlug),
      people: segment === "business" ? calculatorConfig.people : null,
      squareMetres: segment === "business" ? null : calculatorConfig.squareMetres,
      homeSubtype: segment === "home" ? calculatorConfig.homeSubtype : null,
      smartDesignModules: [...form.modules],
    },
    contact: {
      name: text(form.name),
      email: text(form.email),
      phone: text(form.phone),
      company: nullable(form.company),
      postcode: nullable(form.postcode)?.toUpperCase().replace(/\s+/g, " ") ?? null,
      kvk: nullable(form.kvk),
      startDate: nullable(form.startDate),
      note: nullable(form.note),
    },
    consent: { accepted: form.consentAccepted, version: "aiow-quote-v1" },
    source: { route, locale },
    country: "NL",
  };
}
