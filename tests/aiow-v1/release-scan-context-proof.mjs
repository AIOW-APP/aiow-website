const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.AIOW_PROOF_BASE || "http://127.0.0.1:3110";
const out = path.resolve(process.env.AIOW_PROOF_DIR || ".team-handsome/AIOW-ROUTE-SCAN-CONTINUITY-20260907/50-proof");
await mkdir(out, { recursive: true });
const routes = [
  { nl: "/ai-automatisering", en: "/en/ai-automation", subject: "bedrijf", intent: "proces" },
  { nl: "/smart-office", en: "/en/smart-office", subject: "pand", intent: "pand" },
  { nl: "/home", en: "/en/home", subject: "woning", intent: "woning" },
];
const viewports = [
  { width: 320, height: 844 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
];
const locales = ["nl", "en"];
const themes = ["light", "dark"];
const receipt = { base, views: [], direct: [], noJs: [] };
const browser = await webkit.launch({ headless: true });

function label(locale) { return locale === "en" ? "Request a scan" : "Vraag een scan aan"; }
function inside(rect, viewport) { return rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width + 0.5 && rect.y + rect.height <= viewport.height + 0.5; }
async function gotoOk(page, route) { const response = await page.goto(new URL(route, base).href, { waitUntil: "domcontentloaded", timeout: 60000 }); if (!response || !response.ok()) throw new Error(`${route}: HTTP ${response?.status() || 0}`); return response; }

for (const locale of locales) for (const route of routes) for (const viewport of viewports) for (const theme of themes) {
  const context = await browser.newContext({ viewport, colorScheme: theme === "dark" ? "dark" : "light", locale: locale === "en" ? "en-GB" : "nl-NL" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await gotoOk(page, route[locale]);
  await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
  await page.waitForTimeout(200);
  const state = await page.evaluate((scanLabel) => {
    const h1 = document.querySelector("h1");
    const candidates = [...document.querySelectorAll("a,button")].filter(el => el.textContent?.replace(/\s+/g, " ").trim() === scanLabel);
    const firstViewport = candidates.map(el => ({ el, rect: el.getBoundingClientRect(), style: getComputedStyle(el) })).filter(({ rect, style }) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && style.display !== "none" && style.visibility !== "hidden");
    return {
      h1: h1?.textContent?.replace(/\s+/g, " ").trim(),
      h1Rect: h1?.getBoundingClientRect().toJSON(),
      actions: firstViewport.map(({ el, rect }) => ({ tag: el.tagName, href: el.getAttribute("href"), rect: rect.toJSON() })),
      overflow: document.documentElement.scrollWidth - innerWidth,
      headerVariant: document.querySelector("header")?.getAttribute("data-variant"),
      rootFont: h1 ? getComputedStyle(h1).fontFamily : null,
      rootTransform: h1 ? getComputedStyle(h1).textTransform : null,
    };
  }, label(locale));
  if (errors.length) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: ${errors.join(" | ")}`);
  if (state.actions.length !== 1) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: first viewport actions=${state.actions.length}`);
  if (!inside(state.actions[0].rect, viewport)) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: action outside viewport`);
  if (state.actions[0].rect.width < 44 || state.actions[0].rect.height < 44) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: action target too small`);
  if (state.overflow !== 0) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: overflow=${state.overflow}`);
  if (state.headerVariant !== "human-industrial" || state.rootTransform !== "uppercase" || /Fraunces|Georgia/i.test(state.rootFont || "")) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: visual continuity failed`);
  const visibleActions = page.locator("a,button").filter({ hasText: label(locale) });
  let trigger = null;
  for (let i=0;i<await visibleActions.count();i++) { const candidate=visibleActions.nth(i); const box=await candidate.boundingBox(); if(box && box.y<viewport.height && box.y+box.height>0){trigger=candidate;break;} }
  if (!trigger) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: trigger missing`);
  const sourceUrl = page.url();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  const selected = await dialog.locator("select#booking-subject").inputValue();
  if (selected !== route.subject) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: selected=${selected}`);
  const dialogBox = await dialog.boundingBox();
  if (!dialogBox || dialogBox.width > viewport.width + 0.5 || dialogBox.height > viewport.height + 0.5) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: modal containment`);
  if (viewport.width > 600 && !new URL(page.url()).pathname.includes("/scan")) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: header action missed scan route`);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  let restored = null;
  if (viewport.width <= 600) {
    restored = await page.evaluate(scanLabel => document.activeElement?.textContent?.replace(/\s+/g," ").trim() === scanLabel, label(locale));
    if (!restored) throw new Error(`${locale}/${route.subject}/${viewport.width}/${theme}: focus not restored`);
  } else {
    await page.waitForURL(sourceUrl);
  }
  if ((viewport.width === 390 || viewport.width === 1440) && theme === "light") await page.screenshot({ path: path.join(out, `${locale}-${route.subject}-${viewport.width}.png`) });
  receipt.views.push({ locale, route: route.subject, viewport, theme, state, selected, restored, flow: viewport.width <= 600 ? "inline-modal" : "dedicated-route" });
  await context.close();
}

for (const locale of locales) for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: locale === "en" ? "en-GB" : "nl-NL" });
  const page = await context.newPage();
  const scanPath = `${locale === "en" ? "/en" : ""}/scan?intent=${route.intent}&returnTo=${encodeURIComponent(route[locale])}`;
  await gotoOk(page, scanPath);
  const selected = await page.locator("select#booking-subject").inputValue();
  if (selected !== route.subject) throw new Error(`${scanPath}: selected=${selected}`);
  receipt.direct.push({ locale, intent: route.intent, selected });
  await context.close();
}

for (const locale of locales) for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await gotoOk(page, route[locale]);
  const scanLink = page.getByRole("link", { name: label(locale), exact: true }).first();
  const href = await scanLink.getAttribute("href");
  const expected = `${locale === "en" ? "/en" : ""}/scan?intent=${route.intent}&returnTo=${encodeURIComponent(route[locale])}`;
  if (href !== expected) throw new Error(`${locale}/${route.subject}/no-js href=${href}`);
  if (!(await scanLink.isVisible())) throw new Error(`${locale}/${route.subject}/no-js link hidden`);
  await scanLink.click();
  await page.waitForLoadState("domcontentloaded");
  if (!page.url().includes(expected)) throw new Error(`${locale}/${route.subject}/no-js navigation=${page.url()}`);
  if (!(await page.getByRole("dialog").isVisible())) throw new Error(`${locale}/${route.subject}/no-js modal SSR hidden`);
  receipt.noJs.push({ locale, route: route.subject, href, dialog: true });
  await context.close();
}

await browser.close();
await writeFile(path.join(out, "scan-context-proof.json"), JSON.stringify(receipt, null, 2));
console.log(`AIOW_SCAN_CONTEXT_PASS views=${receipt.views.length} direct=${receipt.direct.length} no_js=${receipt.noJs.length}`);
