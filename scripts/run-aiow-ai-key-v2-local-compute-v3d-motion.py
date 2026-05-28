#!/usr/bin/env python3
"""Generate Local Compute v3d dormant-source lock-first motion proof."""
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion/local-compute-v3d'
OUTDIR.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'public/aiow/story-v416/proofs/local-compute-rack-lock-v3/local-compute-rack-lock-quarter-turn-v3d-dormant.png'
OUT = OUTDIR / 'local-compute-dormant-rack-lock-click-local-lane-v3d.mp4'

PROMPT = '''
Use the source image as the exact composition. Preserve camera angle, operator, hand anatomy, inserted AIOW AI Key, circular rack-mounted lock/keyway, local compute cabinet, and premium dark graphite/champagne materials.

This is strict lock-first AIOW Local Compute motion. The physical rack lock/keyway is the cause. The local compute layer is dormant until after the key turn/click.

Frame 1 through second 1: locked/off/dormant. The AI Key is already physically seated inside the circular rack lock with contact shadow. Rack modules remain dark, no lane glow, no status pins, no solution, no HUD.

Seconds 1-3: a tiny mechanical seating click and restrained 20-30 degree quarter-turn around the fixed circular lock axis. The hand and key stay connected to the lock; no sliding, no pulling out, no morphing.

Seconds 3-5: only after the click, a new warm cream-gold pulse starts exactly at the keyhole seam, then travels into the local compute modules. Short embedded rack rails and small physical status pins light sequentially from the lock outward/downward. Keep it subtle and real, like hardware waking locally, not a floating UI.

Camera locked. No zoom, no pan. Quiet premium product-film motion.
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
    print(f'GENERATE Local Compute v3d motion from {SOURCE}', flush=True)
    url = image2video(
        SOURCE,
        PROMPT,
        model='kling-v3',
        duration=5,
        aspect_ratio='16:9',
        mode='pro',
        negative_prompt=NEGATIVE,
        cfg_scale=0.24,
        poll_interval=15,
        timeout=1200,
    )
    print('Kling URL received', flush=True)
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    OUT.write_bytes(r.content)
    print(f'OK {OUT} {OUT.stat().st_size//1024}KB', flush=True)

print('DONE Local Compute v3d motion', flush=True)
