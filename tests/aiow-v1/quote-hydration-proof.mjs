import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Deliberately blocked scripts can keep document.fonts.ready pending in WebKit.
// Capture the actual painted pre-hydration state without waiting for that promise.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.env.AIOW_PROOF_BASE || 'http://127.0.0.1:3119');
assert.equal(base.hostname, '127.0.0.1', 'Proof is restricted to own loopback server');
const out = path.resolve(process.env.AIOW_PROOF_DIR || '/tmp/aiow-quote-hydration-proof');
await mkdir(out, { recursive: true });
const results = [];
const browser = await webkit.launch({ headless: true });
try {
  for (const route of ['/', '/tarieven', '/en', '/en/rates']) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      for (const noJs of [false, true]) {
        const tag = `${route.replace(/\W/g, '-') || 'home'}-${viewport.width}-${noJs ? 'no-js' : 'delayed'}`;
        const result = { route, viewport, noJs, errors: [], blocked: [], scriptsHeld: 0 };
        console.log('QUOTE_START', route, viewport, { noJs });
        const context = await browser.newContext({ viewport, javaScriptEnabled: !noJs, reducedMotion: 'reduce', serviceWorkers: 'block' });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        page.on('pageerror', error => result.errors.push(error.message));
        let release;
        const gate = new Promise(resolve => { release = resolve; });
        await context.route('**/*', async intercepted => {
          const request = intercepted.request();
          if (new URL(request.url()).origin !== base.origin || !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
            result.blocked.push({ url: request.url(), method: request.method() });
            return intercepted.abort();
          }
          if (!noJs && request.resourceType() === 'script') { result.scriptsHeld++; await gate; }
          return intercepted.continue();
        });
        try {
          const response = await page.goto(new URL(route, base).href, { waitUntil: 'commit' });
          assert.ok(response?.ok());
          const trigger = page.locator('[data-quote-trigger]');
          await trigger.waitFor();
          await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => link.sheet));
          await trigger.scrollIntoViewIfNeeded();
          assert.equal(await trigger.count(), 1);
          assert.equal(await trigger.getAttribute('data-ready'), 'false');
          assert.equal(await trigger.isDisabled(), true);
          assert.equal(await trigger.getAttribute('aria-busy'), 'true');
          assert.match(await trigger.getAttribute('aria-label'), /Preparing|laden/);
          const before = await trigger.boundingBox();
          await page.screenshot({ path: path.join(out, `${tag}-before.png`) });
          if (noJs) {
            const fallback = page.locator('#booking noscript a');
            assert.equal(await fallback.getAttribute('href'), 'mailto:info@aiow.io');
            assert.equal(await fallback.isVisible(), true);
          } else {
            assert.ok(result.scriptsHeld > 0, 'Must actually hold hydration scripts');
            // Real pointer input, not Playwright auto-waiting past disabled state.
            await page.mouse.click(before.x + before.width / 2, before.y + before.height / 2);
            assert.equal(await page.getByRole('dialog').count(), 0);
            assert.equal(await trigger.isDisabled(), true);
            release();
            await page.locator('[data-quote-trigger][data-ready="true"]:enabled').waitFor();
            assert.equal(await trigger.getAttribute('aria-busy'), 'false');
            assert.equal(await page.getByRole('dialog').count(), 0, 'Disabled click must not replay');
            const after = await trigger.boundingBox();
            for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(before[key] - after[key]) <= 1, `${key} shifted: ${before[key]} -> ${after[key]}`);
            result.geometry = { before, after };
            const en = route.startsWith('/en');
            assert.equal(await page.getByRole('button', { name: en ? 'Create indication · PDF + email' : 'Maak indicatie · PDF + e-mail', exact: true }).count(), 1);
            const calculatorText = await page.locator('#booking').textContent();
            assert.ok(calculatorText.includes(en ? 'Download the PDF directly' : 'Download de PDF direct'));
            assert.ok(calculatorText.includes(en ? 'same document by email' : 'hetzelfde document per e-mail'));
            await trigger.click();
            const dialog = page.getByRole('dialog');
            await dialog.waitFor();
            assert.equal(await dialog.count(), 1);
            const text = await dialog.textContent();
            assert.ok(text.includes('PDF') && text.includes(en ? 'email' : 'e-mail'));
            await page.screenshot({ path: path.join(out, `${tag}-opened.png`) });
          }
          assert.deepEqual(result.errors, []);
          result.status = 'PASS';
        } catch (error) {
          result.status = 'FAIL'; result.error = error.stack;
          await page.screenshot({ path: path.join(out, `${tag}-failure.png`) }).catch(() => {});
          console.error('QUOTE_FAIL', route, viewport, noJs, error);
          throw error;
        } finally {
          release(); results.push(result);
          await writeFile(path.join(out, 'results.json'), JSON.stringify({ base: base.href, node: process.version, results }, null, 2));
          await context.close();
        }
      }
    }
  }
  assert.equal(results.length, 16);
  console.log('QUOTE_HYDRATION_PASS delayed=8 no_js=8');
} finally { await browser.close(); }
