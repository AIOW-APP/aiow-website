const euro = (amount) => Math.round(amount * 100);

export const BUSINESS_TIERS = Object.freeze([
  Object.freeze({ key: "start", label: "Start", maxPeople: 10, setupCents: euro(2950), monthlyPerPersonCents: euro(49), monthlyMinimumCents: euro(295), from: false }),
  Object.freeze({ key: "growth", label: "Growth", maxPeople: 50, setupCents: euro(7500), monthlyPerPersonCents: euro(59), monthlyMinimumCents: euro(795), from: false }),
  Object.freeze({ key: "accelerated", label: "Accelerated", maxPeople: 250, setupCents: euro(19500), monthlyPerPersonCents: euro(69), monthlyMinimumCents: euro(2950), from: false }),
  Object.freeze({ key: "private", label: "Private AI", maxPeople: Infinity, setupCents: euro(49500), monthlyPerPersonCents: euro(89), monthlyMinimumCents: euro(7500), from: true }),
]);

export const BUILDING_MODES = Object.freeze({
  office: Object.freeze({ key: "office", label: "Smart Office", setupPerSquareMetreCents: euro(65), setupMinimumCents: euro(9500), monthlyPerSquareMetreCents: euro(0.95), monthlyMinimumCents: euro(495), from: false, estimate: false }),
  officeXL: Object.freeze({ key: "office-xl", label: "Smart Office XL", setupPerSquareMetreCents: euro(45), setupMinimumCents: 0, monthlyPerSquareMetreCents: euro(0.75), monthlyMinimumCents: euro(1950), from: true, estimate: true }),
  home: Object.freeze({ key: "home", label: "AIOW Home", setupPerSquareMetreCents: euro(95), setupMinimumCents: euro(7500), monthlyPerSquareMetreCents: euro(1.25), monthlyMinimumCents: euro(225), from: false, estimate: false }),
  signature: Object.freeze({ key: "signature", label: "AIOW Signature", setupPerSquareMetreCents: euro(165), setupMinimumCents: euro(19500), monthlyPerSquareMetreCents: euro(1.95), monthlyMinimumCents: euro(495), from: false, estimate: false }),
});

export const SMART_DESIGN_SERVICES = Object.freeze({
  scan: Object.freeze({ key: "scan", label: "Smart Design Scan", perSquareMetreCents: euro(3.5), technologyBudgetRate: 0, minimumCents: euro(2950) }),
  blueprint: Object.freeze({ key: "blueprint", label: "Smart Design Blauwdruk", perSquareMetreCents: euro(12.5), technologyBudgetRate: 0.12, minimumCents: euro(9500) }),
  supervision: Object.freeze({ key: "supervision", label: "Smart Design Regie", perSquareMetreCents: euro(7.5), technologyBudgetRate: 0.05, minimumCents: euro(7500) }),
});

function positiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(Math.trunc(value))) {
    throw new TypeError(`${label} must be a positive finite number within the safe numeric range`);
  }
  return value;
}
function nonNegativeNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || !Number.isSafeInteger(Math.trunc(value))) {
    throw new TypeError(`${label} must be a non-negative finite number within the safe numeric range`);
  }
  return value;
}
function safeCents(value, label) {
  const rounded = Math.round(value);
  if (!Number.isSafeInteger(rounded)) throw new RangeError(`${label} must be a finite safe integer amount in cents`);
  return rounded;
}
function minimumState(setupRawCents, setupMinimumCents, monthlyRawCents, monthlyMinimumCents) {
  return Object.freeze({ setup: setupMinimumCents > 0 && setupRawCents <= setupMinimumCents, monthly: monthlyMinimumCents > 0 && monthlyRawCents <= monthlyMinimumCents });
}

export function calculateBusinessPrice(people) {
  positiveNumber(people, "people");
  if (!Number.isSafeInteger(people)) throw new TypeError("people must be a safe integer");
  const tier = BUSINESS_TIERS.find((candidate) => people <= candidate.maxPeople);
  const monthlyRawCents = safeCents(people * tier.monthlyPerPersonCents, "monthlyCents");
  const monthlyCents = safeCents(Math.max(tier.monthlyMinimumCents, monthlyRawCents), "monthlyCents");
  return Object.freeze({ kind:"business",tier:tier.key,label:tier.label,input:people,setupCents:safeCents(tier.setupCents,"setupCents"),monthlyCents,minimumApplied:Object.freeze({setup:false,monthly:monthlyRawCents <= tier.monthlyMinimumCents}),from:tier.from,estimate:tier.from });
}

export function calculateBuildingPrice(mode, squareMetres) {
  positiveNumber(squareMetres, "squareMetres");
  if (!["office", "home", "signature"].includes(mode)) throw new TypeError("mode must be office, home or signature");
  const model = mode === "office" && squareMetres > 2000 ? BUILDING_MODES.officeXL : BUILDING_MODES[mode];
  const setupRawCents = safeCents(squareMetres * model.setupPerSquareMetreCents, "setupCents");
  const monthlyRawCents = safeCents(squareMetres * model.monthlyPerSquareMetreCents, "monthlyCents");
  return Object.freeze({ kind:"building",tier:model.key,label:model.label,input:squareMetres,setupCents:safeCents(Math.max(model.setupMinimumCents,setupRawCents),"setupCents"),monthlyCents:safeCents(Math.max(model.monthlyMinimumCents,monthlyRawCents),"monthlyCents"),minimumApplied:minimumState(setupRawCents,model.setupMinimumCents,monthlyRawCents,model.monthlyMinimumCents),from:model.from,estimate:model.estimate });
}

export function calculateSmartDesignPrice(service, squareMetres, technologyBudgetEuros = 0) {
  positiveNumber(squareMetres, "squareMetres");
  nonNegativeNumber(technologyBudgetEuros, "technologyBudgetEuros");
  const model = SMART_DESIGN_SERVICES[service];
  if (!model) throw new TypeError("service must be scan, blueprint or supervision");
  const squareMetreCents = safeCents(squareMetres * model.perSquareMetreCents, "squareMetreCents");
  const technologyBudgetCents = safeCents(technologyBudgetEuros * model.technologyBudgetRate * 100, "technologyBudgetCents");
  const totalCents = safeCents(Math.max(squareMetreCents, technologyBudgetCents, model.minimumCents), "totalCents");
  const orderedAnchors = [["minimum",model.minimumCents],["technology-budget",technologyBudgetCents],["square-metres",squareMetreCents]];
  const determiningAnchors = Object.freeze(orderedAnchors.filter(([,amount]) => amount === totalCents).map(([anchor]) => anchor));
  return Object.freeze({ kind:"smart-design",service:model.key,label:model.label,squareMetres,technologyBudgetEuros,squareMetreCents,technologyBudgetCents,totalCents,minimumApplied:totalCents === model.minimumCents,determiningAnchor:determiningAnchors[0],determiningAnchors,from:true });
}

export function formatEuroCents(cents, locale = "nl-NL") {
  safeCents(cents, "cents");
  return new Intl.NumberFormat(locale, { style:"currency",currency:"EUR",maximumFractionDigits:cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

export const PRICING_EXCLUSIONS = Object.freeze(["Btw","Hardware en fysieke installatie","Cloud-, AI- en leveranciersgebruik"]);
