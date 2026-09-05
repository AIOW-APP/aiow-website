import { webkit } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.AIOW_PROOF_BASE || "http://127.0.0.1:4321";
const out = process.env.AIOW_PROOF_DIR || ".team-handsome/AIOW-TW-RESET-20260905/50-proof";
const viewports = [
  { width: 320, height: 844 }, { width: 375, height: 844 }, { width: 390, height: 844 },
  { width: 768, height: 900 }, { width: 1024, height: 900 }, { width: 1440, height: 900 },
];
const locales = [
  { code: "nl", route: "/", hero: "oplossingen", labels: ["Werk", "Bedrijfspanden", "Woningen & villa’s"], cta: "Laat één proces of ruimte scannen", scanHref: "/scan" },
  { code: "en", route: "/en", hero: "solutions", labels: ["Work", "Commercial buildings", "Homes & villas"], cta: "Scan one process or space", scanHref: "/en/scan" },
];
await mkdir(out, { recursive: true });
const browser = await webkit.launch({ headless: true });
const receipt = { base, generatedAt: new Date().toISOString(), views: [], noJavaScript: [] };

async function inspect(page, viewport, theme, locale) {
  const result = await page.evaluate((config) => {
    const rect = (node) => { const r = node.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) }; };
    const hero = document.getElementById(config.hero);
    const categories = [...hero.querySelectorAll("nav a")];
    const cta = [...hero.querySelectorAll("a")].find((node) => node.textContent.trim() === config.cta);
    const conductor = hero.querySelector('[data-aiow-conductor="true"]');
    const commercialActions = [...document.querySelectorAll(`a[href="${config.scanHref}"]`)].map(rect).filter((box) => box.width > 0 && box.height > 0 && box.top < innerHeight);
    return {
      htmlLang: document.documentElement.lang,
      h1Count: document.querySelectorAll("h1").length,
      categoryCount: categories.length,
      categoryLabels: categories.map((node) => node.querySelector("strong")?.textContent?.trim()),
      categoryRects: categories.map(rect),
      categoryContentRects: categories.map((node) => [rect(node.querySelector("strong")), rect(node.querySelector("small"))]),
      ctaHref: cta?.getAttribute("href"),
      ctaRect: rect(cta),
      commercialActions,
      heroRect: rect(hero),
      heroMedia: hero.querySelectorAll("img,video").length,
      overflow: document.documentElement.scrollWidth - innerWidth,
      conductor: { animation: getComputedStyle(conductor).animationName, offset: getComputedStyle(conductor).strokeDashoffset },
    };
  }, locale);
  if (result.htmlLang !== locale.code) throw new Error(`${locale.code}/${viewport.width}/${theme}: lang=${result.htmlLang}`);
  if (result.h1Count !== 1) throw new Error(`${locale.code}/${viewport.width}/${theme}: H1=${result.h1Count}`);
  if (result.categoryCount !== 3) throw new Error(`${locale.code}/${viewport.width}/${theme}: categories=${result.categoryCount}`);
  if (result.categoryLabels.join("|") !== locale.labels.join("|")) throw new Error(`${locale.code}/${viewport.width}/${theme}: labels=${result.categoryLabels.join("|")}`);
  if (result.ctaHref !== locale.scanHref) throw new Error(`${locale.code}/${viewport.width}/${theme}: CTA=${result.ctaHref}`);
  if (result.heroMedia !== 0) throw new Error(`${locale.code}/${viewport.width}/${theme}: hero media=${result.heroMedia}`);
  if (result.overflow > 1) throw new Error(`${locale.code}/${viewport.width}/${theme}: overflow=${result.overflow}`);
  if (result.commercialActions.length !== 1) throw new Error(`${locale.code}/${viewport.width}/${theme}: first-viewport scan actions=${result.commercialActions.length}`);
  for (const target of [...result.categoryRects, result.ctaRect]) if (target.width < 44 || target.height < 44) throw new Error(`${locale.code}/${viewport.width}/${theme}: target=${JSON.stringify(target)}`);
  result.categoryContentRects.forEach((children, index) => children.forEach((child) => { const parent = result.categoryRects[index]; if (child.left < parent.left - 1 || child.right > parent.right + 1 || child.top < parent.top - 1 || child.bottom > parent.bottom + 1) throw new Error(`${locale.code}/${viewport.width}/${theme}: category content escapes parent=${JSON.stringify({ parent, child })}`); }));
  result.categoryRects.forEach((category, index) => {
    if (category.left < -1 || category.right > viewport.width + 1 || category.top < -1 || category.bottom > viewport.height + 1) {
      throw new Error(`${locale.code}/${viewport.width}/${theme}: category ${index + 1} outside viewport=${JSON.stringify(category)}`);
    }
  });
  return result;
}

try {
  for (const locale of locales) {
    for (const viewport of viewports) {
      for (const theme of ["light", "dark"]) {
        const page = await browser.newPage({ viewport, colorScheme: theme, reducedMotion: "reduce" });
        await page.goto(new URL(locale.route, base).href, { waitUntil: "networkidle" });
        await page.evaluate((value) => { localStorage.setItem("aiow-theme", value); document.documentElement.dataset.theme = value; }, theme);
        const result = await inspect(page, viewport, theme, locale);
        const file = path.resolve(out, `home-${locale.code}-${viewport.width}x${viewport.height}-${theme}.png`);
        await page.screenshot({ path: file, fullPage: false });
        receipt.views.push({ locale: locale.code, viewport, theme, file, ...result });
        await page.close();
      }
    }
  }
  for (const locale of locales) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport, javaScriptEnabled: false, colorScheme: "light", reducedMotion: "reduce" });
      const page = await context.newPage();
      const response = await page.goto(new URL(locale.route, base).href, { waitUntil: "load" });
      const result = await inspect(page, viewport, "no-js", locale);
      const file = path.resolve(out, `home-${locale.code}-${viewport.width}x${viewport.height}-no-js.png`);
      await page.screenshot({ path: file, fullPage: false });
      receipt.noJavaScript.push({ locale: locale.code, viewport, status: response?.status(), file, ...result });
      await context.close();
    }
  }
  const receiptPath = path.resolve(out, "browser-proof.json");
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`AIOW_VISUAL_PROOF_PASS views=${receipt.views.length} no_js=${receipt.noJavaScript.length} receipt=${receiptPath}`);
} finally { await browser.close(); }
