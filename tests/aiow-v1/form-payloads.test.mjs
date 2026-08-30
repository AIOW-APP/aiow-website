import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { validateContractDefinition } from "../../lib/aiow-v1/commercial-api-runtime.mjs";
import { quoteRuntimeData } from "../../lib/aiow-v1/quote-contract.mjs";
import { generateQuotePdf } from "../../lib/aiow-v1/quote-pdf.mjs";
import { buildBookingRequest, buildQuoteRequest } from "../../components/aiow-v1/commercial-form-payloads.mjs";

const bookingForm = {
  details: "  Concrete automation context  ", date: "2026-09-30", slot: "09:00",
  name: "Ada Lovelace", email: "ADA@example.com", company: "Analytical Engines",
  website: "must-not-leak.invalid", consentAccepted: true, consentVersion: "aiow-booking-v1",
};

const quoteForm = {
  contextSlug: "accountants", modules: ["scan", "blueprint", "supervision"],
  name: "Ada Lovelace", email: "ADA@example.com", phone: "+31 20 123 4567",
  company: "Analytical Engines", postcode: "", kvk: "", startDate: "", note: "",
  website: "must-not-leak.invalid", consentAccepted: true,
};

const businessConfig = { segment: "business", serviceRoute: "standard", people: 10 };

test("booking browser serializer emits every frozen subject without leaking the honeypot", () => {
  for (const [choice, subject] of [["bedrijf", "bedrijf"], ["pand", "gebouw"], ["woning", "woning"], ["anders", "anders"]]) {
    const payload = buildBookingRequest({ ...bookingForm, subject: choice }, "nl");
    assert.equal(validateContractDefinition("BookingRequest", payload), true, `${choice}: ${JSON.stringify(payload)}`);
    assert.equal(payload.subject, subject);
    assert.equal(payload.details, "Concrete automation context");
    assert.equal("website" in payload, false);
    assert.deepEqual(Object.keys(payload), ["schemaKind", "subject", "details", "date", "slot", "name", "email", "company", "locale", "consentAccepted", "consentVersion"]);
  }
});

test("quote browser serializer is the exact frozen request with explicit nullable fields", () => {
  const payload = buildQuoteRequest(businessConfig, quoteForm, "nl", "/?utm_source=private");
  assert.equal(validateContractDefinition("QuoteRequest", payload), true, JSON.stringify(payload));
  assert.deepEqual(payload, {
    schemaKind: "quote_request",
    configuration: {
      segment: "business", serviceRoute: "standard", contextSlug: "accountants",
      people: 10, squareMetres: null, homeSubtype: null,
      smartDesignModules: ["scan", "blueprint", "supervision"],
    },
    contact: {
      name: "Ada Lovelace", email: "ADA@example.com", phone: "+31 20 123 4567",
      company: "Analytical Engines", postcode: null, kvk: null, startDate: null, note: null,
    },
    consent: { accepted: true, version: "aiow-quote-v1" },
    source: { route: "/", locale: "nl" }, country: "NL",
  });
  assert.equal("website" in payload, false);
  assert.equal("utm" in payload.source, false);
  assert.equal("smartDesign" in payload.configuration, false);
});

test("NL and EN quote browser payloads validate and price every calculator and Smart Design option into authoritative PDFs", async () => {
  const configurations = [
    { config: { segment: "business", people: 10 }, expectedSquareMetres: 120 },
    { config: { segment: "building", squareMetres: 400 }, expectedSquareMetres: 400 },
    { config: { segment: "home", squareMetres: 150, homeSubtype: "home" }, expectedSquareMetres: 150 },
    { config: { segment: "home", squareMetres: 350, homeSubtype: "signature" }, expectedSquareMetres: 350 },
  ];
  for (const [locale, route] of [["nl", "/"], ["en", "/en"]]) {
    for (const serviceRoute of ["standard", "comfort"]) {
      for (const { config, expectedSquareMetres } of configurations) {
        const payload = buildQuoteRequest({ ...config, serviceRoute }, { ...quoteForm, contextSlug: "" }, locale, `${route}?utm_campaign=secret`);
        assert.equal(validateContractDefinition("QuoteRequest", payload), true, `${locale}/${serviceRoute}/${config.segment}: ${JSON.stringify(payload)}`);
        assert.equal(payload.configuration.squareMetres, config.segment === "business" ? null : expectedSquareMetres);
        const { normalized, snapshot } = quoteRuntimeData(payload, { issueDate: "2026-08-30" });
        assert.equal(normalized.configuration.smartDesign.squareMetres, expectedSquareMetres);
        assert.deepEqual(normalized.configuration.smartDesign.modules, ["scan", "blueprint", "supervision"]);
        assert.deepEqual(snapshot.smartDesign.map((item) => item.service), ["scan", "blueprint", "supervision"]);
        const pdf = await generateQuotePdf({ quoteNumber: "AIOW-2026-0042", snapshot, contact: normalized.contact });
        assert.equal(Buffer.from(pdf.subarray(0, 5)).toString(), "%PDF-");
        assert.ok((await PDFDocument.load(pdf)).getPageCount() >= 1);
      }
    }
  }
});

test("forms expose programmatic errors and calculator uses honest pressed buttons", async () => {
  const [booking, quote, calculator] = await Promise.all([
    readFile(new URL("../../components/aiow-v1/BookingModal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/aiow-v1/QuoteModal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/aiow-v1/PriceCalculator.tsx", import.meta.url), "utf8"),
  ]);
  for (const source of [booking, quote]) {
    assert.match(source, /aria-invalid=/);
    assert.match(source, /aria-describedby=/);
    assert.match(source, /role="alert"/);
    assert.match(source, /\.focus\(\)/);
  }
  assert.match(booking, /tabIndex=\{errors\.slot \? -1 : undefined\}/);
  assert.doesNotMatch(quote, /technologyBudgetEuros|designSquareMetres/);
  assert.match(quote, /technology budget/i);
  assert.doesNotMatch(calculator, /role="tablist"|role="tab"|aria-selected/);
  assert.match(calculator, /aria-pressed=/);
});
