export const AIOW_COMPANY = Object.freeze({
  name: "AIOW",
  legalName: "AIOW B.V.",
  alternateName: "AI Operating Workflows",
  chamberOfCommerce: "71887466",
  streetAddress: "Bijlmermeerstraat 30",
  postalCode: "2131 HC",
  locality: "Hoofddorp",
  countryCode: "NL",
  countryNl: "Nederland",
  countryEn: "Netherlands",
  website: "https://aiow.ai",
  publicEmail: "info@aiow.io",
  publicPhone: null,
});

export function aiowAddressLine() {
  return `${AIOW_COMPANY.streetAddress}, ${AIOW_COMPANY.postalCode} ${AIOW_COMPANY.locality}`;
}
