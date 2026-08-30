import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const [header, css, home, calculator, context, pillar, tariffs, booking, privacy] = await Promise.all([
  readFile(new URL("components/aiow-v1/PublicHeader.tsx", root), "utf8"), readFile(new URL("components/aiow-v1/AiowV1Homepage.module.css", root), "utf8"),
  readFile(new URL("components/aiow-v1/AiowV1Homepage.tsx", root), "utf8"), readFile(new URL("components/aiow-v1/PriceCalculator.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/PricingContextPage.tsx", root), "utf8"), readFile(new URL("components/aiow-v1/PillarPage.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/TariffsPage.tsx", root), "utf8"), readFile(new URL("components/aiow-v1/BookingModal.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/InfoPage.tsx", root), "utf8"),
]);

test("responsive primary navigation remains keyboard operable and identifies the current page", () => {
  for (const token of ["aria-expanded={menuOpen}", "aria-controls=\"primary-navigation\"", "aria-current", "event.key === \"Escape\"", "menuButton.current?.focus()", "usePathname"]) assert.ok(header.includes(token), token);
  assert.match(css, /@media\(max-width:1000px\)[^]*\.menuButton\{display:/);
  assert.doesNotMatch(css, /@media\(max-width:1000px\)[^}]*\.header nav\{display:none/);
  assert.match(css, /@media\(max-width:600px\)[^]*\.mobileMenuCta/);
});

test("every V1 scan CTA uses the same exact localized request label", () => {
  const surfaces = `${header}\n${home}\n${calculator}\n${context}\n${pillar}\n${tariffs}`;
  assert.match(surfaces, /Request a scan/); assert.match(surfaces, /Vraag een scan aan/);
  for (const stale of ["Book a scan", "Book the scan", "Book the opportunity scan", "Plan een scan", "Plan de scan", "Plan de kansenscan", "Request scan", "Vraag scan aan", "Discuss the scope", "Bespreek de scope"]) assert.doesNotMatch(surfaces, new RegExp(stale));
});

test("human confirmation qualification is adjacent to the initial date and time choice", () => {
  const qualification = "A person confirms the date and time separately"; const nlQualification = "Een mens bevestigt datum en tijd apart";
  const stepTwo = booking.slice(booking.indexOf("step === 2"), booking.indexOf("step === 3"));
  assert.match(stepTwo, new RegExp(qualification)); assert.match(stepTwo, new RegExp(nlQualification));
  assert.ok(stepTwo.indexOf(qualification) < stepTwo.indexOf("BOOKING_SLOTS.map"));
});

test("NL and EN privacy copy disclose analytics fields, purpose, basis, recipients and retention controls", () => {
  for (const phrase of ["Privacyvriendelijke productanalyse", "event-ID, gebeurtenisnaam, tijdstip, route, taal", "gerechtvaardigd belang", "AIOW en onze contractuele hosting- en databaseverwerkers", "Ruwe analyticsgebeurtenissen en bijbehorend idempotentiemateriaal worden na 30 dagen verwijderd", "Geaggregeerde dagtotalen bevatten geen event-ID", "AIOW bepaalt en beoordeelt de bewaartermijn", "Privacy-friendly product analytics", "event ID, event name, timestamp, route, language", "legitimate interests", "AIOW and our contracted hosting and database processors", "Raw analytics events and associated idempotency material are deleted after 30 days", "Aggregated daily totals do not contain an event ID", "AIOW determines and reviews their retention period"]) assert.match(privacy, new RegExp(phrase));
});