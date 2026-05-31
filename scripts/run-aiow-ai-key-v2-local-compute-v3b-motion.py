#!/usr/bin/env python3
"""Generate Local Compute v3b lock-first motion proof.

Source still already passed QA. This runner only attempts motion; integration is allowed
only if the generated clip passes lock-first motion QA.
"""
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion/local-compute-v3b'
OUTDIR.mkdir(parents=True, exist_ok=True)

SOURCE = ROOT / 'public/aiow/story-v416/proofs/local-compute-rack-lock-v3/local-compute-rack-lock-quarter-turn-v3b.png'
OUT = OUTDIR / 'local-compute-rack-lock-quarter-turn-layer-lane-v3b.mp4'

PROMPT = '''
Use the source image as the exact composition. Preserve camera angle, woman/operator, hand anatomy, the inserted AIOW AI Key, rack-lock geometry, local compute cabinet, and calm dark graphite/champagne material palette.

This is a lock-first AIOW Local Compute product-film motion. The physical rack lock/keyway is the cause; the local compute layer reacts only afterward.

Frame 1 / first second: locked and mostly still. The AI Key is already physically seated inside the rack-mounted mechanical key switch/keyway. The key blade is partially hidden by the lock lip with contact shadow. The local compute rack is dormant except ambient light. No new glow, no routes, no solution, no HUD.

Seconds 1-3: tiny mechanical seating click and restrained 20-30 degree quarter-turn around the fixed rack-lock axis. The key and hand must stay connected to the lock; no sliding, no pulling away, no morphing.

Seconds 3-5: only after the turn/click, restrained warm cream-gold local compute lanes wake from the keyhole seam into the rack modules. A few physical status pins and short embedded rails light sequentially, showing private work dropping into the local lane. The activation must emerge from the lock seam and travel into the hardware, not appear as floating interface graphics.

Camera locked. Premium realistic product-film motion. Subtle, quiet, engineered, Oryzo-clean.
'''.strip()

NEGATIVE = (
    'loose token, access card, credit card reader, badge, key held away from lock, key pulling out, key sliding sideways, '
    'moving pivot, floating key, pasted key, flat overlay, key lying on top, key on surface, loose wide slot, oversized dock, '
    'unclear contact point, morphing key, morphing lock, changing hand anatomy, extra fingers, fused fingers, rubber skin, '
    'glow before insertion, glow before turn, solution before lock, instant activation, hologram panel, HUD rectangle, dashboard popup, '
    'fake dashboard clutter, readable UI text, captions, watermark, crypto symbols, coin, token, audio mixing desk, faders, knobs, '
    'cyberpunk neon, camera shake, zoom, pan, jitter, low quality, blurry'
)

if not SOURCE.exists():
    raise FileNotFoundError(SOURCE)

if OUT.exists() and OUT.stat().st_size > 1000:
    print(f'SKIP exists {OUT}')
else:
    print(f'GENERATE Local Compute v3b motion from {SOURCE}', flush=True)
    url = image2video(
        SOURCE,
        PROMPT,
        model='kling-v3',
        duration=5,
        aspect_ratio='16:9',
        mode='pro',
        negative_prompt=NEGATIVE,
        cfg_scale=0.28,
        poll_interval=15,
        timeout=1200,
    )
    print('Kling URL received', flush=True)
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    OUT.write_bytes(r.content)
    print(f'OK {OUT} {OUT.stat().st_size//1024}KB', flush=True)

print('DONE Local Compute v3b motion', flush=True)
