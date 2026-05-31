#!/usr/bin/env python3
import json, pathlib, sys, time, traceback, requests, subprocess
sys.path.insert(0, "/Users/handsomebastard/debbie")
from agents.kling_client import image2video
ROOT=pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUT=ROOT/'public/aiow/homepage-story'
MODEL='kling-v2-1-master'
NEGATIVE='space, galaxy, stars, spaceship, robot, robot mascot, cyberpunk, neon, sci-fi city, hologram overload, readable text, captions, subtitles, logos, watermark, crypto, distorted hands, uncanny faces, chaotic camera, shaky camera, fast cuts, low quality, blurry, warped UI, fantasy interface'
TASKS=[
 {'device':'desktop','src':OUT/'aiow-hero-gpt-image-2-keyframe-desktop.jpg','aspect':'16:9','out':OUT/'aiow-hero-gpt2-kling-desktop-10s.mp4'},
 {'device':'mobile','src':OUT/'aiow-hero-gpt-image-2-keyframe-mobile.jpg','aspect':'9:16','out':OUT/'aiow-hero-gpt2-kling-mobile-10s.mp4'},
]
PROMPT='''Use the provided GPT Image 2 keyframe as the exact art-direction and composition reference. Create a premium AIOW flagship homepage hero image-to-video film for serious businesses. Keep it realistic, calm and business-focused. No text, no logos, no sci-fi, no neon, no robots, no space. Animate subtle warm daylight, refined camera push, tasteful depth/parallax, elegant transparent AI worklayer routing lines and soft cards connecting people, documents, approvals, local AI and approved cloud AI. Premium consulting/product-film quality, trustworthy, expensive, clear, operational calm. Smooth loopable motion, no gimmicks, no fast cuts.'''

def add_audio(src, dst):
    cmd=['ffmpeg','-y','-stream_loop','1','-i',str(src),'-f','lavfi','-i','sine=frequency=110:duration=12:sample_rate=48000','-f','lavfi','-i','sine=frequency=220:duration=12:sample_rate=48000','-f','lavfi','-i','sine=frequency=880:duration=0.18:sample_rate=48000','-filter_complex','[1:a]volume=0.032,afade=t=in:st=0:d=1.2,afade=t=out:st=10.8:d=1.2[a1];[2:a]volume=0.014,afade=t=in:st=0:d=1.5,afade=t=out:st=10.8:d=1.2[a2];[3:a]adelay=2600|2600,volume=0.02,afade=t=out:st=0.12:d=0.06[p1];[3:a]adelay=7200|7200,volume=0.014,afade=t=out:st=0.12:d=0.06[p2];[a1][a2][p1][p2]amix=inputs=4:duration=longest,alimiter=limit=0.16[a]','-map','0:v:0','-map','[a]','-t','12','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(dst)]
    subprocess.check_call(cmd)

manifest=OUT/'aiow-hero-gpt2-kling-manifest.json'
records=[]
for t in TASKS:
    try:
        start=time.time()
        url=image2video(str(t['src']), PROMPT, model=MODEL, duration=10, aspect_ratio=t['aspect'], mode='pro', negative_prompt=NEGATIVE, cfg_scale=0.35, poll_interval=15, timeout=1800)
        r=requests.get(url,timeout=300); r.raise_for_status()
        t['out'].write_bytes(r.content)
        final=OUT/f"aiow-hero-gpt2-kling-{t['device']}-12s-with-sound.mp4"
        add_audio(t['out'], final)
        rec={**{k:str(v) for k,v in t.items()}, 'status':'ok','url':url,'final':str(final),'bytes':final.stat().st_size,'seconds':round(time.time()-start,1),'model':MODEL,'duration_requested':10,'audio_added_seconds':12}
    except Exception as e:
        rec={**{k:str(v) for k,v in t.items()}, 'status':'error','error':repr(e),'traceback':traceback.format_exc(),'model':MODEL}
    records.append(rec)
    manifest.write_text(json.dumps(records,ensure_ascii=False,indent=2))
    print(json.dumps(rec,ensure_ascii=False), flush=True)
