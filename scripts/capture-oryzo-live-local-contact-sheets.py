#!/usr/bin/env python3
"""Capture live-vs-local ORYZO contact sheets via Chrome CDP.

Outputs side-by-side screenshots and metrics for desktop/mobile breakpoints.
"""
import base64
import json
import os
import pathlib
import subprocess
import time
import urllib.request
from datetime import datetime

import websocket
from PIL import Image, ImageDraw, ImageFont

LIVE_URL = os.environ.get("ORYZO_LIVE_URL", "https://oryzo.ai/")
LOCAL_URL = os.environ.get("ORYZO_LOCAL_URL", "http://127.0.0.1:3014/oryzo-reference")
OUT = pathlib.Path(os.environ.get("ORYZO_QA_OUT", "/Users/handsomebastard/.hermes/cache/screenshots/oryzo-live-local-qa"))
OUT.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MOS/Google Chrome")
if not pathlib.Path(CHROME).exists():
    CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = int(os.environ.get("ORYZO_CDP_PORT", "9244"))
PROFILE = f"/tmp/oryzo-live-local-cdp-profile-{PORT}"

BREAKPOINTS = [
    {"name": "desktop-1440x1000", "width": 1440, "height": 1000, "mobile": False, "dpr": 1},
    {"name": "mobile-390x844", "width": 390, "height": 844, "mobile": True, "dpr": 2},
]

CHECKPOINTS = [
    ("00-hero", 0.00),
    ("01-ai", 0.10),
    ("02-wearable", 0.20),
    ("03-features", 0.30),
    ("04-encryption", 0.42),
    ("05-grip", 0.53),
    ("06-sustainability", 0.64),
    ("07-testimonials", 0.74),
    ("08-social-product", 0.84),
    ("09-open-weight", 0.93),
    ("10-footer", 1.00),
]


def get_json(url, tries=50):
    last = None
    for _ in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            last = e
            time.sleep(0.2)
    raise RuntimeError(last)


def label_text(text, max_len=120):
    if not text:
        return ""
    return " ".join(text.split())[:max_len]


