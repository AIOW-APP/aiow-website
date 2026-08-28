import { webkit } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:4321";
const contextSlugs = ["accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren", "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject"];
const browser = await webkit.launch({ headless: true });

function flatten(value) {
  if (!value || typeof value !== "object") return [];
  return [value, ...Object.values(value).flatMap(flatten)];
}
async function schemas(page) {
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texts.flatMap((text) => flatten(JSON.parse(text)));
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

    await page.getByRole("tab", { name: "Pand" }).click();
    assert.equal(await page.getByRole("button", { name: "Signature", exact: true }).count(), 0, `Pand exposes Signature at ${width}`);
    await page.getByRole("slider").fill("2001");
    await page.getByText("Smart Office XL · indicatie/offerte", { exact: true }).waitFor();

    await page.getByRole("tab", { name: "Woning" }).click();
    assert.equal(await page.getByRole("button", { name: "Home", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Signature", exact: true }).count(), 1);
    await page.getByRole("button", { name: "Signature", exact: true }).click();
    await page.getByRole("slider").fill("400");
    await page.getByText("AIOW Signature", { exact: true }).waitFor();

    const trigger = page.getByRole("button", { name: "Plan een scan", exact: true }).first();
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    const close = page.getByRole("button", { name: "Sluiten" });
    const next = page.getByRole("button", { name: "Verder" });
    await close.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Sluiten");
    await next.focus(); await page.keyboard.press("Tab"); assert.equal(await close.evaluate((node) => node === document.activeElement), true, `forward focus trap ${width}`);
    await close.focus(); await page.keyboard.press("Shift+Tab"); assert.equal(await next.evaluate((node) => node === document.activeElement), true, `reverse focus trap ${width}`);
    await page.keyboard.press("Escape"); assert.equal(await dialog.count(), 0, `Escape close ${width}`);
    await page.waitForTimeout(50);
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true, `focus restore ${width}`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const publicRoutes = ["/", "/en", "/tarieven", "/ai-automatisering", "/lokale-ai", "/smart-office", "/home", "/ventures", "/privacy"];
  for (const route of publicRoutes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${route} not 200`);
    if (route !== "/tarieven") {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${route} overflow ${overflow}`);
    }
  }

  await page.goto(`${base}/en`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator("#solutions").count(), 1);
  assert.equal(await page.locator("#approach").count(), 1);
  assert.equal(await page.locator("#ventures").count(), 1);
  assert.equal(await page.locator('nav[aria-label="Primary navigation"] a').filter({ hasText: "Ventures" }).getAttribute("href"), "/en#ventures");
  const ratesLink = page.getByRole("link", { name: "Rates (Dutch)", exact: true }).first();
  assert.equal(await ratesLink.getAttribute("href"), "/tarieven");
  assert.equal(await ratesLink.getAttribute("hreflang"), "nl");
  const pricingCardLabels = await page.locator('a[href^="/tarieven/"] > span').allTextContents();
  for (const dutchLabel of ["Logistiek", "Bouw", "Makelaars", "Advocatuur", "Zorg", "Kantoorpand", "Woning", "Nieuwbouwproject"]) assert.equal(pricingCardLabels.includes(dutchLabel), false, `Dutch pricing card leaked on EN: ${dutchLabel}`);
  for (const englishLabel of ["Logistics", "Construction", "Real estate agents", "Legal practices", "Healthcare", "Office building", "Home", "New-build project"]) assert.equal(pricingCardLabels.filter((label) => label === englishLabel).length, 1, `English pricing card missing: ${englishLabel}`);
  const dutchSolutionLinks = page.locator('#solutions a[href="/ai-automatisering"], #solutions a[href="/lokale-ai"], #solutions a[href="/smart-office"], #solutions a[href="/home"]');
  assert.equal(await dutchSolutionLinks.count(), 4);
  assert.equal((await dutchSolutionLinks.evaluateAll((links) => links.map((link) => ({ language: link.getAttribute("hreflang"), text: link.textContent })))).every((link) => link.language === "nl" && link.text.includes("Dutch page")), true);
  assert.equal(await page.getByRole("link", { name: /Visit Ventures · Dutch page/ }).getAttribute("hreflang"), "nl");
  await page.getByRole("button", { name: "Book a scan", exact: true }).first().click();
  assert.equal(await page.getByLabel("Subject").count(), 1);
  assert.equal(await page.getByText("Onderwerp", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "Close" }).click();

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
  const bookingButton = page.getByRole("button", { name: "Plan de kansenscan", exact: true }).first();
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
  }
  await page.goto(`${base}/tarieven/accountants`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://aiow.ai/tarieven/accountants");
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 0);
  assert.ok(await page.locator("#toepassingen article").count() >= 2 && await page.locator("#toepassingen article").count() <= 3);
  assert.equal(await page.getByText("Pakketadvies", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Transparant gerekend", { exact: true }).count(), 1);
  assert.ok(await page.locator('nav[aria-label^="Relevante links"] a').count() >= 2);
  const detailNodes = await schemas(page);
  assert.ok(detailNodes.some((node) => node["@type"] === "Service"));
  assert.ok(detailNodes.some((node) => node["@type"] === "PriceSpecification" || node["@type"] === "UnitPriceSpecification"));

  await page.goto(`${base}/ai-automatisering`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://aiow.ai/ai-automatisering");
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 0);

  await page.goto(base, { waitUntil: "networkidle" });
  const homeSchema = await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(homeSchema.some((text) => text.includes('"FAQPage"')), false);
  const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => new URL(link.href).pathname))]);
  for (const route of internalLinks) {
    const response = await page.request.get(`${base}${route}`);
    assert.ok(response.status() < 400, `broken public link ${route}: ${response.status()}`);
  }

  const robots = await (await page.request.get(`${base}/robots.txt`)).text();
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) {
    const group = robots.split(`User-Agent: ${bot}`)[1]?.split("User-Agent:")[0] || "";
    assert.ok(group.includes("Disallow: /api/"), `${bot} exposes API`);
    assert.ok(group.includes("Disallow: /portal/admin"), `${bot} exposes admin`);
  }
  await page.close();
  console.log("BROWSER_SMOKE_PASS homepage=4-widths calculator=PASS tariffs=4-widths/6-tables themes=PASS contexts=15 schema=PASS locale=PASS booking=PASS links=PASS robots=PASS");
} finally {
  await browser.close();
}
