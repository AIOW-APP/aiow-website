#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

OUT = Path('/Users/handsomebastard/.hermes/cache/screenshots/aiow-v6-asset-404')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:3000/'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
    responses = []
    failed = []
    console = []
    page.on('response', lambda r: responses.append({'url': r.url, 'status': r.status, 'content_type': r.headers.get('content-type','')}))
    page.on('requestfailed', lambda req: failed.append({'url': req.url, 'failure': req.failure}))
    page.on('console', lambda msg: console.append({'type': msg.type, 'text': msg.text, 'location': msg.location}))
    page.goto(URL, wait_until='networkidle', timeout=30000)
    for h in [0, 0.15, 0.3, 0.45, 0.6, 0.78, 0.9, 1]:
        page.evaluate('(r) => window.scrollTo(0, Math.floor((document.documentElement.scrollHeight - innerHeight) * r))', h)
        page.wait_for_timeout(700)
    page.screenshot(path=str(OUT/'desktop-final.png'), full_page=False)
    runtime_404s = [r for r in responses if r['status'] == 404]
    endpoints = [
        '/_astro/SplatsWorker-DSMxtdkh.js',
        '/_astro/splat_sorter_bg-BfJrILzx.wasm',
        '/images/wearable-gallery/yoga.webp',
        '/images/wearable-gallery/bite.webp',
        '/images/wearable-gallery/intro.webp',
        '/images/wearable-gallery/outro.webp',
        '/images/wearable-gallery/thumbs/bikini.webp',
    ]
    endpoint_results = page.evaluate('''async (eps) => {
      const out = [];
      for (const ep of eps) {
        const r = await fetch(ep, {method:'GET', cache:'no-store'}).catch(e => ({status: 0, headers: new Map(), error: String(e)}));
        out.push({url: ep, status: r.status || 0, contentType: r.headers?.get?.('content-type') || '', error: r.error || ''});
      }
      return out;
    }''', endpoints)
    browser.close()

report = {
    'url': URL,
    'failed_requests': failed,
    'runtime_404s_before_endpoint_probe': runtime_404s,
    'endpoint_results': endpoint_results,
    'console_errors': [m for m in console if m['type'] == 'error'],
    'console_warnings': [m for m in console if m['type'] == 'warning'],
    'total_responses': len(responses),
}
(OUT/'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