class CDP:
    def __init__(self, port):
        self.port = port
        self.ws = None
        self.seq = 0

    def connect(self):
        tabs = get_json(f"http://127.0.0.1:{self.port}/json")
        self.ws = websocket.create_connection(tabs[0]["webSocketDebuggerUrl"], timeout=8)
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.call("Log.enable")
        return self

    def call(self, method, params=None):
        self.seq += 1
        self.ws.send(json.dumps({"id": self.seq, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.seq:
                if "error" in msg:
                    raise RuntimeError(f"CDP {method}: {msg['error']}")
                return msg.get("result", {})

    def eval(self, expression, await_promise=False):
        return self.call("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": await_promise,
        }).get("result", {}).get("value")

    def close(self):
        if self.ws:
            self.ws.close()


def target_expr(kind):
    if kind == "local":
        return "(document.querySelector('iframe')?.contentWindow || window)"
    return "window"


def wait_ready(cdp, kind, timeout=18):
    exprw = target_expr(kind)
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        state = cdp.eval(f"""
        (() => {{
          const w = {exprw};
          const d = w.document;
          const pre = d.querySelector('#preloader');
          return {{
            href: w.location.href,
            ready: d.readyState,
            title: d.title,
            htmlClass: d.documentElement.className,
            preDisplay: pre ? w.getComputedStyle(pre).display : 'none',
            scrollHeight: d.scrollingElement ? d.scrollingElement.scrollHeight : d.documentElement.scrollHeight,
            bodyText: d.body ? d.body.innerText.slice(0, 240) : ''
          }};
        }})()
        """)
        last = state
        ok = state and state.get("ready") == "complete" and state.get("preDisplay") == "none" and ("is-ready" in str(state.get("htmlClass", "")) or kind == "live")
        # live sometimes reports ready before class settles; body text + no preloader is enough.
        if ok and state.get("scrollHeight", 0) > 2000:
            return state
        time.sleep(0.5)
    return last


def capture_page(cdp, url, bp, kind):
    cdp.call("Emulation.setDeviceMetricsOverride", {
        "width": bp["width"], "height": bp["height"], "deviceScaleFactor": bp["dpr"],
        "mobile": bp["mobile"], "screenWidth": bp["width"], "screenHeight": bp["height"],
    })
    if bp["mobile"]:
        cdp.call("Emulation.setUserAgentOverride", {"userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"})
    else:
        cdp.call("Emulation.setUserAgentOverride", {"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"})
    cdp.call("Page.navigate", {"url": url})
    time.sleep(4.0)
    ready = wait_ready(cdp, kind)
    cdp.eval("document.fonts && document.fonts.ready ? document.fonts.ready.then(()=>true) : true", await_promise=True)
    time.sleep(0.8)
    exprw = target_expr(kind)
    metrics = []
    shots = []
    page_meta = cdp.eval(f"""
    (() => {{
      const w = {exprw}; const d = w.document; const se = d.scrollingElement || d.documentElement;
      return {{href:w.location.href,title:d.title,scrollHeight:se.scrollHeight,innerHeight:w.innerHeight,innerWidth:w.innerWidth,htmlClass:d.documentElement.className}};
    }})()
    """)
    max_scroll = max(0, int(page_meta["scrollHeight"] - page_meta["innerHeight"]))
    for name, ratio in CHECKPOINTS:
        y = round(max_scroll * ratio)
        cdp.eval(f"""
        (() => {{
          const w = {exprw};
          w.scrollTo(0, {y});
          return true;
        }})()
        """)
        time.sleep(1.4 if not bp["mobile"] else 1.8)
        marker = cdp.eval(f"""
        (() => {{
          const w = {exprw}; const d = w.document; const se = d.scrollingElement || d.documentElement;
          const els = Array.from(d.querySelectorAll('h1,h2,h3,p,.title,.subtitle,.eyebrow,.small-title')).map(el => {{
            const r = el.getBoundingClientRect();
            return {{tag:el.tagName, top:Math.round(r.top), text:el.innerText || el.textContent || ''}};
          }}).filter(x => x.top > -80 && x.top < w.innerHeight + 120 && x.text.trim()).slice(0,8);
          return {{scrollY:Math.round(w.scrollY), maxScroll:{max_scroll}, viewport:[w.innerWidth,w.innerHeight], visibleText:els.map(x=>x.text.trim()).join(' | ').slice(0,360)}};
        }})()
        """)
        shot = cdp.call("Page.captureScreenshot", {"format": "png", "fromSurface": True, "captureBeyondViewport": False})
        img_path = OUT / bp["name"] / kind / f"{name}.png"
        img_path.parent.mkdir(parents=True, exist_ok=True)
        img_path.write_bytes(base64.b64decode(shot["data"]))
        marker.update({"checkpoint": name, "ratio": ratio, "path": str(img_path), "label": label_text(marker.get("visibleText"))})
        metrics.append(marker)
        shots.append((name, img_path, marker))
    return {"ready": ready, "page": page_meta, "metrics": metrics, "shots": shots}


def make_contact_sheet(bp_name, live_result, local_result):
    rows = []
    font = ImageFont.load_default()
    label_h = 54
    gap = 10
    for i, ((name, live_path, live_m), (_, local_path, local_m)) in enumerate(zip(live_result["shots"], local_result["shots"])):
        live_img = Image.open(live_path).convert("RGB")
        local_img = Image.open(local_path).convert("RGB")
        # normalize dimensions if DPR differs by resizing to CSS viewport dimensions-ish
        target_w = min(live_img.width, local_img.width)
        if live_img.width != target_w:
            live_img = live_img.resize((target_w, round(live_img.height * target_w / live_img.width)))
        if local_img.width != target_w:
            local_img = local_img.resize((target_w, round(local_img.height * target_w / local_img.width)))
        row_h = max(live_img.height, local_img.height) + label_h
        row = Image.new("RGB", (target_w * 2 + gap, row_h), "white")
        row.paste(live_img, (0, label_h))
        row.paste(local_img, (target_w + gap, label_h))
        d = ImageDraw.Draw(row)
        d.rectangle([0, 0, row.width, label_h], fill=(18, 18, 18))
        d.text((8, 6), f"{name} | LIVE y={live_m['scrollY']} | {live_m.get('label','')}", fill=(255,255,255), font=font)
        d.text((target_w + gap + 8, 6), f"{name} | LOCAL y={local_m['scrollY']} | {local_m.get('label','')}", fill=(255,255,255), font=font)
        d.text((8, 28), "LEFT: https://oryzo.ai/", fill=(180,180,180), font=font)
        d.text((target_w + gap + 8, 28), "RIGHT: local /oryzo-reference", fill=(180,180,180), font=font)
        rows.append(row)
    total_h = sum(r.height for r in rows) + gap * (len(rows)-1)
    sheet = Image.new("RGB", (rows[0].width, total_h), (235,235,235))
    y = 0
    for r in rows:
        sheet.paste(r, (0, y))
        y += r.height + gap
    out = OUT / f"oryzo-live-vs-local-{bp_name}-contact.jpg"
    sheet.save(out, quality=88)
    return out


def main():
    chrome_args = [
        CHROME,
        "--hide-scrollbars",
        "--mute-audio",
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--use-gl=angle",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        f"--user-data-dir={PROFILE}",
        "--window-size=1440,1000",
        "about:blank",
    ]
    if os.environ.get("ORYZO_HEADLESS", "1") != "0":
        chrome_args.insert(1, "--headless=new")
    chrome = subprocess.Popen(chrome_args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    cdp = None
    report = {"createdAt": datetime.now().isoformat(timespec="seconds"), "liveUrl": LIVE_URL, "localUrl": LOCAL_URL, "breakpoints": []}
    try:
        cdp = CDP(PORT).connect()
        for bp in BREAKPOINTS:
            print(f"CAPTURE {bp['name']} live")
            live = capture_page(cdp, LIVE_URL, bp, "live")
            print(f"CAPTURE {bp['name']} local")
            local = capture_page(cdp, LOCAL_URL, bp, "local")
            sheet = make_contact_sheet(bp["name"], live, local)
            bp_report = {
                "breakpoint": bp,
                "sheet": str(sheet),
                "liveReady": live["ready"],
                "localReady": local["ready"],
                "livePage": live["page"],
                "localPage": local["page"],
                "pairs": [{"checkpoint": l["checkpoint"], "ratio": l["ratio"], "liveScrollY": l["scrollY"], "localScrollY": r["scrollY"], "liveText": l.get("label", ""), "localText": r.get("label", "")} for l, r in zip(live["metrics"], local["metrics"])],
            }
            report["breakpoints"].append(bp_report)
            print("SHEET", sheet)
        report_path = OUT / "oryzo-live-vs-local-report.json"
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        print("REPORT", report_path)
    finally:
        if cdp:
            cdp.close()
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except Exception:
            chrome.kill()

if __name__ == "__main__":
    main()
