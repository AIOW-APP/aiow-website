#!/usr/bin/env python3
import base64, json, os, pathlib, subprocess, time, urllib.request
import websocket

URL = os.environ.get('AIOW_URL', 'http://127.0.0.1:3002/')
OUT = pathlib.Path('/Users/handsomebastard/.hermes/cache/screenshots/aiow-mobile-story-v3')
OUT.mkdir(parents=True, exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = 9229
PROFILE = '/tmp/aiow-mobile-cdp-profile'

chrome = subprocess.Popen([
    CHROME,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    f'--remote-debugging-port={PORT}',
    '--remote-allow-origins=*',
    f'--user-data-dir={PROFILE}',
    '--window-size=390,844',
    'about:blank',
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def get_json(url, tries=40):
    last = None
    for _ in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            last = e
            time.sleep(0.2)
    raise RuntimeError(last)

try:
    tabs = get_json(f'http://127.0.0.1:{PORT}/json')
    wsurl = tabs[0]['webSocketDebuggerUrl']
    ws = websocket.create_connection(wsurl, timeout=5)
    seq = 0
    def cdp(method, params=None):
        nonlocal_seq = None
        global seq
        seq += 1
        ws.send(json.dumps({'id': seq, 'method': method, 'params': params or {}}))
        while True:
            msg = json.loads(ws.recv())
            if msg.get('id') == seq:
                if 'error' in msg:
                    raise RuntimeError(f"CDP {method}: {msg['error']}")
                return msg.get('result', {})

    cdp('Page.enable')
    cdp('Runtime.enable')
    cdp('Emulation.setDeviceMetricsOverride', {
        'width': 390, 'height': 844, 'deviceScaleFactor': 2,
        'mobile': True, 'screenWidth': 390, 'screenHeight': 844,
    })
    cdp('Emulation.setUserAgentOverride', {
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    })
    nav = cdp('Page.navigate', {'url': URL})
    time.sleep(4.0)
    print('NAV', nav, cdp('Runtime.evaluate', {'expression': "({url: location.href, ready: document.readyState, html: document.documentElement.outerHTML.length, body: document.body ? document.body.innerText.slice(0,500) : null, panels: document.querySelectorAll('.story-panel').length, title: document.title})", 'returnByValue': True})['result']['value'])

    # Ensure fonts/media settled.
    cdp('Runtime.evaluate', {'expression': "document.fonts && document.fonts.ready ? document.fonts.ready.then(()=>true) : true", 'awaitPromise': True})
    time.sleep(0.5)

    panels = cdp('Runtime.evaluate', {'expression': "Array.from(document.querySelectorAll('.story-panel')).map((el,i)=>({i,id:el.id, top: Math.round(el.getBoundingClientRect().top + scrollY), h: Math.round(el.getBoundingClientRect().height), title: el.querySelector('h2')?.innerText || ''}))", 'returnByValue': True})['result']['value']
    print('PANELS', json.dumps(panels, ensure_ascii=False))

    targets = [{'name': '00-hero', 'expr': '0'}]
    for p in panels:
        targets.append({'name': f"{p['i']+1:02d}-{p['id'] or 'panel'}", 'expr': f"document.querySelectorAll('.story-panel')[{p['i']}].getBoundingClientRect().top + scrollY"})

    for target in targets:
        cdp('Runtime.evaluate', {'expression': f"window.scrollTo(0, Math.max(0, {target['expr']})); true", 'returnByValue': True})
        time.sleep(0.9)
        # Collect markers for QA.
        markers = cdp('Runtime.evaluate', {'expression': "JSON.stringify({scrollY: Math.round(scrollY), viewport: [innerWidth, innerHeight], visiblePanel: Array.from(document.querySelectorAll('.story-panel')).map((el,i)=>({i,id:el.id, rect: el.getBoundingClientRect().toJSON ? el.getBoundingClientRect().toJSON() : {top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}, img: el.querySelector('img')?.currentSrc, title: el.querySelector('h2')?.innerText})).filter(x=>x.rect.bottom>0 && x.rect.top<innerHeight)})", 'returnByValue': True})['result']['value']
        shot = cdp('Page.captureScreenshot', {'format': 'png', 'fromSurface': True, 'captureBeyondViewport': False})
        path = OUT / f"{target['name']}.png"
        path.write_bytes(base64.b64decode(shot['data']))
        print(str(path), markers)
finally:
    try:
        ws.close()
    except Exception:
        pass
    chrome.terminate()
    try:
        chrome.wait(timeout=5)
    except Exception:
        chrome.kill()
