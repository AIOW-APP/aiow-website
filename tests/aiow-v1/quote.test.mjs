import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { amsterdamDateISO, buildQuoteMailContent, buildQuoteSnapshot, escapeHtml, validateQuoteNumber, validateQuoteRequest } from "../../lib/aiow-v1/quote.mjs";
import { generateQuotePdf } from "../../lib/aiow-v1/quote-pdf.mjs";

const base = {
  configuration: { segment: "business", serviceRoute: "standard", people: 8, contextSlug: "accountants", smartDesign: { modules: [] } },
  contact: { name: " Ada Lovelace ", email: " ADA@Example.com ", phone: "+31 20 123 4567", company: " Analytical Engines ", kvk: "12345678", startDate: "2026-09-30", note: "Bronnen & controle" },
  consent: { accepted: true, version: "aiow-quote-v1" }, source: { route: "/?utm_source=test", utm: "utm_source=test", locale: "nl" }, website: "",
};
function valid(input = base) { const result = validateQuoteRequest(input); assert.equal(result.ok, true, JSON.stringify(result)); return result.data; }

test("business request is strict, trimmed and server priced", () => {
  const data = valid(); assert.equal(data.contact.email, "ada@example.com"); assert.equal(data.contact.company, "Analytical Engines");
  const quote = buildQuoteSnapshot(data, { issueDate: "2026-08-28" });
  assert.equal(quote.primary.tier, "start"); assert.equal(quote.primary.setupCents, 295000); assert.equal(quote.primary.monthlyCents, 39200); assert.equal(quote.validUntil, "2026-09-27");
});

test("client totals and unknown fields are never trusted", () => {
  for (const input of [{ ...base, totalCents: 1 }, { ...base, configuration: { ...base.configuration, setupCents: 1 } }, { ...base, contact: { ...base.contact, extra: "x" } }]) assert.equal(validateQuoteRequest(input).ok, false);
});

test("conditional company and private postcode fail closed", () => {
  const noCompany = validateQuoteRequest({ ...base, contact: { ...base.contact, company: "" } }); assert.equal(noCompany.ok, false); assert.ok(noCompany.errors.company);
  const home = { ...base, configuration: { segment: "home", homeSubtype: "home", serviceRoute: "standard", squareMetres: 140, contextSlug: "woning", smartDesign: { modules: [] } }, contact: { ...base.contact, company: "", postcode: "2132 AB" } };
  assert.equal(validateQuoteRequest(home).ok, true);
  const noPostcode = validateQuoteRequest({ ...home, contact: { ...home.contact, postcode: "" } }); assert.equal(noPostcode.ok, false); assert.ok(noPostcode.errors.postcode);
});

test("building, Office XL, Home and Signature use published server formulas", () => {
  const building = valid({ ...base, configuration: { segment: "building", serviceRoute: "standard", squareMetres: 3000, contextSlug: "bedrijfshal-industrie", smartDesign: { modules: [] } } });
  assert.equal(buildQuoteSnapshot(building, { issueDate: "2026-08-28" }).primary.tier, "office-xl");
  for (const [subtype, tier] of [["home", "home"], ["signature", "signature"]]) {
    const data = valid({ ...base, configuration: { segment: "home", homeSubtype: subtype, serviceRoute: "standard", squareMetres: 300, smartDesign: { modules: [] } }, contact: { name: "Grace Hopper", email: "grace@example.com", phone: "020-1234567", postcode: "2132 AB" } });
    assert.equal(buildQuoteSnapshot(data, { issueDate: "2026-08-28" }).primary.tier, tier);
  }
});

test("Comfort lists formula-only unknown costs and does not alter totals", () => {
  const standard = buildQuoteSnapshot(valid(), { issueDate: "2026-08-28" });
  const comfortData = valid({ ...base, configuration: { ...base.configuration, serviceRoute: "comfort" } }); const comfort = buildQuoteSnapshot(comfortData, { issueDate: "2026-08-28" });
  assert.equal(comfort.primary.setupCents, standard.primary.setupCents); assert.equal(comfort.primary.monthlyCents, standard.primary.monthlyCents); assert.equal(comfort.comfort.thirdPartyCostsIncluded, false); assert.match(comfort.comfort.subscriptions, /25%/);
});

test("Smart Design modules use highest-anchor pricing and each is listed", () => {
  const data = valid({ ...base, configuration: { ...base.configuration, smartDesign: { modules: ["scan", "blueprint", "supervision"], squareMetres: 960, technologyBudgetEuros: 100000 } } });
  const quote = buildQuoteSnapshot(data, { issueDate: "2026-08-28" }); assert.equal(quote.smartDesign.length, 3);
  assert.equal(quote.smartDesign[1].totalCents, 1200000); assert.deepEqual(quote.smartDesign[1].determiningAnchors, ["technology-budget", "square-metres"]);
});

