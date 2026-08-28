import type { QuoteContact, QuoteSnapshot } from "./quote.mjs";
export function generateQuotePdf(input: { quoteNumber: string; snapshot: QuoteSnapshot; contact: QuoteContact }): Promise<Uint8Array>;
