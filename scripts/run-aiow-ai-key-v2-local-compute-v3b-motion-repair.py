#!/usr/bin/env python3
"""Repair Local Compute v3b motion: make first second clearly dormant.

Previous clip was conditional because warm rack lanes were visible too early. This prompt
explicitly treats source warm elements as dim unpowered metal reflections at frame 1 and
forces a visible brightness jump only after click.
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
OUT = OUTDIR / 'local-compute-rack-lock-quarter-turn-layer-lane-v3b-repair-dark-start.mp4'

PROMPT = '''
Use the source image as the exact composition, but for the first second make the lower rack lane lights visibly dormant and dim: treat any existing amber lines as dark bronze metal reflections, not active light. Preserve camera angle, operator, hand anatomy, inserted AIOW AI Key, circular rack-lock/keyway, and local compute cabinet.

This is lock-first motion with a clear before/after. The physical rack lock is the cause. The local compute layer must NOT look active at the beginning.

Frame 1 through second 1: dormant locked state. The AI Key is already physically seated inside the rack-mounted mechanical key switch/keyway with contact shadow. Rack modules are quiet, mostly dark graphite/bronze, no glowing lanes, no status pins, no routes, no HUD, no solution.

Seconds 1-3: tiny mechanical seating click and restrained 20-30 degree quarter-turn around the same fixed circular lock axis. Hand and key remain connected to the lock; no sliding, no pulling away, no morphing.

Seconds 3-5: after the click only, a clear new warm cream-gold activation begins at the keyhole seam. A small pulse travels downward from the lock into the rack modules, then short embedded local compute rails and status pins light sequentially. The after-state must be visibly brighter than the first-second dormant state. No floating UI; activation is built into physical rack seams.

Camera locked. Quiet premium product-film motion, subtle but mechanically readable.
'''.strip()

NEGATIVE = (
    'early glow, glow before turn, lit lanes in first second, active status pins before click, solution before lock, instant activation, '
    'loose token, access card, credit card reader, badge, key held away from lock, key pulling out, key sliding sideways, moving pivot, '
    'floating key, pasted key, flat overlay, key lying on top, key on surface, loose wide slot, oversized dock, unclear contact point, '
    'morphing key, morphing lock, changing hand anatomy, extra fingers, fused fingers, rubber skin, hologram panel, HUD rectangle, '
    'dashboard popup, fake dashboard clutter, readable UI text, captions, watermark, crypto symbols, coin, token, audio mixing desk, '
    'faders, knobs, cyberpunk neon, camera shake, zoom, pan, jitter, low quality, blurry'
)

if not SOURCE.exists():
    raise FileNotFoundError(SOURCE)

if OUT.exists() and OUT.stat().st_size > 1000:
    print(f'SKIP exists {OUT}')
else:
    print(f'GENERATE Local Compute v3b repair motion from {SOURCE}', flush=True)
    url = image2video(
        SOURCE,
        PROMPT,
        model='kling-v3',
        duration=5,
        aspect_ratio='16:9',
        mode='pro',
        negative_prompt=NEGATIVE,
        cfg_scale=0.22,
        poll_interval=15,
        timeout=1200,
    )
    print('Kling URL received', flush=True)
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    OUT.write_bytes(r.content)
    print(f'OK {OUT} {OUT.stat().st_size//1024}KB', flush=True)

print('DONE Local Compute v3b repair motion', flush=True)
