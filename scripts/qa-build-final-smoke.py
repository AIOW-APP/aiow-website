#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

OUT = Path('/Users/handsomebastard/.hermes/cache/screenshots/aiow-final-build-smoke')
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:3000'
ROUTES = ['/', '/oryzo-reference', '/aiow-v13', '/robots.txt', '/sitemap.xml']
ASSETS = [
    '/_astro/SplatsWorker-DSMxtdkh.js',
    '/_astro/splat_sorter_bg-BfJrILzx.wasm',
    '/images/wearable-gallery/yoga.webp',
    '/images/wearable-gallery/bite.webp',
    '/images/wearable-gallery/intro.webp',
    '/images/wearable-gallery/outro.webp',
    '/images/wearable-gallery/thumbs/bikini.webp',
]
report = {'routes': [], 'assets': [], 'runtime_404s': [], 'request_failed': [], 'console_errors': [], 'console_warnings': []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
    page.on('response', lambda r: report['runtime_404s'].append({'url': r.url, 'status': r.status}) if r.status == 404 else None)
    page.on('requestfailed', lambda req: report['request_failed'].append({'url': req.url, 'failure': str(req.failure)}))
    page.on('console', lambda msg: (report['console_errors'] if msg.type == 'error' else report['console_warnings'] if msg.type == 'warning' else []).append({'type': msg.type, 'text': msg.text, 'url': msg.location.get('url','')}))
    for route in ROUTES:
        res = page.goto(BASE + route, wait_until='networkidle', timeout=30000)
        report['routes'].append({'route': route, 'status': res.status if res else 0, 'title': page.title()})
        if route == '/':
            for h in [0, .2, .45, .7, 1]:
                page.evaluate('(r) => window.scrollTo(0, Math.floor((document.documentElement.scrollHeight - innerHeight) * r))', h)
                page.wait_for_timeout(400)
            page.screenshot(path=str(OUT/'home.png'), full_page=False)
    # Asset checks direct via browser fetch
    asset_results = page.evaluate('''async (assets) => {
      const out=[];
      for (const a of assets) {
        const r = await fetch(a, {cache:'no-store'}).catch(e => ({status:0, headers: new Map(), error:String(e)}));
        out.push({path:a, status:r.status||0, contentType:r.headers?.get?.('content-type') || '', error:r.error||''});
      }
      return out;
    }''', ASSETS)
    report['assets'] = asset_results
    browser.close()

# Only warnings we knowingly tolerate in headless Chromium/WebGL; errors/404s are not tolerated.
report['ok'] = (
    all(r['status'] and r['status'] < 400 for r in report['routes']) and
    all(a['status'] == 200 for a in report['assets']) and
    len(report['runtime_404s']) == 0 and
    len(report['request_failed']) == 0 and
    len(report['console_errors']) == 0
)
(OUT/'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
raise SystemExit(0 if report['ok'] else 1)
