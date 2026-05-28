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
out = OUTDIR / 'intake-true-insertion-quarterturn-kling-v2-fixed-pivot.mp4'

prompt = """
Premium realistic macro product-film motion for AIOW. Use the source frame exactly as the locked composition and golden reference. The key is ALREADY fully inserted in the real lock/keyhole at the start. Do not move the key out of the hole. Do not change the hand grip. Do not change the lock shape. Preserve the same keyhole center, the same contact shadow, and the same lock-body occlusion for the entire clip.

Only one mechanical action happens: the woman’s hand turns the inserted key around one fixed pivot axis inside the keyhole by a restrained 20–30 degrees, like switching on a precision machine. The key shaft remains inside the keyhole the whole time. The blade stays occluded by the lock lip/body. The fingers rotate with the key naturally, with no anatomy changes.

Timing: first second hold still, showing the key fully seated with NO glow. Second to fourth second: smooth fixed-axis quarter-turn, no translation, no floating, no sliding. Final second: after the turn is complete, a very subtle cream-gold hairline glow appears only at the seam/keyhole, like power has switched on. No route lines yet in this version. No extra UI.

Camera: locked macro three-quarter angle, no camera movement, shallow depth of field, warm dark premium lighting, realistic metal and real hand anatomy. Quiet, tactile, engineered.
""".strip()

negative = "approach movement, key pulling out, key sliding sideways, key translating, moving pivot, pasted key, floating key, key on surface, flat overlay, changing hand grip, changing fingers, extra fingers, fused fingers, rubber skin, morphing key, lock changing shape, broad generic hole, glow before turn, route lines, dashboard, circuit board, sci-fi neon, crypto symbols, text, captions, watermark, jitter, abrupt motion, camera shake, zoom, pan, low quality, blurry"

url = image2video(
    source,
    prompt,
    model='kling-v3',
    duration=5,
    aspect_ratio='16:9',
    mode='pro',
    negative_prompt=negative,
    cfg_scale=0.35,
    poll_interval=15,
    timeout=1200,
)
print('Kling URL received')
r = requests.get(url, timeout=240)
r.raise_for_status()
out.write_bytes(r.content)
print(f'OK {out} {out.stat().st_size//1024}KB')
