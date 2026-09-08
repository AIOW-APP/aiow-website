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
  // Keep the active contact until external incoming delivery and human access are proven.
  publicEmail: "info@aiow.io",
  // Target only; never render this as an active public contact.
  targetPublicEmail: "info@aiow.ai",
  // Sender cutover additionally needs outbound/authentication/provider proof.
  transactionalEmail: "info@aiow.io",
  publicPhone: null,
});

export function aiowAddressLine() {
  return `${AIOW_COMPANY.streetAddress}, ${AIOW_COMPANY.postalCode} ${AIOW_COMPANY.locality}`;
}
