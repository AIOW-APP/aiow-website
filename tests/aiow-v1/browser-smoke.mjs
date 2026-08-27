import { webkit } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:4321";
const browser = await webkit.launch({ headless: true });
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base, { waitUntil: "networkidle" });
    const geometry = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(geometry.scrollWidth <= geometry.innerWidth + 1, `horizontal overflow at ${width}: ${JSON.stringify(geometry)}`);
    await page.getByRole("tab", { name: "Pand" }).click();
    await page.getByRole("button", { name: "Signature" }).click();
    await page.getByRole("slider").fill("400");
    const trigger = page.getByRole("button", { name: "Plan een scan", exact: true }).first();
    await trigger.click();
    const dialog = page.getByRole("dialog"); await dialog.waitFor({ state: "visible" });
    const close = page.getByRole("button", { name: "Sluiten" });
    const next = page.getByRole("button", { name: "Verder" });
    await next.focus(); await page.keyboard.press("Tab"); assert.equal(await close.evaluate((node) => node === document.activeElement), true, `forward focus trap ${width}`);
    await close.focus(); await page.keyboard.press("Shift+Tab"); assert.equal(await next.evaluate((node) => node === document.activeElement), true, `reverse focus trap ${width}`);
    await page.keyboard.press("Escape"); assert.equal(await dialog.count(), 0, `Escape close ${width}`);
    await page.waitForTimeout(50);
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true, `focus restore ${width}`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const publicRoutes = ["/", "/en", "/ai-automatisering", "/lokale-ai", "/smart-office", "/home", "/ventures", "/privacy"];
  for (const route of publicRoutes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${route} not 200`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `${route} overflow ${overflow}`);
  }

  await page.goto(`${base}/en`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator("#solutions").count(), 1);
  assert.equal(await page.locator("#approach").count(), 1);
  assert.equal(await page.locator("#ventures").count(), 1);
  assert.equal(await page.locator('nav[aria-label="Primary navigation"] a').filter({ hasText: "Ventures" }).getAttribute("href"), "/en#ventures");
  await page.getByRole("button", { name: "Book a scan", exact: true }).first().click();
  assert.equal(await page.getByLabel("Subject").count(), 1);
  assert.equal(await page.getByText("Onderwerp", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "Close" }).click();

  await page.goto(`${base}/ai-automatisering`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://aiow.ai/ai-automatisering");
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 0);

  await page.goto(base, { waitUntil: "networkidle" });
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(schema.some((text) => text.includes('"FAQPage"')), false);
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
  console.log("BROWSER_SMOKE_PASS widths=320,390,768,1440 routes=8 locale=PASS focus-trap=PASS links=PASS robots=PASS schema=PASS");
} finally {
  await browser.close();
}
