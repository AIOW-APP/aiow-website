import { calculateBuildingPrice, calculateBusinessPrice, PRICING_EXCLUSIONS } from "./pricing.mjs";

const SEGMENTS = new Set(["business", "building", "home"]);
const ROUTES = new Set(["standard", "comfort"]);
const HOME_TYPES = new Set(["home", "signature"]);

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function validateConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config) || !SEGMENTS.has(config.segment) || !ROUTES.has(config.serviceRoute)) throw new TypeError("invalid calculator decision config");
  if (config.segment === "business") {
    if (!exactKeys(config, ["segment", "serviceRoute", "people"]) || !Number.isSafeInteger(config.people) || config.people < 1 || config.people > 400) throw new TypeError("invalid business decision config");
  } else if (config.segment === "building") {
    if (!exactKeys(config, ["segment", "serviceRoute", "squareMetres"]) || !Number.isFinite(config.squareMetres) || config.squareMetres < 25 || config.squareMetres > 4000) throw new TypeError("invalid building decision config");
  } else if (!exactKeys(config, ["segment", "serviceRoute", "squareMetres", "homeSubtype"]) || !HOME_TYPES.has(config.homeSubtype) || !Number.isFinite(config.squareMetres) || config.squareMetres < 25 || config.squareMetres > 1000) {
    throw new TypeError("invalid home decision config");
  }
}

export function buildCalculatorDecision(config, locale = "nl") {
  validateConfig(config);
  if (!["nl", "en"].includes(locale)) throw new TypeError("locale must be nl or en");
  const en = locale === "en";
  const result = config.segment === "business"
    ? calculateBusinessPrice(config.people)
    : calculateBuildingPrice(config.segment === "building" ? "office" : config.homeSubtype, config.squareMetres);
  const quantity = config.segment === "business" ? `${config.people} ${en ? "people" : "mensen"}` : `${config.squareMetres} m²`;
  const fit = config.segment === "business"
    ? (en ? `${quantity} falls within the published ${result.label} tier.` : `${quantity} valt binnen het gepubliceerde pakket ${result.label}.`)
    : (en ? `${quantity} selects the published ${result.label} calculation.` : `${quantity} selecteert de gepubliceerde berekening ${result.label}.`);
  const minimums = [];
  if (result.minimumApplied.setup) minimums.push(en ? "The implementation minimum applies." : "Het implementatieminimum is van toepassing.");
  if (result.minimumApplied.monthly) minimums.push(en ? "The monthly management minimum applies." : "Het maandminimum voor beheer is van toepassing.");
  const route = config.serviceRoute === "standard"
    ? (en ? "Standard keeps third-party subscriptions and hardware directly with you." : "Standaard laat abonnementen en hardware rechtstreeks bij u.")
    : (en ? "Comfort adds provider-cost margins and requires automatic direct debit and hardware prepayment." : "Comfort voegt marges op leverancierskosten toe en vereist automatische incasso en vooruitbetaling van hardware.");
  return Object.freeze({
    schemaKind: "calculator_decision_summary",
    recommendation: result.label,
    fit,
    quantity,
    setupCents: result.setupCents,
    monthlyCents: result.monthlyCents,
    from: result.from,
    estimate: result.estimate,
    minimums: Object.freeze(minimums),
    route,
    exclusions: Object.freeze(en ? ["VAT", "Hardware and physical installation", "Cloud, AI and supplier usage"] : [...PRICING_EXCLUSIONS]),
    finalPriceDrivers: Object.freeze(en
      ? ["Verified workflow or space scope", "Technical and physical dependencies", "Actual third-party usage and selected service route"]
      : ["Geverifieerde scope van proces of ruimte", "Technische en fysieke afhankelijkheden", "Werkelijk derdegebruik en gekozen serviceroute"]),
    dominantAction: en ? "Generate quote indication" : "Genereer offerte-indicatie",
    secondaryAction: en ? "Request a scan instead" : "Vraag in plaats daarvan een scan aan",
    boundary: en ? "This is a decision aid, not a final offer or technical commitment." : "Dit is een beslissteun, geen eindofferte of technische toezegging.",
  });
}
