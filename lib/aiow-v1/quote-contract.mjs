import { buildQuoteMailContent, buildQuoteSnapshot } from "./quote.mjs";
export function quoteRuntimeData(quote, options={}) {
  const c=quote.configuration; const smartModules=c.smartDesignModules;
  const square=c.squareMetres ?? (c.segment==="business" ? Math.max(25,c.people*12) : 25);
  const normalized={configuration:{segment:c.segment,...(c.segment==="home"?{homeSubtype:c.homeSubtype}:{}),serviceRoute:c.serviceRoute,...(c.segment==="business"?{people:c.people}:{squareMetres:c.squareMetres}),...(c.contextSlug?{contextSlug:c.contextSlug}:{}),smartDesign:{modules:smartModules,...(smartModules.length?{squareMetres:square,technologyBudgetEuros:0}:{})}},contact:Object.fromEntries(Object.entries(quote.contact).filter(([,v])=>v!==null)),consent:quote.consent,source:quote.source};
  return {normalized,snapshot:buildQuoteSnapshot(normalized,options)};
}
export function quoteMails(quote, quoteNumber, receivedAt, options={}) { const {normalized,snapshot}=quoteRuntimeData(quote,options); return {snapshot,...buildQuoteMailContent({quoteNumber,snapshot,contact:normalized.contact,source:normalized.source,country:quote.country,receivedAt})}; }
