const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.AIOW_PROOF_BASE || "http://127.0.0.1:3108";
const out = path.resolve(process.env.AIOW_PROOF_DIR || ".team-handsome/AIOW-ROUTE-FIELD-CINEMA-20260907/50-proof");
await mkdir(out, { recursive: true });
const browser = await webkit.launch({ headless: true });
const receipt = { base, generatedAt: new Date().toISOString(), intro: [], scroll: [], interruption: [], fallbacks: [] };

async function snapshot(page) {
  return page.evaluate(() => {
    const hero = document.querySelector("[data-cinema]");
    const active = hero?.querySelector('[data-visible="true"]');
    const sweep = hero?.querySelector('[class*="calibrationSweep"]');
    const aperture = hero?.querySelector('[class*="aperture"] i');
    return {
      at: Math.round(performance.now()),
      cinema: hero?.getAttribute("data-cinema"),
      route: hero?.getAttribute("data-active-route"),
      visible: active?.getAttribute("data-index"),
      sweepAnimation: sweep ? getComputedStyle(sweep).animationName : null,
      apertureTransform: aperture ? getComputedStyle(aperture).transform : null,
      rootReady: document.documentElement.getAttribute("data-motion-ready"),
      revealTotal: document.querySelectorAll("[data-reveal]").length,
      revealIn: document.querySelectorAll('[data-reveal][data-in="true"]').length,
      fastReveal: document.querySelectorAll('[data-reveal][data-fast-reveal="true"]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll("h1").length,
    };
  });
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference", colorScheme: "light", recordVideo: { dir: path.join(out, `video-${viewport.width}`), size: viewport } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "load" });
    const timeline = [];
    for (const delay of [0, 420, 500, 650, 700, 760, 500]) {
      if (delay) await page.waitForTimeout(delay);
      timeline.push(await snapshot(page));
    }
    const routeSequence = timeline.map((state) => state.route).filter((route, index, all) => index === 0 || route !== all[index - 1]);
    if (!routeSequence.includes("building") || !routeSequence.includes("home") || routeSequence.at(-1) !== "work") throw new Error(`${viewport.width}: intro route sequence ${routeSequence.join(",")}`);
    if (timeline.at(-1).cinema !== "settled") throw new Error(`${viewport.width}: intro did not settle`);
    if (timeline.some((state) => state.overflow > 1 || state.h1 !== 1)) throw new Error(`${viewport.width}: geometry invariant failed`);
    await page.screenshot({ path: path.join(out, `intro-settled-${viewport.width}.png`) });

    await page.evaluate(() => {
      window.__revealEvents = [];
      const started = performance.now();
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target;
          if (target instanceof HTMLElement && target.dataset.in === "true") {
            const box = target.getBoundingClientRect();
            window.__revealEvents.push({ elapsed: Math.round(performance.now() - started), scrollY: Math.round(scrollY), top: Math.round(box.top), ratio: Number((box.top / innerHeight).toFixed(2)), kind: target.dataset.reveal });
          }
        }
      });
      document.querySelectorAll("[data-reveal]").forEach((target) => observer.observe(target, { attributes: true, attributeFilter: ["data-in"] }));
      window.__revealObserver = observer;
    });
    for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += viewport.height * 0.38) {
      await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: "instant" }), viewport.height * 0.38);
      await page.waitForTimeout(150);
    }
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(900);
    const scrollState = await snapshot(page);
    const events = await page.evaluate(() => { window.__revealObserver?.disconnect(); return window.__revealEvents; });
    if (scrollState.revealIn !== scrollState.revealTotal) throw new Error(`${viewport.width}: reveals ${scrollState.revealIn}/${scrollState.revealTotal}`);
    if (scrollState.fastReveal < 1) throw new Error(`${viewport.width}: fast-scroll degradation was not exercised`);
    if (events.some((event) => event.ratio > 0.92)) throw new Error(`${viewport.width}: late reveal ${JSON.stringify(events)}`);
    await page.screenshot({ path: path.join(out, `scroll-end-${viewport.width}.png`) });
    receipt.intro.push({ viewport, timeline, routeSequence });
    receipt.scroll.push({ viewport, events, final: scrollState });
    await context.close();
  }

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: "no-preference" });
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(360);
    await page.locator('[data-route="home"]').hover();
    await page.waitForTimeout(2600);
    const state = await snapshot(page);
    if (state.cinema !== "settled" || state.route !== "home") throw new Error(`${viewport.width}: interruption failed ${JSON.stringify(state)}`);
    receipt.interruption.push({ viewport, state });
    await page.close();
  }

  for (const reducedMotion of ["reduce"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion });
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const state = await snapshot(page);
    const transitions = await page.locator("[data-reveal]").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).transitionDuration));
    if (state.cinema !== "settled" || state.route !== "work" || transitions.some((value) => value !== "0s")) throw new Error(`reduced motion failed ${JSON.stringify({ state, transitions })}`);
    receipt.fallbacks.push({ mode: reducedMotion, state, transitions });
    await page.close();
  }

  const noJs = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: "no-preference" });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(base, { waitUntil: "load" });
  const noJsState = await noJsPage.locator("[data-reveal]").evaluateAll((nodes) => nodes.map((node) => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform })));
  if (noJsState.some((state) => state.opacity !== "1" || state.transform !== "none")) throw new Error(`no-js hidden content ${JSON.stringify(noJsState)}`);
  receipt.fallbacks.push({ mode: "no-js", states: noJsState });
  await noJs.close();

  const receiptPath = path.join(out, "route-field-cinema-proof.json");
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`AIOW_ROUTE_FIELD_CINEMA_PASS intro=${receipt.intro.length} scroll=${receipt.scroll.length} interruption=${receipt.interruption.length} fallbacks=${receipt.fallbacks.length} receipt=${receiptPath}`);
} finally {
  await browser.close();
}
