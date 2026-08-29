import type { AiowLocale } from "./locale";
import { englishPricingContexts } from "./pricing-contexts-en";
import { getPricingContext, type PricingContext, type PricingContextSlug } from "./pricing-contexts";

export type LocalizedPricingContext = Omit<PricingContext, "title" | "introduction" | "automations" | "advice" | "packageLabel" | "calculationTitle" | "calculation" | "calculationTotal" | "links"> & {
  title: string; introduction: string;
  automations: readonly Readonly<{ title: string; body: string }>[];
  advice: string; packageLabel: string; calculationTitle: string;
  calculation: readonly string[]; calculationTotal: string;
  links: readonly Readonly<{ href: string; label: string }>[];
};

export function getLocalizedPricingContext(slug: string, locale: AiowLocale): LocalizedPricingContext | undefined {
  const context = getPricingContext(slug);
  if (!context) return undefined;
  if (locale === "nl") return context;
  return { ...context, ...englishPricingContexts[context.slug as PricingContextSlug] };
}