test("English quote artifacts use English Smart Design labels and booking route", () => {
  const data = valid({ ...base, source: { ...base.source, route: "/en", locale: "en" }, configuration: { ...base.configuration, smartDesign: { modules: ["blueprint", "supervision"], squareMetres: 300, technologyBudgetEuros: 80000 } } });
  const snapshot = buildQuoteSnapshot(data, { issueDate: "2026-08-28" });
  assert.deepEqual(snapshot.smartDesign.map((item) => item.label), ["Smart Design Blueprint", "Smart Design Supervision"]);
  assert.equal(snapshot.bookingUrl, "https://aiow.ai/en#booking");
  const mails = buildQuoteMailContent({ quoteNumber: "AIOW-2026-0042", snapshot, contact: data.contact, source: data.source, receivedAt: "2026-08-28T12:00:00.000Z" });
  assert.match(mails.customerMail.text, /Smart Design Blueprint/);
  assert.match(mails.customerMail.text, /https:\/\/aiow\.ai\/en#booking/);
  assert.doesNotMatch(mails.customerMail.text, /Blauwdruk|Regie/);
});

test("types, enums, bounds, dates, context, consent and honeypot are strict", () => {
  const mutations = [
    { configuration: { ...base.configuration, people: "8" } }, { configuration: { ...base.configuration, people: 10001 } }, { configuration: { ...base.configuration, serviceRoute: "easy" } },
    { configuration: { ...base.configuration, contextSlug: "invented" } }, { contact: { ...base.contact, startDate: "2026-02-30" } },
    { consent: { accepted: 1, version: "aiow-quote-v1" } }, { website: "bot" }, { source: { route: "https://evil.invalid", locale: "nl" } },
  ];
  for (const mutation of mutations) assert.equal(validateQuoteRequest({ ...base, ...mutation }).ok, false, JSON.stringify(mutation));
});

test("oversized strings, malformed contact, control characters and duplicate modules are rejected", () => {
  for (const mutation of [
    { contact: { ...base.contact, name: "x".repeat(101) } }, { contact: { ...base.contact, email: "invalid" } }, { contact: { ...base.contact, phone: {} } },
    { contact: { ...base.contact, name: "Ada\r\nBcc: attacker@example.com" } }, { contact: { ...base.contact, company: "Proof BV\nInjected" } },
    { contact: { ...base.contact, note: "x".repeat(2001) } }, { configuration: { ...base.configuration, smartDesign: { modules: ["scan", "scan"], squareMetres: 100 } } },
  ]) assert.equal(validateQuoteRequest({ ...base, ...mutation }).ok, false);
});

test("quote number is year-bound and HTML content escapes lead data", () => {
  assert.equal(validateQuoteNumber("AIOW-2026-0001", 2026), true); assert.equal(validateQuoteNumber("AIOW-2025-0001", 2026), false); assert.equal(validateQuoteNumber("AIOW-2026-1", 2026), false);
  assert.equal(escapeHtml(`<script>"x" & 'y'</script>`), "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;");
  const data = valid({ ...base, contact: { ...base.contact, name: "<Ada>", company: "A&B" } }); const snapshot = buildQuoteSnapshot(data, { issueDate: "2026-08-28" });
  const mails = buildQuoteMailContent({ quoteNumber: "AIOW-2026-0001", snapshot, contact: data.contact, source: data.source, country: "NL", receivedAt: "2026-08-28T14:15:16.123Z" });
  assert.doesNotMatch(mails.internalMail.html, /<Ada>|A&B/); assert.match(mails.internalMail.html, /&lt;Ada&gt;|A&amp;B/); assert.equal(mails.customerMail.from, "info@aiow.io"); assert.deepEqual(mails.customerMail.to,[data.contact.email]); assert.deepEqual(mails.internalMail.to, ["info@aiow.io"]);
});

test("internal transactional mail carries context and authoritative receipt timestamp", () => {
  const data = valid();
  const snapshot = buildQuoteSnapshot(data, { issueDate: "2026-08-28" });
  const receivedAt = "2026-08-28T14:15:16.123Z";
  const mails = buildQuoteMailContent({ quoteNumber: "AIOW-2026-0001", snapshot, contact: data.contact, source: data.source, country: "NL", receivedAt });
  assert.equal(snapshot.configuration.contextSlug, "accountants");
  assert.match(mails.internalMail.text, /^Context: accountants$/m);
  assert.match(mails.internalMail.text, new RegExp(`^Ontvangen: ${receivedAt}$`, "m"));
  assert.match(mails.internalMail.html, /Context: accountants/);
  assert.doesNotMatch(mails.customerMail.text, /Context: accountants/);
  assert.throws(() => buildQuoteMailContent({ quoteNumber: "AIOW-2026-0001", snapshot, contact: data.contact, source: data.source, country: "NL", receivedAt: "not-a-timestamp" }), /receivedAt/);
});

test("Comfort PDF source includes the mandatory automatic direct-debit term", async () => {
  const source = await readFile(new URL("../../lib/aiow-v1/quote-pdf.mjs", import.meta.url), "utf8");
  assert.match(source, /Comfort vereist automatische incasso/);
  assert.match(source, /Comfort requires automatic direct debit/);
});

test("Amsterdam year and safe bounded money stay deterministic", () => {
  assert.equal(amsterdamDateISO(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  const result = validateQuoteRequest({ ...base, configuration: { ...base.configuration, people: Number.MAX_SAFE_INTEGER } }); assert.equal(result.ok, false);
});

test("PDF is deterministic A4, paginated safely and carries metadata", async () => {
  const data = valid({ ...base, contact: { ...base.contact, note: "Lange toelichting <geen HTML>. ".repeat(50) } }); const snapshot = buildQuoteSnapshot(data, { issueDate: "2026-08-28", bookingUrl: "https://aiow.ai/#booking" });
  const first = await generateQuotePdf({ quoteNumber: "AIOW-2026-0001", snapshot, contact: data.contact }); const second = await generateQuotePdf({ quoteNumber: "AIOW-2026-0001", snapshot, contact: data.contact });
  assert.equal(Buffer.from(first.subarray(0, 5)).toString(), "%PDF-"); assert.deepEqual(first, second);
  const document = await PDFDocument.load(first); assert.ok(document.getPageCount() >= 2); assert.equal(document.getTitle(), "AIOW-2026-0001 · AIOW quote indication"); assert.equal(document.getAuthor(), "AIOW");
  for (const page of document.getPages()) { const { width, height } = page.getSize(); assert.ok(Math.abs(width - 595.28) < .02 && Math.abs(height - 841.89) < .02); }
});
