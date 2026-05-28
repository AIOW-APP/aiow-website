#!/usr/bin/env python3
import json, pathlib, sys, time, traceback, requests, subprocess
sys.path.insert(0, "/Users/handsomebastard/debbie")
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUT = ROOT / 'public/aiow/homepage-story'
REF = ROOT / 'public/aiow/references/aiow-live-reference-20260506.jpg'
MODEL = 'kling-v2-1-master'
RAW = OUT / 'aiow-live-active-business-worklayer-kling-mobile-10s.mp4'
LITE = OUT / 'aiow-live-active-business-worklayer-kling-mobile-lite.mp4'
MANIFEST = OUT / 'aiow-live-active-business-worklayer-kling-manifest.json'
NEGATIVE = 'space, galaxy, stars, spaceship, robot, robot mascot, cyberpunk, neon, sci-fi city, hologram overload, readable text, captions, subtitles, logos, watermark, crypto, distorted hands, uncanny faces, chaotic camera, shaky camera, fast cuts, low quality, blurry, warped UI, fantasy interface, empty office, static image, frozen people'
PROMPT = '''Use the provided image as the exact art-direction and first-frame reference. Create a premium AIOW mobile homepage video that feels truly live and operational, not static. Keep the business office environment calm, realistic and trustworthy. Add purposeful action: subtle cinematic push-in, people moving naturally at desks, hands opening a laptop, dashboards updating, document cards routing between systems, approval chips lighting up, a client request becoming a task, summary, approval and CRM update. The AI worklayer should feel active through elegant transparent routing lines and soft UI cards, but never sci-fi, never neon, never robots, no readable fake text. Make the motion richer than a simple parallax: foreground movement, screen glow, human handoffs, small operational details, premium consulting/product-film energy. Smooth continuous motion suitable for muted website autoplay. No fast cuts, no shaky camera, no gimmicks.'''

def reencode_lite(src, dst):
    cmd = [
        'ffmpeg','-nostdin','-y','-hide_banner','-loglevel','error','-i',str(src),
        '-an','-map','0:v:0','-vf','scale=-2:1280',
        '-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p',
        '-profile:v','high','-level','4.0','-g','12','-keyint_min','12','-sc_threshold','0',
        '-movflags','+faststart',str(dst)
    ]
    subprocess.check_call(cmd)

record = {'model': MODEL, 'reference': str(REF), 'raw': str(RAW), 'lite': str(LITE), 'status': 'started', 'prompt': PROMPT, 'negative': NEGATIVE}
MANIFEST.write_text(json.dumps(record, ensure_ascii=False, indent=2))
try:
    start = time.time()
    if not REF.exists():
        raise FileNotFoundError(str(REF))
    url = image2video(str(REF), PROMPT, model=MODEL, duration=10, aspect_ratio='9:16', mode='pro', negative_prompt=NEGATIVE, cfg_scale=0.42, poll_interval=15, timeout=1800)
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    RAW.write_bytes(r.content)
    reencode_lite(RAW, LITE)
    record.update({'status':'ok','url':url,'rawBytes':RAW.stat().st_size,'liteBytes':LITE.stat().st_size,'seconds':round(time.time()-start,1)})
except Exception as e:
    record.update({'status':'error','error':repr(e),'traceback':traceback.format_exc()})
finally:
    MANIFEST.write_text(json.dumps(record, ensure_ascii=False, indent=2))
    print(json.dumps(record, ensure_ascii=False), flush=True)
