#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import json, math

OUT = Path('/Users/handsomebastard/.hermes/cache/screenshots/aiow-final-preview')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:3000/'
VIEWPORTS = {
    'desktop': {'width': 1440, 'height': 1000, 'device_scale_factor': 1},
    'mobile': {'width': 390, 'height': 844, 'device_scale_factor': 2, 'is_mobile': True},
}
SCROLLS = [0, .10, .22, .34, .46, .58, .70, .82, .94, 1]
report = {'url': URL, 'captures': {}, 'runtime_404s': [], 'request_failed': [], 'console_errors': [], 'console_warnings': []}

def clean_frame(path, name):
    """Remove capture-only chrome artifacts before sheets/previews."""
    im = Image.open(path).convert('RGB')
    if name == 'mobile':
        # Headless Chromium can preserve an iframe scrollbar/compositor edge in captures.
        # Crop a small safe right edge so client-facing composites only show the designed viewport.
        im = im.crop((0, 0, im.width - 12, im.height))
    return im


def make_sheet(name, paths):
    imgs = [clean_frame(p, name) for p in paths]
    thumb_w = 300 if name == 'desktop' else 220
    thumbs=[]
    for im in imgs:
        ratio = thumb_w / im.width
        thumbs.append(im.resize((thumb_w, int(im.height*ratio))))
    pad=18; label_h=28; cols=2 if name=='desktop' else 2
    rows=math.ceil(len(thumbs)/cols)
    cell_w=thumb_w; cell_h=max(t.height for t in thumbs)+label_h
    sheet=Image.new('RGB',(cols*cell_w+(cols+1)*pad, rows*cell_h+(rows+1)*pad),(18,18,18))
    d=ImageDraw.Draw(sheet)
    for idx,t in enumerate(thumbs):
        x=pad+(idx%cols)*(cell_w+pad); y=pad+(idx//cols)*(cell_h+pad)
        d.text((x,y), f'{name} {idx:02d} scroll={SCROLLS[idx]:.2f}', fill=(235,235,235))
        sheet.paste(t,(x,y+label_h))
    out=OUT/f'{name}-contact-sheet.jpg'
    sheet.save(out, quality=90)
    return str(out)


def make_mobile_4up(paths):
    picks = [(0, 'Hero'), (1, 'AI Key'), (8, 'Layer selector'), (9, 'Contact/footer')]
    frames = []
    for idx, label in picks:
        im = clean_frame(paths[idx], 'mobile')
        crop_h = min(im.height, 760)
        im = im.crop((0, 0, im.width, crop_h))
        ratio = 330 / im.width
        frames.append((label, im.resize((330, int(im.height * ratio)))))
    pad=22; label_h=32; cols=2
    cell_w=330; cell_h=max(im.height for _, im in frames)+label_h
    sheet=Image.new('RGB',(cols*cell_w+(cols+1)*pad, 2*cell_h+3*pad),(15,15,16))
    d=ImageDraw.Draw(sheet)
    for n,(label,im) in enumerate(frames):
        x=pad+(n%cols)*(cell_w+pad); y=pad+(n//cols)*(cell_h+pad)
        d.text((x,y), label, fill=(245,245,245))
        sheet.paste(im,(x,y+label_h))
    out=OUT/'aiow-mobile-preview-4up.jpg'
    sheet.save(out, quality=94)
    return str(out)


def make_desktop_hero(paths):
    im = clean_frame(paths[0], 'desktop')
    out=OUT/'aiow-desktop-hero-preview.jpg'
    im.save(out, quality=94)
    return str(out)


CAPTURE_CSS = '''
html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
*, *::before, *::after { scrollbar-width: none !important; }
*::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
*:focus, *:focus-visible, *:active { outline: none !important; box-shadow: none !important; }
button, a, input, textarea, select, [role="button"], [tabindex], .newsletter-field, .subscribe-form, .share-box { outline: none !important; box-shadow: none !important; border-style: solid !important; }
'''

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--hide-scrollbars'])
    for name, vp in VIEWPORTS.items():
        viewport = {'width': vp['width'], 'height': vp['height']}
        kwargs = {'viewport': viewport, 'device_scale_factor': vp.get('device_scale_factor', 1)}
        if vp.get('is_mobile'):
            kwargs['is_mobile'] = True
        page = browser.new_page(**kwargs)
        page.on('response', lambda r: report['runtime_404s'].append({'url': r.url, 'status': r.status}) if r.status == 404 else None)
        page.on('requestfailed', lambda req: report['request_failed'].append({'url': req.url, 'failure': str(req.failure)}))
        page.on('console', lambda msg: (report['console_errors'] if msg.type == 'error' else report['console_warnings'] if msg.type == 'warning' else []).append({'type': msg.type, 'text': msg.text, 'url': msg.location.get('url','')}))
        page.goto(URL, wait_until='networkidle', timeout=30000)
        page.evaluate('''(css) => {
          const add = (doc) => {
            const style = doc.createElement('style');
            style.setAttribute('data-aiow-capture-cleanup', 'true');
            style.textContent = css;
            doc.head.appendChild(style);
            doc.activeElement?.blur?.();
          };
          add(document);
          const iframe = document.querySelector('iframe');
          if (iframe?.contentDocument) add(iframe.contentDocument);
        }''', CAPTURE_CSS)
        paths=[]
        for idx, s in enumerate(SCROLLS):
            page.evaluate('''(r) => {
              const iframe = document.querySelector('iframe');
              const win = iframe?.contentWindow || window;
              const doc = win.document;
              doc.activeElement?.blur?.();
              const max = Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);
              win.scrollTo(0, Math.floor(max * r));
              doc.activeElement?.blur?.();
            }''', s)
            page.mouse.move(1, 1)
            page.wait_for_timeout(900)
            path=OUT/f'{name}-{idx:02d}.png'
            if name == 'mobile':
                page.screenshot(path=str(path), full_page=False, clip={'x': 0, 'y': 0, 'width': vp['width'] - 8, 'height': vp['height']})
            else:
                page.screenshot(path=str(path), full_page=False)
            paths.append(path)
        contact_sheet = make_sheet(name, paths)
        report['captures'][name] = {'frames': [str(p) for p in paths], 'contact_sheet': contact_sheet}
        if name == 'mobile':
            report['captures'][name]['preview_4up'] = make_mobile_4up(paths)
        if name == 'desktop':
            report['captures'][name]['hero_preview'] = make_desktop_hero(paths)
        page.close()
    browser.close()
report['ok'] = len(report['runtime_404s']) == 0 and len(report['request_failed']) == 0 and len(report['console_errors']) == 0
(OUT/'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
raise SystemExit(0 if report['ok'] else 1)
