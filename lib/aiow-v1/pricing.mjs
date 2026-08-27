const euro = (amount) => Math.round(amount * 100);

export const BUSINESS_TIERS = Object.freeze([
  Object.freeze({ key: "start", label: "Start", maxPeople: 10, setupCents: euro(4950), monthlyPerPersonCents: euro(29), monthlyMinimumCents: euro(245), from: false }),
  Object.freeze({ key: "growth", label: "Growth", maxPeople: 50, setupCents: euro(12500), monthlyPerPersonCents: euro(49), monthlyMinimumCents: 0, from: false }),
  Object.freeze({ key: "accelerated", label: "Accelerated", maxPeople: 250, setupCents: euro(24500), monthlyPerPersonCents: euro(69), monthlyMinimumCents: 0, from: false }),
  Object.freeze({ key: "private", label: "Private AI", maxPeople: Infinity, setupCents: euro(49500), monthlyPerPersonCents: euro(99), monthlyMinimumCents: 0, from: true }),
]);

export const BUILDING_MODES = Object.freeze({
  office: Object.freeze({ key: "office", label: "Smart Office", setupPerSquareMetreCents: euro(35), setupMinimumCents: euro(4950), monthlyPerSquareMetreCents: euro(0.75), monthlyMinimumCents: euro(345) }),
  home: Object.freeze({ key: "home", label: "Home", setupPerSquareMetreCents: euro(55), setupMinimumCents: euro(9950), monthlyPerSquareMetreCents: euro(1.25), monthlyMinimumCents: euro(395) }),
  signature: Object.freeze({ key: "signature", label: "Signature", setupPerSquareMetreCents: euro(85), setupMinimumCents: euro(19500), monthlyPerSquareMetreCents: euro(1.95), monthlyMinimumCents: euro(595) }),
});

function positiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive finite number`);
  }
  return value;
}

export function calculateBusinessPrice(people) {
  positiveNumber(people, "people");
  if (!Number.isInteger(people)) throw new TypeError("people must be an integer");
  const tier = BUSINESS_TIERS.find((candidate) => people <= candidate.maxPeople);
  const monthlyCents = Math.max(tier.monthlyMinimumCents, people * tier.monthlyPerPersonCents);
  return Object.freeze({
    kind: "business",
    tier: tier.key,
    label: tier.label,
    input: people,
    setupCents: tier.setupCents,
    monthlyCents,
    from: tier.from,
  });
}

export function calculateBuildingPrice(mode, squareMetres) {
  positiveNumber(squareMetres, "squareMetres");
  const model = BUILDING_MODES[mode];
  if (!model) throw new TypeError("mode must be office, home or signature");
  return Object.freeze({
    kind: "building",
    tier: model.key,
    label: model.label,
    input: squareMetres,
    setupCents: Math.max(model.setupMinimumCents, Math.round(squareMetres * model.setupPerSquareMetreCents)),
    monthlyCents: Math.max(model.monthlyMinimumCents, Math.round(squareMetres * model.monthlyPerSquareMetreCents)),
    from: false,
  });
}

export function formatEuroCents(cents, locale = "nl-NL") {
  if (!Number.isInteger(cents)) throw new TypeError("cents must be an integer");
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

export const PRICING_EXCLUSIONS = Object.freeze([
  "Hardware en installatie",
  "Cloud- en AI-gebruik",
]);
