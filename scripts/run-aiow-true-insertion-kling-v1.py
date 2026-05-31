#!/usr/bin/env python3
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion'
OUTDIR.mkdir(parents=True, exist_ok=True)

source = ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png'
out = OUTDIR / 'intake-true-insertion-quarterturn-kling-v1.mp4'

prompt = """
Premium realistic macro product-film motion for AIOW. Use the source frame as the golden reference: a professional woman’s hand holds the AIOW AI Key already entering a real round lock/keyhole. Preserve the exact physical read: the key is inside the lock, not pasted on the surface, with visible depth, metal-on-metal contact, front lip/body occluding the blade, natural hand angle and subtle fingertip pressure.

Motion sequence: start with a tiny final push into the keyhole, the key seats with a mechanical click, then the hand turns the key a restrained quarter-turn, approximately 20–30 degrees, like switching a premium system on. The lock remains solid and heavy. Only after the quarter-turn, a restrained cream-gold hairline glow leaks from the seam and very thin organized route lines activate outward from the keyhole. Keep it quiet, tactile, premium, calm, Oryzo-like negative space.

Camera: close macro three-quarter angle, shallow depth of field, warm dark premium lighting, realistic metal, real hand anatomy, no readable text, no camera shake.
""".strip()

negative = "key lying on top of surface, pasted key, glued key, floating key, flat overlay, flat UI slot, broad generic hole, shallow insertion, no slot depth, glow before seating, glow hiding contact, fake dashboard, circuit board, router panel, sci-fi neon, crypto symbols, padlock, fantasy key, extra fingers, fused fingers, rubber skin, impossible wrist, text, captions, watermark, morphing key, melted metal, jitter, abrupt motion, camera shake, low quality, blurry"

url = image2video(
    source,
    prompt,
    model='kling-v3',
    duration=5,
    aspect_ratio='16:9',
    mode='pro',
    negative_prompt=negative,
    cfg_scale=0.45,
    poll_interval=15,
    timeout=1200,
)
print('Kling URL received')
r = requests.get(url, timeout=240)
r.raise_for_status()
out.write_bytes(r.content)
print(f'OK {out} {out.stat().st_size//1024}KB')
