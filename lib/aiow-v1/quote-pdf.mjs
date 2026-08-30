import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatEuroCents } from "./pricing.mjs";

const A4 = [595.28, 841.89];
const IVORY = rgb(244 / 255, 239 / 255, 230 / 255);
const CHARCOAL = rgb(20 / 255, 22 / 255, 26 / 255);
const GRAPHITE = rgb(46 / 255, 51 / 255, 60 / 255);
const MUTED = rgb(92 / 255, 91 / 255, 86 / 255);
const COPPER = rgb(121 / 255, 80 / 255, 0);
const MARGIN = 48;
const CONTENT_WIDTH = A4[0] - MARGIN * 2;

function safeText(value, font) {
  let output = "";
  for (const character of String(value ?? "").normalize("NFC")) {
    if (character === "\n" || character === "\r" || character === "\t") { output += character === "\t" ? "  " : character; continue; }
    try { font.encodeText(character); output += character; } catch { output += "?"; }
  }
  return output.replace(/\r\n?/g, "\n");
}
function wrap(value, font, size, width) {
  const safe = safeText(value, font); const lines = [];
  for (const paragraph of safe.split("\n")) {
    if (!paragraph) { lines.push(""); continue; }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width) { line = candidate; continue; }
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, size) <= width) { line = word; continue; }
      let fragment = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(fragment + character, size) > width && fragment) { lines.push(fragment); fragment = character; } else fragment += character;
      }
      line = fragment;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function generateQuotePdf({ quoteNumber, snapshot, contact }) {
  if (!quoteNumber || !snapshot || !contact) throw new TypeError("quoteNumber, snapshot and contact are required");
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${quoteNumber} · AIOW quote indication`);
  pdf.setAuthor("AIOW"); pdf.setCreator("AIOW quote service v1"); pdf.setProducer("AIOW · pdf-lib");
  pdf.setSubject(snapshot.qualification); pdf.setKeywords(["AIOW", "offerte-indicatie", quoteNumber]);
  const fixedDate = new Date(`${snapshot.issueDate}T12:00:00.000Z`); pdf.setCreationDate(fixedDate); pdf.setModificationDate(fixedDate);
  const times = await pdf.embedFont(StandardFonts.TimesRoman); const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica); const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const en = snapshot.locale === "en"; const locale = en ? "en-IE" : "nl-NL";
  let page; let y;
  function addPage() {
    page = pdf.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: IVORY });
    page.drawText("AIOW", { x: MARGIN, y: A4[1] - 46, size: 14, font: helveticaBold, color: CHARCOAL });
    page.drawCircle({ x: MARGIN + 43, y: A4[1] - 41, size: 3, color: COPPER });
    page.drawText(quoteNumber, { x: A4[0] - MARGIN - helvetica.widthOfTextAtSize(quoteNumber, 9), y: A4[1] - 45, size: 9, font: helvetica, color: MUTED });
    page.drawLine({ start: { x: MARGIN, y: A4[1] - 58 }, end: { x: A4[0] - MARGIN, y: A4[1] - 58 }, thickness: 0.7, color: GRAPHITE });
    y = A4[1] - 88;
  }
  function ensure(height) { if (y - height < 52) addPage(); }
  function text(value, options = {}) {
    const font = options.font || helvetica; const size = options.size || 10; const leading = options.leading || size * 1.45; const color = options.color || CHARCOAL; const lines = wrap(value, font, size, options.width || CONTENT_WIDTH);
    ensure(Math.max(leading, lines.length * leading));
    for (const line of lines) { if (line) page.drawText(line, { x: options.x || MARGIN, y, size, font, color }); y -= leading; }
    return lines.length;
  }
  function heading(value, size = 18) { ensure(size * 2); text(value, { font: timesBold, size, leading: size * 1.2, color: CHARCOAL }); y -= 6; }
  function rule() { ensure(18); y -= 6; page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.5, color: rgb(.75, .71, .65) }); y -= 14; }
  function priceRow(label, amount, note = "") {
    ensure(36); page.drawText(safeText(label, helvetica), { x: MARGIN, y, size: 10, font: helvetica, color: CHARCOAL });
    const safeAmount = safeText(amount, helveticaBold); page.drawText(safeAmount, { x: A4[0] - MARGIN - helveticaBold.widthOfTextAtSize(safeAmount, 10), y, size: 10, font: helveticaBold, color: CHARCOAL }); y -= 14;
    if (note) text(note, { size: 8.5, leading: 12, color: MUTED }); y -= 7;
  }

  addPage();
  text(en ? "QUOTE INDICATION" : "OFFERTE-INDICATIE", { font: helveticaBold, size: 9, leading: 14, color: COPPER });
  y -= 10;
  text(en ? "Practical AI, precisely scoped." : "Praktische AI, precies afgebakend.", { font: timesBold, size: 30, leading: 34 }); y -= 8;
  text(en ? `Issued ${snapshot.issueDate} · valid through ${snapshot.validUntil}` : `Uitgegeven ${snapshot.issueDate} · geldig t/m ${snapshot.validUntil}`, { size: 9, color: MUTED });
  rule(); heading(en ? "Contact" : "Contact", 16);
  text(contact.name, { font: helveticaBold });
  if (contact.company) text(contact.company); if (contact.postcode) text(contact.postcode);
  text(`${contact.email} · ${contact.phone}`); if (contact.kvk) text(`KvK: ${contact.kvk}`); if (contact.startDate) text(`${en ? "Desired start" : "Gewenste start"}: ${contact.startDate}`);
  rule(); heading(en ? "Configuration" : "Configuratie", 16);
  const primary = snapshot.primary; const c = snapshot.configuration;
  text(`${en ? "Segment" : "Segment"}: ${c.segment} · ${primary.label}`);
  text(c.segment === "business" ? `${en ? "Team size" : "Teamgrootte"}: ${c.people}` : `${en ? "Surface" : "Oppervlakte"}: ${c.squareMetres} m²`);
  if (c.contextSlug) text(`${en ? "Context" : "Context"}: ${c.contextSlug}`);
  text(`${en ? "Service route" : "Serviceroute"}: ${c.serviceRoute === "comfort" ? "Comfort" : (en ? "Standard" : "Standaard")}`);
  rule(); heading(en ? "Price indication" : "Prijsindicatie", 18);
  priceRow(en ? "Implementation" : "Aansluiting", `${primary.from ? (en ? "from " : "vanaf ") : ""}${formatEuroCents(primary.setupCents, locale)}`, primary.minimumApplied.setup ? (en ? "Published minimum applies." : "Gepubliceerd minimum is van toepassing.") : "");
  priceRow(en ? "Management / month" : "Beheer / maand", `${primary.from ? (en ? "from " : "vanaf ") : ""}${formatEuroCents(primary.monthlyCents, locale)}`, primary.minimumApplied.monthly ? (en ? "Published monthly minimum applies." : "Gepubliceerd maandminimum is van toepassing.") : "");
  if (snapshot.smartDesign.length) {
    heading("Smart Design", 15);
    for (const item of snapshot.smartDesign) priceRow(item.label, `${en ? "from " : "vanaf "}${formatEuroCents(item.totalCents, locale)}`, `${en ? "Highest anchor" : "Hoogste anker"}: ${item.determiningAnchors.join(" + ")} · ${item.squareMetres} m²${item.technologyBudgetEuros ? ` · ${formatEuroCents(item.technologyBudgetEuros * 100, locale)} ${en ? "technology budget" : "technologiebudget"}` : ""}`);
  }
  if (snapshot.comfort) {
    rule(); heading("Comfort", 16);
    text(en ? "Comfort requires automatic direct debit. Unknown third-party costs are not added to this indication. Subscriptions: actual provider cost +25%. Provider increases: passed through 1-to-1 plus 25% margin. Hardware: cost +15%, with full prepayment or a deposit at least equal to the hardware value before ordering. AIOW never provides interest-free financing." : "Comfort vereist automatische incasso. Onbekende derde-kosten zijn niet in deze indicatie opgeteld. Abonnementen: werkelijke providerkostprijs +25%. Providerprijsstijgingen: 1-op-1 doorbelast plus 25% marge. Hardware: kostprijs +15%, met volledige vooruitbetaling of een aanbetaling van ten minste de hardwarewaarde vóór bestelling. AIOW financiert nooit renteloos voor.", { size: 9, leading: 13 });
  }
  rule(); heading(en ? "Boundaries" : "Afbakening", 16);
  text(snapshot.qualification, { font: helveticaBold, size: 9.5, leading: 14 });
  text(en ? "This document is not a final offer or acceptance. Scope, feasibility, dependencies and final pricing follow after the opportunity scan and written agreement." : "Dit document is geen definitieve offerte of aanvaarding. Scope, haalbaarheid, afhankelijkheden en definitieve prijs volgen na de kansenscan en schriftelijke afspraak.", { size: 9, leading: 13 });
  if (contact.note) { rule(); heading(en ? "Your note" : "Uw opmerking", 16); text(contact.note, { size: 9, leading: 13 }); }
  rule(); heading(en ? "Next step" : "Volgende stap", 16);
  text(en ? `Request a scan: ${snapshot.bookingUrl}` : `Vraag een scan aan: ${snapshot.bookingUrl}`, { font: helveticaBold, size: 10, leading: 14, color: COPPER });
  text(en ? "This is a preferred request, not a reservation. A person confirms the date and time separately." : "Dit is een voorkeursaanvraag, geen reservering. Een mens bevestigt datum en tijd apart.", { size: 9, leading: 13 });

  const count = pdf.getPageCount();
  for (let index = 0; index < count; index += 1) {
    const current = pdf.getPage(index); const label = `${index + 1} / ${count}`;
    current.drawText(label, { x: A4[0] - MARGIN - helvetica.widthOfTextAtSize(label, 8), y: 28, size: 8, font: helvetica, color: MUTED });
    current.drawText("aiow.ai", { x: MARGIN, y: 28, size: 8, font: helvetica, color: MUTED });
  }
  return pdf.save({ useObjectStreams: false, addDefaultPage: false, objectsPerTick: 50 });
}
