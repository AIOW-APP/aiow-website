import { webkit } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = "http://127.0.0.1:4321";
const contextSlugs = ["accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren", "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject"];
const translatedDutchSchemaTerms = JSON.parse(await readFile(new URL("./fixtures/dutch-schema-terms.json", import.meta.url), "utf8"));
const browser = await webkit.launch({ headless: true });

function flatten(value) {
  if (!value || typeof value !== "object") return [];
  return [value, ...Object.values(value).flatMap(flatten)];
}
async function schemas(page) {
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texts.flatMap((text) => flatten(JSON.parse(text)));
}

async function fillBusinessQuote(page, name = "Browser Proof") {
  const dialog = page.getByRole("dialog", { name: "Uw configuratie, helder vastgelegd." });
  await dialog.getByLabel("Context (optioneel)").selectOption("accountants");
  await dialog.getByLabel("Naam", { exact: true }).fill(name);
  await dialog.getByLabel("E-mail", { exact: true }).fill("browser@example.com");
  await dialog.getByLabel(/Telefoon/).fill("+31 20 123 4567");
  await dialog.getByLabel("Bedrijfsnaam", { exact: true }).fill("Browser Proof BV");
  await dialog.getByLabel(/Ik ga ermee akkoord/).check();
  return dialog;
}

