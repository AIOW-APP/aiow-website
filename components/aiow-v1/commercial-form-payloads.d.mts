export type BookingFormPayloadInput = { subject:string; details:string; date:string; slot:string; name:string; email:string; company:string; consentAccepted:boolean; consentVersion:string; website?:string };
export type CalculatorPayloadInput = { segment:"business"|"building"|"home"; serviceRoute:"standard"|"comfort"; people?:number; squareMetres?:number; homeSubtype?:"home"|"signature" };
export type QuoteFormPayloadInput = { contextSlug:string; modules:("scan"|"blueprint"|"supervision")[]; name:string; email:string; phone:string; company:string; postcode:string; kvk:string; startDate:string; note:string; consentAccepted:boolean; website?:string };
export function buildBookingRequest(form:BookingFormPayloadInput,locale:"nl"|"en"):Record<string,unknown>;
export function buildQuoteRequest(calculatorConfig:CalculatorPayloadInput,form:QuoteFormPayloadInput,locale:"nl"|"en",routeValue:string):Record<string,unknown>;
