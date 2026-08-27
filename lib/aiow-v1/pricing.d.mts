export type PriceResult = Readonly<{ kind: "business" | "building"; tier: string; label: string; input: number; setupCents: number; monthlyCents: number; from: boolean }>;
export const BUSINESS_TIERS: readonly Readonly<{ key: string; label: string; maxPeople: number; setupCents: number; monthlyPerPersonCents: number; monthlyMinimumCents: number; from: boolean }>[];
export const BUILDING_MODES: Readonly<Record<"office" | "home" | "signature", Readonly<{ key: string; label: string; setupPerSquareMetreCents: number; setupMinimumCents: number; monthlyPerSquareMetreCents: number; monthlyMinimumCents: number }>>>;
export function calculateBusinessPrice(people: number): PriceResult;
export function calculateBuildingPrice(mode: "office" | "home" | "signature", squareMetres: number): PriceResult;
export function formatEuroCents(cents: number, locale?: string): string;
export const PRICING_EXCLUSIONS: readonly string[];
