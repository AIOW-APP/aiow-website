#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image
import json, time

OUT = Path('/Users/handsomebastard/.hermes/cache/screenshots/aiow-v5-polish')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:3000/'
viewports = [('desktop',1440,1000,1), ('mobile',390,844,2)]
ratios = [0,.08,.18,.32,.48,.62,.78,.9,1]
report = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for name,w,h,dpr in viewports:
        ctx = browser.new_context(viewport={'width':w,'height':h}, device_scale_factor=dpr, is_mobile=(name=='mobile'))
        page = ctx.new_page()
        page.goto(URL, wait_until='networkidle', timeout=60000)
        time.sleep(2)
        iframe_el = page.query_selector('iframe')
        fr = iframe_el.content_frame()
        meta = fr.evaluate("""() => {
          const se=document.scrollingElement||document.documentElement;
          return {innerWidth,innerHeight,scrollWidth:se.scrollWidth,clientWidth:se.clientWidth,scrollHeight:se.scrollHeight,clientHeight:se.clientHeight,bodyW:document.body.scrollWidth,htmlBg:getComputedStyle(document.documentElement).backgroundColor,bodyBg:getComputedStyle(document.body).backgroundColor,overflowX:getComputedStyle(document.body).overflowX,ready:document.readyState,htmlClass:document.documentElement.className};
        }""")
        max_scroll = max(0, meta['scrollHeight'] - meta['innerHeight'])
        shots=[]; edges=[]
        for r in ratios:
            y = round(max_scroll*r)
            fr.evaluate('(y)=>window.scrollTo(0,y)', y)
            time.sleep(0.7)
            path = OUT / f'{name}-{r:.2f}.png'
            page.screenshot(path=str(path), full_page=False)
            img = Image.open(path).convert('RGB')
            W,H = img.size
            samples=[]
            for x in range(W):
                for yy in list(range(0,min(6,H)))+list(range(max(0,H-6),H)):
                    samples.append(img.getpixel((x,yy)))
            for yy in range(H):
                for x in list(range(0,min(6,W)))+list(range(max(0,W-6),W)):
                    samples.append(img.getpixel((x,yy)))
            nearwhite=sum(1 for px in samples if all(c>235 for c in px))/len(samples)
            beige=sum(1 for R,G,B in samples if R>220 and G>190 and B>150)/len(samples)
            text = fr.evaluate("""() => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,p,td,th')).map(el=>{const r=el.getBoundingClientRect(); return (r.bottom>0&&r.top<innerHeight)?(el.innerText||el.textContent||'').trim():''}).filter(Boolean).slice(0,5).join(' | ').slice(0,240)""")
            over = fr.evaluate("""() => Array.from(document.querySelectorAll('*')).map(el=>{const r=el.getBoundingClientRect(); return {tag:el.tagName,id:el.id,cls:String(el.className).slice(0,80),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),top:Math.round(r.top),bottom:Math.round(r.bottom)};}).filter(x=>x.width>1 && (x.left<-1 || x.right>innerWidth+1)).slice(0,20)""")
            shots.append({'ratio':r,'scrollY':y,'path':str(path),'text':text,'overflowEls':over[:5]})
            edges.append({'ratio':r,'nearwhiteEdge':round(nearwhite,4),'beigeEdge':round(beige,4)})
        report[name]={'meta':meta,'shots':shots,'edges':edges}
        ctx.close()
    browser.close()

(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2)[:10000])
print('REPORT', OUT/'report.json')
