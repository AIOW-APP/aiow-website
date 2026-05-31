#!/usr/bin/env python3
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion'
OUTDIR.mkdir(parents=True, exist_ok=True)

source = ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/08-final-aiow-control-room-foreground-lock-v2.png'
out = OUTDIR / 'final-aiow-control-room-foreground-lock-v2-quarterturn-kling-v1.mp4'

prompt = """
Premium realistic AIOW final control room product-film motion. Use the source image as the exact locked composition: large foreground physical lock/key, Debbie-like professional operator and AIOW control room in the background. Preserve the same camera angle, same lock position, same room architecture, same calm dark graphite/champagne material palette.

The key is already physically inserted in the real foreground keyhole at the start. It must never float, slide, pull out, or become pasted on top. Keep the key blade occluded by the lock lip/body; keep contact shadow and seam depth visible.

Only one mechanical action drives the scene: the hand/key performs a restrained 20–30 degree quarter-turn around the fixed keyhole axis, like switching on a precision machine. First 1 second: still, no glow. Seconds 1–3: smooth fixed-axis turn, no camera move. Seconds 3–5: after the turn completes, a subtle warm cream-gold glow starts from the keyhole seam and travels into the room architecture: privacy boundary, model routing hardware, local compute, proof/archive surfaces softly come online. Keep activation restrained and architectural, not holographic.

The final feeling: quiet premium operating layer waking up because the real key turned. No text, no dashboards, no sci-fi overload, no circular token platform.
""".strip()

negative = "key pulling out, key sliding sideways, moving pivot, floating key, pasted key, flat overlay, key on surface, morphing key, morphing lock, changing hand anatomy, extra fingers, fused fingers, rubber skin, glow before the turn, big holograms, fake dashboard wall, readable UI text, captions, watermark, crypto symbols, coin, token, circular activation pad, audio mixing desk, faders, knobs, equalizer lights, cyberpunk neon, camera shake, zoom, pan, jitter, low quality, blurry"

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
