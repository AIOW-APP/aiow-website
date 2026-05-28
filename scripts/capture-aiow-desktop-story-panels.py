#!/usr/bin/env python3
import base64, json, os, pathlib, subprocess, time, urllib.request
import websocket

URL = os.environ.get('AIOW_URL', 'http://127.0.0.1:3010/')
OUT = pathlib.Path(os.environ.get('AIOW_OUT', '/Users/handsomebastard/.hermes/cache/screenshots/aiow-desktop-story-v4'))
OUT.mkdir(parents=True, exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = int(os.environ.get('AIOW_CDP_PORT', '9231'))
PROFILE = f'/tmp/aiow-desktop-cdp-profile-{PORT}'
WIDTH = int(os.environ.get('AIOW_WIDTH', '1440'))
HEIGHT = int(os.environ.get('AIOW_HEIGHT', '900'))

chrome = subprocess.Popen([
    CHROME,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    f'--remote-debugging-port={PORT}',
    '--remote-allow-origins=*',
    f'--user-data-dir={PROFILE}',
    f'--window-size={WIDTH},{HEIGHT}',
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
        'width': WIDTH, 'height': HEIGHT, 'deviceScaleFactor': 1,
        'mobile': False, 'screenWidth': WIDTH, 'screenHeight': HEIGHT,
    })
    nav = cdp('Page.navigate', {'url': URL})
    time.sleep(4.0)
    state = cdp('Runtime.evaluate', {'expression': "({url: location.href, ready: document.readyState, panels: document.querySelectorAll('.story-panel').length, title: document.title, videos: document.querySelectorAll('video.story-motion').length})", 'returnByValue': True})['result']['value']
    print('NAV', json.dumps({'nav': nav, 'state': state}, ensure_ascii=False))
    cdp('Runtime.evaluate', {'expression': "document.fonts && document.fonts.ready ? document.fonts.ready.then(()=>true) : true", 'awaitPromise': True})
    time.sleep(0.5)

    panels = cdp('Runtime.evaluate', {'expression': "Array.from(document.querySelectorAll('.story-panel')).map((el,i)=>({i,id:el.dataset.aiowScene, top: Math.round(el.getBoundingClientRect().top + scrollY), h: Math.round(el.getBoundingClientRect().height), title: el.querySelector('h2')?.innerText || '', hasMotion: el.dataset.hasMotion, video: el.querySelector('video.story-motion')?.currentSrc || null, img: el.querySelector('img')?.currentSrc || null}))", 'returnByValue': True})['result']['value']
    print('PANELS', json.dumps(panels, ensure_ascii=False))

    targets = [{'name': '00-hero', 'expr': '0'}]
    for p in panels:
        targets.append({'name': f"{p['i']+1:02d}-{p['id']}", 'expr': f"document.querySelectorAll('.story-panel')[{p['i']}].getBoundingClientRect().top + scrollY"})

    metrics = []
    for target in targets:
        cdp('Runtime.evaluate', {'expression': f"window.scrollTo(0, Math.max(0, {target['expr']})); true", 'returnByValue': True})
        time.sleep(1.0)
        marker_expr = """
        (() => {
          const visible = Array.from(document.querySelectorAll('.story-panel')).map((el,i)=>{
            const r=el.getBoundingClientRect(); const v=el.querySelector('video.story-motion'); const img=el.querySelector('img');
            return {i:i+1,id:el.dataset.aiowScene, top:Math.round(r.top), bottom:Math.round(r.bottom), title:el.querySelector('h2')?.innerText, hasMotion:el.dataset.hasMotion, video: v ? {paused:v.paused, ready:v.readyState, t:+v.currentTime.toFixed(2), w:v.videoWidth, h:v.videoHeight, display:getComputedStyle(v).display} : null, img:img?.currentSrc};
          }).filter(x=>x.bottom>0 && x.top<innerHeight);
          return {scrollY:Math.round(scrollY), viewport:[innerWidth,innerHeight], visible};
        })()
        """
        markers = cdp('Runtime.evaluate', {'expression': marker_expr, 'returnByValue': True})['result']['value']
        shot = cdp('Page.captureScreenshot', {'format': 'png', 'fromSurface': True, 'captureBeyondViewport': False})
        path = OUT / f"{target['name']}.png"
        path.write_bytes(base64.b64decode(shot['data']))
        metrics.append({'path': str(path), **markers})
        print(str(path), json.dumps(markers, ensure_ascii=False))
    (OUT / 'metrics.json').write_text(json.dumps(metrics, indent=2, ensure_ascii=False))
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