function luminance(hex) {
  const values = hex.match(/[a-f\d]{2}/gi).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base, { waitUntil: "networkidle" });
    const geometry = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(geometry.scrollWidth <= geometry.innerWidth + 1, `homepage horizontal overflow at ${width}: ${JSON.stringify(geometry)}`);
    const iconHref = await page.locator('link[rel~="icon"]').first().getAttribute("href");
    assert.ok(iconHref, `brand icon metadata missing at ${width}`);
    if (width === 320) {
      const iconResponse = await page.request.get(new URL(iconHref, base).href);
      assert.equal(iconResponse.status(), 200, `brand icon failed to load: ${iconHref}`);
      assert.match(iconResponse.headers()["content-type"] || "", /image\/svg\+xml/, `unexpected brand icon content type: ${iconHref}`);
    }

    assert.equal(await page.locator("h1").count(), 1, `homepage must expose exactly one H1 at ${width}`);
    assert.equal(await page.locator('nav[aria-label="Drie AIOW-categorieën"] a').count(), 3, `three category entrances missing at ${width}`);
    for (const label of ["Werk", "Bedrijfspanden", "Woningen & villa’s"]) assert.equal(await page.getByRole("link", { name: new RegExp(label) }).count(), 1, `${label} entrance missing at ${width}`);
    assert.equal(await page.locator('#oplossingen svg').count(), 1, `architectural blueprint missing at ${width}`);
    assert.equal(await page.locator('#oplossingen video, #oplossingen img').count(), 0, `hero media found at ${width}`);
    assert.equal(await page.locator('#systemen article').count(), 3, `three system ledgers missing at ${width}`);
    assert.equal(await page.locator('#systemen article > ol > li').count(), 12, `four-stage category traces missing at ${width}`);
    assert.equal(await page.locator('#systemen article details').count(), 3, `category example disclosures missing at ${width}`);
    assert.equal(await page.locator('[data-premium-instrument="calculator"]').count(), 1, `premium calculator instrument missing at ${width}`);
    assert.equal(await page.locator('#aanpak > ol > li').count(), 4, `approach rail structure at ${width}`);

    const controlTargets = await page.locator('header select, header a[hreflang]').evaluateAll((nodes) => nodes.filter((node) => node.getClientRects().length > 0).map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
    if (width > 1000) assert.equal(controlTargets.length, 2, `desktop theme/language controls missing at ${width}`);
    for (const target of controlTargets) assert.ok(target.width >= 44 && target.height >= 44, `visible header control below 44px at ${width}: ${JSON.stringify(target)}`);
    const menuButton = page.getByRole("button", { name: "Menu", exact: true });
    if (width <= 1000) {
      assert.equal(await menuButton.isVisible(), true, `responsive menu trigger hidden at ${width}`);
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false", `responsive menu starts expanded at ${width}`);
      await menuButton.focus();
      await page.keyboard.press("Space");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "true", `Space did not open responsive menu at ${width}`);
      assert.equal(await page.locator("#primary-navigation").getAttribute("data-open"), "true", `responsive menu state not exposed at ${width}`);
      const openTargets = await page.locator('header select, header a[hreflang]').evaluateAll((nodes) => nodes.filter((node) => node.getClientRects().length > 0).map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
      assert.ok(openTargets.length >= 1, `open-menu display controls missing at ${width}`);
      for (const target of openTargets) assert.ok(target.width >= 44 && target.height >= 44, `open-menu control below 44px at ${width}: ${JSON.stringify(target)}`);
      await page.keyboard.press("Escape");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false", `Escape did not close responsive menu at ${width}`);
      assert.equal(await menuButton.evaluate((node) => node === document.activeElement), true, `responsive menu focus was not returned at ${width}`);
    } else {
      assert.equal(await menuButton.isVisible(), false, `desktop exposes responsive menu trigger at ${width}`);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedFieldMotion = await page.locator('[data-aiow-conductor="true"]').evaluate((node) => ({ animation: getComputedStyle(node).animationName, offset: getComputedStyle(node).strokeDashoffset }));
    assert.equal(reducedFieldMotion.animation, "none", `conductor motion not disabled at ${width}`);
    assert.equal(Number.parseFloat(reducedFieldMotion.offset), 0, `conductor final state missing under reduced motion at ${width}`);

    await page.emulateMedia({ reducedMotion: "no-preference" });

    const quoteTrigger = page.getByRole("button", { name: "Ontvang uw indicatie als PDF", exact: true });
    await quoteTrigger.click();
    let quoteDialog = page.getByRole("dialog", { name: "Uw configuratie, helder vastgelegd." });
    await quoteDialog.waitFor({ state: "visible" });
    assert.equal(await quoteDialog.getByText("Bedrijf", { exact: true }).count(), 1);
    assert.equal(await quoteDialog.getByText("10 mensen", { exact: true }).count(), 1);
    assert.equal(await quoteDialog.getByText("Standaard", { exact: true }).count(), 1);
    assert.equal(await quoteDialog.getByLabel("Bedrijfsnaam", { exact: true }).getAttribute("required"), "");
    assert.equal(await quoteDialog.getByLabel("Postcode", { exact: true }).count(), 0);
    const quoteGeometry = await quoteDialog.evaluate((node) => ({ scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, right: node.getBoundingClientRect().right, viewport: innerWidth }));
    assert.ok(quoteGeometry.scrollWidth <= quoteGeometry.clientWidth + 1 && quoteGeometry.right <= quoteGeometry.viewport + 1, `quote form overflow at ${width}: ${JSON.stringify(quoteGeometry)}`);
    await quoteDialog.getByLabel("Scan", { exact: true }).check();
    assert.equal(await quoteDialog.getByLabel("Smart Design-oppervlakte (m²)", { exact: true }).count(), 0);
    assert.equal(await quoteDialog.getByLabel("Technologiebudget (€; optioneel)", { exact: true }).count(), 0);
    await quoteDialog.getByLabel("Blauwdruk", { exact: true }).check();
    assert.equal(await quoteDialog.getByLabel("Technologiebudget (€; optioneel)", { exact: true }).count(), 0);
    assert.equal(await quoteDialog.getByText(/Voor deze indicatie rekenen we met 12 m² per persoon/).count(), 1);
    const quoteClose = quoteDialog.getByRole("button", { name: "Offerteformulier sluiten" });
    const quoteSubmit = quoteDialog.getByRole("button", { name: "Ontvang uw indicatie als PDF" });
    await quoteSubmit.focus(); await page.keyboard.press("Tab"); assert.equal(await quoteClose.evaluate((node) => node === document.activeElement), true, `quote forward focus trap ${width}`);
    await quoteClose.focus(); await page.keyboard.press("Shift+Tab"); assert.equal(await quoteSubmit.evaluate((node) => node === document.activeElement), true, `quote reverse focus trap ${width}`);
    await page.keyboard.press("Escape"); assert.equal(await quoteDialog.count(), 0, `quote Escape close ${width}`);
    await page.waitForTimeout(50);
    assert.equal(await quoteTrigger.evaluate((node) => node === document.activeElement), true, `quote focus restore ${width}`);

    await page.getByRole("button", { name: "Pand", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "Signature", exact: true }).count(), 0, `Pand exposes Signature at ${width}`);
    await page.getByRole("slider").fill("2001");
    await page.getByText("Smart Office XL · indicatie/offerte", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Woning", exact: true }).click();
    assert.equal(await page.getByRole("slider").inputValue(), "1000", `home surface was not clamped after switching from a >1000 m² building at ${width}`);
    assert.equal(await page.getByRole("button", { name: "Home", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Signature", exact: true }).count(), 1);
    await page.getByRole("button", { name: "Signature", exact: true }).click();
    await page.getByRole("slider").fill("400");
    await page.getByText("AIOW Signature", { exact: true }).first().waitFor();

    await quoteTrigger.click();
    quoteDialog = page.getByRole("dialog", { name: "Uw configuratie, helder vastgelegd." });
    await quoteDialog.waitFor();
    assert.equal(await quoteDialog.getByLabel("Postcode", { exact: true }).getAttribute("required"), "");
    assert.equal(await quoteDialog.getByLabel("Bedrijfsnaam", { exact: true }).count(), 0);
    await quoteDialog.getByRole("button", { name: "Offerteformulier sluiten" }).click();
    assert.equal(await quoteDialog.count(), 0, `home quote close ${width}`);

    const trigger = page.getByRole("link", { name: "Laat één proces of ruimte scannen", exact: true }).first();
    assert.equal(await trigger.getAttribute("href"), "/scan", `homepage scan contract does not link directly at ${width}`);
    await trigger.click();
    await page.waitForURL(`${base}/scan`);
    const dialog = page.getByRole("dialog", { name: "Vraag een praktische scan aan" });
    await dialog.waitFor({ state: "visible" });
    assert.equal(await page.getByText("Uw voorkeursdatum en tijd vereisen afzonderlijke menselijke bevestiging.", { exact: true }).count(), 1);
    await page.close();
  }

  const tinyPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  const successPage = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  let submittedQuote;
  await successPage.route("**/api/quote", async (route) => {
    submittedQuote = JSON.parse(route.request().postData());
    await route.fulfill({ status: 200, body: tinyPdf, headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="AIOW-2026-0042.pdf"', "x-aiow-quote-number": "AIOW-2026-0042", "x-aiow-request-id": "browser-proof-request", "cache-control": "no-store" } });
  });
  await successPage.goto(base, { waitUntil: "networkidle" });
  await successPage.getByRole("button", { name: "Ontvang uw indicatie als PDF", exact: true }).click();
  const successDialog = await fillBusinessQuote(successPage);
  await successDialog.getByLabel("Scan", { exact: true }).check();
  await successDialog.getByLabel("Blauwdruk", { exact: true }).check();
  assert.equal(await successDialog.getByLabel("Smart Design-oppervlakte (m²)", { exact: true }).count(), 0);
  assert.equal(await successDialog.getByLabel("Technologiebudget (€; optioneel)", { exact: true }).count(), 0);
  await successDialog.getByLabel("Blauwdruk", { exact: true }).uncheck();
  assert.equal(await successDialog.getByText(/Voor deze indicatie rekenen we met 12 m² per persoon/).count(), 1);
  const [download] = await Promise.all([
    successPage.waitForEvent("download"),
    successDialog.getByRole("button", { name: "Ontvang uw indicatie als PDF" }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "AIOW-2026-0042.pdf");
  assert.deepEqual(await readFile(await download.path()), tinyPdf);
  assert.equal(submittedQuote.configuration.people, 10);
  assert.equal(submittedQuote.configuration.serviceRoute, "standard");
  assert.equal(submittedQuote.configuration.contextSlug, "accountants");
  assert.deepEqual(submittedQuote.configuration.smartDesignModules, ["scan"]);
  assert.equal("technologyBudgetEuros" in submittedQuote.configuration, false);
  await successPage.getByText("Indicatie ontvangen", { exact: true }).waitFor();
  assert.equal(await successPage.getByText("AIOW-2026-0042", { exact: true }).count(), 1);
  await successPage.getByRole("button", { name: "Sluiten", exact: true }).click();
  await successPage.getByRole("button", { name: "Ontvang uw indicatie als PDF", exact: true }).click();
  await successPage.getByRole("dialog", { name: "Uw configuratie, helder vastgelegd." }).waitFor();
  assert.equal(await successPage.getByRole("dialog", { name: "Uw configuratie, helder vastgelegd." }).count(), 1);
  assert.equal(await successPage.getByText("Indicatie ontvangen", { exact: true }).count(), 0);
  await successPage.close();

  const failurePage = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  let failedDownloads = 0;
  failurePage.on("download", () => { failedDownloads += 1; });
  await failurePage.route("**/api/quote", (route) => route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ ok: false, error: "rejected", requestId: "browser-proof-failure" }) }));
  await failurePage.goto(base, { waitUntil: "networkidle" });
  await failurePage.getByRole("button", { name: "Ontvang uw indicatie als PDF", exact: true }).click();
  const failureDialog = await fillBusinessQuote(failurePage, "Preserved Input");
  await failureDialog.getByRole("button", { name: "Ontvang uw indicatie als PDF" }).click();
  await failureDialog.getByText(/Uw indicatie kon niet worden vastgelegd/).waitFor();
  assert.equal(await failureDialog.getByLabel("Naam", { exact: true }).inputValue(), "Preserved Input");
  assert.equal(await failureDialog.getByText("Indicatie ontvangen", { exact: true }).count(), 0);
  await failurePage.waitForTimeout(100);
  assert.equal(failedDownloads, 0, "502 response triggered a download");
  await failurePage.close();

  const malformedPdfPage = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  let malformedDownloads = 0;
  malformedPdfPage.on("download", () => { malformedDownloads += 1; });
  await malformedPdfPage.route("**/api/quote", (route) => route.fulfill({ status: 200, body: "not-a-pdf", headers: { "content-type": "application/pdf", "x-aiow-quote-number": "AIOW-2026-0043" } }));
  await malformedPdfPage.goto(base, { waitUntil: "networkidle" });
  await malformedPdfPage.getByRole("button", { name: "Ontvang uw indicatie als PDF", exact: true }).click();
  const malformedDialog = await fillBusinessQuote(malformedPdfPage, "Malformed PDF");
  await malformedDialog.getByRole("button", { name: "Ontvang uw indicatie als PDF" }).click();
  await malformedDialog.getByText(/Uw indicatie kon niet worden vastgelegd/).waitFor();
  assert.equal(await malformedDialog.getByText("Indicatie ontvangen", { exact: true }).count(), 0);
  await malformedPdfPage.waitForTimeout(100);
  assert.equal(malformedDownloads, 0, "malformed PDF response triggered a download");
  await malformedPdfPage.close();

  const englishBookingPage = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  let englishBookingPayload;
  await englishBookingPage.route("**/api/booking", async (route) => { englishBookingPayload = JSON.parse(route.request().postData()); await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ schemaKind:"booking_ack",accepted:true,requestId:"english-booking-proof",preference:{ date:"2026-09-30",slot:"09:00",subject:"bedrijf" } }) }); });
  await englishBookingPage.goto(`${base}/en/scan`, { waitUntil: "networkidle" });
  const englishBookingDialog = englishBookingPage.getByRole("dialog", { name: "Request a practical scan" });
  await englishBookingDialog.getByRole("textbox", { name: "What would you like to make easier?" }).fill("English booking browser proof");
  await englishBookingDialog.getByRole("button", { name: "Continue" }).click();
  await englishBookingDialog.getByLabel("Date").fill("2026-09-30");
  await englishBookingDialog.getByRole("button", { name: "09:00" }).click();
  await englishBookingDialog.getByRole("button", { name: "Continue" }).click();
  await englishBookingDialog.getByLabel("Name").fill("English Booking Proof");
  await englishBookingDialog.getByLabel("E-mail").fill("english@example.com");
  await englishBookingDialog.getByRole("checkbox").check();
  await englishBookingDialog.getByRole("button", { name: "Send scan request" }).click();
  await englishBookingPage.getByText("Your scan request has been received.").waitFor();
  assert.equal(englishBookingPayload.locale, "en");
  const [calendarDownload] = await Promise.all([englishBookingPage.waitForEvent("download"), englishBookingPage.getByRole("button", { name: "Download local reminder (.ics)" }).click()]);
  const calendarText = await readFile(await calendarDownload.path(), "utf8");
  assert.match(calendarText, /SUMMARY:AIOW introduction/);
  assert.match(calendarText, /DESCRIPTION:AIOW received your booking request/);
  assert.doesNotMatch(calendarText, /kennismaking|Boekingsaanvraag/);
  await englishBookingPage.close();

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const publicRoutes = ["/", "/en", "/tarieven", "/en/rates", "/ai-automatisering", "/en/ai-automation", "/lokale-ai", "/en/local-ai", "/smart-office", "/en/smart-office", "/home", "/en/home", "/ventures", "/en/ventures", "/privacy", "/en/privacy"];
  for (const route of publicRoutes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${route} not 200`);
    assert.equal(await page.locator("html").getAttribute("lang"), route === "/en" || route.startsWith("/en/") ? "en" : "nl", `${route} html lang`);
    if (route !== "/tarieven" && route !== "/en/rates") {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${route} overflow ${overflow}`);
    }
  }

  await page.goto(`${base}/en`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator("#solutions").count(), 1);
  assert.equal(await page.locator("#approach").count(), 1);
  assert.equal(await page.locator("#ventures").count(), 0);
  const englishHomeNodes = await schemas(page);
  assert.ok(englishHomeNodes.some((node) => node["@type"] === "Service" && node.url === "https://aiow.ai/en" && node.inLanguage === "en-GB" && node["@id"] === "https://aiow.ai/en#service"), "English home Service identity missing");
  assert.equal(await page.locator('footer a').filter({ hasText: "Ventures" }).getAttribute("href"), "/en/ventures");
  const ratesLink = page.getByRole("link", { name: "Rates", exact: true }).first();
  assert.equal(await ratesLink.getAttribute("href"), "/en/rates");
  const englishSolutionLinks = page.locator('#solutions a[href="/en/ai-automation"], #solutions a[href="/en/smart-office"], #solutions a[href="/en/home"]');
  assert.equal(await englishSolutionLinks.count(), 3);
  await page.goto(`${base}/en/scan`, { waitUntil: "networkidle" });
  assert.equal(await page.getByLabel("What is this about?").count(), 1);
  assert.equal(await page.getByText("Waar gaat het om?", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForURL(`${base}/en/capabilities`);

  await page.goto(`${base}/en/rates`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('nav[aria-label="Primary navigation"] a[aria-current="page"]').textContent(), "Rates", "current-page navigation state missing");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/tarieven`, { waitUntil: "networkidle" });
    const regions = page.locator('[role="region"][aria-label*="horizontaal scrollbaar"]');
    assert.equal(await regions.count(), 6, `tariff region count at ${width}`);
    const names = await regions.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label")));
    assert.equal(new Set(names).size, 6, `tariff region names not unique at ${width}`);
    for (let index = 0; index < 6; index += 1) await regions.nth(index).scrollIntoViewIfNeeded();
    if (width <= 390) {
      const region = regions.first();
      const dimensions = await region.evaluate((node) => ({ scrollWidth: node.scrollWidth, clientWidth: node.clientWidth }));
      assert.ok(dimensions.scrollWidth > dimensions.clientWidth, `tariff table does not intentionally overflow at ${width}`);
      await region.focus();
      const before = await region.evaluate((node) => node.scrollLeft);
      await page.keyboard.press("ArrowRight");
      const after = await region.evaluate((node) => node.scrollLeft);
      assert.ok(after > before, `ArrowRight did not scroll tariff table at ${width}: ${before} -> ${after}`);
    }
    const theme = page.getByLabel("Thema");
    assert.equal(await theme.isVisible(), true, `theme control hidden at ${width}`);
    await theme.selectOption("light", { force: true });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    const lightTokens = await page.locator("main").evaluate((node) => {
      const style = getComputedStyle(node.parentElement);
      return ["--copper", "--bg", "--bg-soft", "--card"].map((token) => style.getPropertyValue(token).trim());
    });
    assert.equal(lightTokens[0].toLowerCase(), "#795000");
    for (const background of lightTokens.slice(1)) assert.ok(contrast(lightTokens[0], background) >= 4.5, `shared light accent contrast ${lightTokens[0]} on ${background} at ${width}`);
    const smartDesignContrast = await page.locator("#smart-design").evaluate((section) => {
      const hex = (value) => `#${value.match(/\d+/g).slice(0, 3).map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
      const note = section.querySelector(":scope > p:last-child");
      return { background: hex(getComputedStyle(section).backgroundColor), text: hex(getComputedStyle(section).color), note: hex(getComputedStyle(note).color) };
    });
    assert.ok(contrast(smartDesignContrast.text, smartDesignContrast.background) >= 4.5, `Smart Design text contrast at ${width}`);
    assert.ok(contrast(smartDesignContrast.note, smartDesignContrast.background) >= 4.5, `Smart Design note contrast at ${width}`);
    await theme.selectOption("dark", { force: true });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    const darkCopper = await page.locator("main").evaluate((node) => getComputedStyle(node.parentElement).getPropertyValue("--copper").trim());
    assert.equal(darkCopper.toLowerCase(), "#d9a441");
  }

  await page.goto(`${base}/tarieven`, { waitUntil: "networkidle" });
  await page.getByLabel("Thema").selectOption("light");
  await page.goto(`${base}/en/rates`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light", "theme did not persist across locale navigation");
  for (const id of ["business", "building", "home", "additional-work", "advice"]) assert.equal(await page.locator(`#${id}`).count(), 1, `English tariff anchor missing: ${id}`);
  const englishTariffSchemaText = JSON.stringify(await schemas(page));
  for (const dutchTerm of translatedDutchSchemaTerms) assert.equal(englishTariffSchemaText.includes(dutchTerm), false, `Dutch tariff schema term leaked: ${dutchTerm}`);
  await page.getByLabel("Theme").selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal((await page.locator("main").evaluate((node) => getComputedStyle(node.parentElement).getPropertyValue("--bg").trim())).toLowerCase(), "#f4efe6");
  await page.emulateMedia({ colorScheme: "dark" });
  assert.equal((await page.locator("main").evaluate((node) => getComputedStyle(node.parentElement).getPropertyValue("--bg").trim())).toLowerCase(), "#14161a");

  await page.goto(`${base}/tarieven/accountants?utm_test=1#toepassingen`, { waitUntil: "networkidle" });
  const englishToggle = page.getByRole("link", { name: "Bekijk deze pagina in het Engels" });
  await page.waitForFunction(() => document.querySelector('a[aria-label="Bekijk deze pagina in het Engels"]')?.getAttribute("href")?.includes("utm_test=1"));
  assert.equal(await englishToggle.getAttribute("href"), "/en/rates/accountants?utm_test=1#toepassingen");
  await englishToggle.click();
  await page.waitForLoadState("networkidle");
  assert.equal(page.url(), `${base}/en/rates/accountants?utm_test=1#toepassingen`);
  assert.equal(await page.evaluate(() => localStorage.getItem("aiow-locale")), "en");
  const dutchToggle = page.getByRole("link", { name: "View this page in Dutch" });
  await page.waitForFunction(() => document.querySelector('a[aria-label="View this page in Dutch"]')?.getAttribute("href")?.includes("utm_test=1"));
  assert.equal(await dutchToggle.getAttribute("href"), "/tarieven/accountants?utm_test=1#toepassingen");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/tarieven`, { waitUntil: "networkidle" });
  const tariffNodes = await schemas(page);
  const service = tariffNodes.find((node) => node["@type"] === "Service" && node.url === "https://aiow.ai/tarieven");
  assert.ok(service, "tariff Service schema missing");
  assert.ok(tariffNodes.some((node) => node.name === "Smart Office XL"), "Office XL schema missing");
  const setupM2 = tariffNodes.find((node) => node["@type"] === "UnitPriceSpecification" && node.name === "Aansluiting per m²");
  const monthlyM2 = tariffNodes.find((node) => node["@type"] === "UnitPriceSpecification" && node.name === "Beheer per m² per maand");
  assert.equal(setupM2.referenceQuantity["@type"], "QuantitativeValue");
  assert.equal(setupM2.referenceQuantity.unitCode, "MTK");
  assert.equal(setupM2.billingDuration, undefined);
  assert.equal(monthlyM2.referenceQuantity.unitCode, "MTK");
  assert.equal(monthlyM2.billingDuration["@type"], "QuantitativeValue");
  assert.equal(monthlyM2.billingDuration.unitCode, "MON");
  const schemaText = JSON.stringify(service);
  for (const term of ["automatische incasso", "Providerprijsstijgingen", "volledige vooruitbetaling", "nooit renteloos", "135", "195", "95", "175", "650", "1200", "1950"]) assert.ok(schemaText.includes(term), `tariff schema missing public term ${term}`);
  const bookingButton = page.getByRole("button", { name: "Vraag een scan aan", exact: true }).first();
  await bookingButton.click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Sluiten" }).click();
  assert.equal(await page.getByRole("dialog").count(), 0, "tariff booking did not close");

  for (const slug of contextSlugs) {
    const response = await page.goto(`${base}/tarieven/${slug}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `/tarieven/${slug} not 200`);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://aiow.ai/tarieven/${slug}`);
    const contextNodes = await schemas(page);
    assert.ok(contextNodes.some((node) => node["@type"] === "Service" && node.url === `https://aiow.ai/tarieven/${slug}`), `${slug} Service schema missing`);
    assert.ok(contextNodes.some((node) => node["@type"] === "PriceSpecification" || node["@type"] === "UnitPriceSpecification"), `${slug} price schema missing`);
    const englishResponse = await page.goto(`${base}/en/rates/${slug}`, { waitUntil: "networkidle" });
    assert.equal(englishResponse?.status(), 200, `/en/rates/${slug} not 200`);
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://aiow.ai/en/rates/${slug}`);
    const englishNodes = await schemas(page);
    assert.ok(englishNodes.some((node) => node["@type"] === "Service" && node.url === `https://aiow.ai/en/rates/${slug}` && String(node.inLanguage).startsWith("en")), `${slug} English Service schema missing`);
    const englishSchemaText = JSON.stringify(englishNodes);
    for (const dutchTerm of ["Aansluiting", "Beheer per", "vierkante meter", "Hard maandminimum"]) assert.equal(englishSchemaText.includes(dutchTerm), false, `${slug} Dutch schema term leaked: ${dutchTerm}`);
  }
  await page.goto(`${base}/tarieven/accountants`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://aiow.ai/tarieven/accountants");
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 3);
  assert.ok(await page.locator("#toepassingen article").count() >= 2 && await page.locator("#toepassingen article").count() <= 3);
  assert.equal(await page.getByText("Pakketadvies", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Transparant gerekend", { exact: true }).count(), 1);
  assert.ok(await page.locator('nav[aria-label^="Relevante links"] a').count() >= 2);
  const detailNodes = await schemas(page);
  assert.ok(detailNodes.some((node) => node["@type"] === "Service"));
  assert.ok(detailNodes.some((node) => node["@type"] === "PriceSpecification" || node["@type"] === "UnitPriceSpecification"));

  await page.goto(`${base}/ai-automatisering`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://aiow.ai/ai-automatisering");
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 3);

  await page.goto(base, { waitUntil: "networkidle" });
  const homeSchema = await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(homeSchema.some((text) => text.includes('"FAQPage"')), false);
  const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => new URL(link.href).pathname))]);
  for (const route of internalLinks) {
    const response = await page.request.get(`${base}${route}`);
    assert.ok(response.status() < 400, `broken public link ${route}: ${response.status()}`);
  }
  assert.deepEqual(runtimeErrors, [], `runtime page errors: ${runtimeErrors.join(" | ")}`);

  const robots = await (await page.request.get(`${base}/robots.txt`)).text();
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) {
    const group = robots.split(`User-Agent: ${bot}`)[1]?.split("User-Agent:")[0] || "";
    assert.ok(group.includes("Disallow: /api/"), `${bot} exposes API`);
    assert.ok(group.includes("Disallow: /portal/admin"), `${bot} exposes admin`);
  }
  await page.close();
  console.log("BROWSER_SMOKE_PASS homepage=4-widths calculator=PASS quote=4-widths+download+fail-closed tariffs=NL+EN/4-widths themes=system+light+dark+persistence contexts=15x2 schema=PASS locale=route+query+hash booking=PASS links=PASS robots=PASS");
} finally {
  await browser.close();
}
