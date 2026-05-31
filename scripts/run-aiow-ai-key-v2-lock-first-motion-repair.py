#!/usr/bin/env python3
"""Repair weak lock-first AIOW motion proofs.

Targets:
- local compute: previous v1 lacked explicit lock/keyhole
- privacy boundary: previous v1 became too HUD/dashboard-like
"""
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion/lock-first-v2-repair'
OUTDIR.mkdir(parents=True, exist_ok=True)

NEGATIVE = (
    'loose token, access card, key held away from lock, key pulling out, key sliding sideways, moving pivot, '
    'floating key, pasted key, flat overlay, key lying on top, key on surface, loose wide slot, oversized dock, '
    'unclear contact point, morphing key, morphing lock, changing hand anatomy, extra fingers, fused fingers, rubber skin, '
    'glow before insertion, glow before turn, solution before lock, instant activation, hologram panel, HUD rectangle, dashboard popup, '
    'fake dashboard clutter, readable UI text, captions, watermark, crypto symbols, coin, token, audio mixing desk, faders, knobs, '
    'cyberpunk neon, camera shake, zoom, pan, jitter, low quality, blurry'
)

SCENES = [
    {
        'name': 'local-compute-foreground-rack-lock-layer-lane-v2',
        'source': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/07-local-compute-hardware-bay-unlock-v1.png',
        'prompt': '''
Premium realistic AIOW local compute hardware motion. Keep the source image composition and hardware bay, but make the physical rack lock/keyhole the clear functional anchor. The viewer must understand: key in real rack lock first, then local compute layer wakes.

At frame 1, a narrow physical keyway/slot in the rack is visible with the AIOW key already seated into it. The key blade is partially hidden by the lock lip with clear contact shadow. It must not read as a loose token, access card, or object held away from the lock. First second: absolutely no new glow, no lane activation, hardware is quiet. Seconds 1-3: tiny mechanical seating click and restrained 20-30 degree turn around a fixed rack-lock axis. Seconds 3-5: only after the turn, one warm cream-gold lane travels from the keyhole seam into the server bay; a few rack indicators wake sequentially like local work being accepted. No HUD panels, no text, no fake dashboard. Camera locked, premium realistic materials.
'''.strip(),
    },
    {
        'name': 'privacy-boundary-physical-slot-safe-routes-v2',
        'source': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/03-privacy-boundary-wide-room-person-unlock-v1.png',
        'prompt': '''
Premium realistic AIOW privacy boundary motion. Preserve the source room, operator, boundary architecture and quiet dark/champagne palette. The motion must read as a real physical boundary lock unlocking safe routes inside the layer.

At the start, show a real narrow boundary slot/keyhole with the key already physically seated. First second: locked and still, no routes, no UI panels, no glow except ambient room light. Seconds 1-3: small fixed-axis key turn/click in the boundary lock. Seconds 3-5: only after the click, thin warm route seams travel through the architecture of the boundary itself: local, masked and cloud-safe paths separate as embedded light lines in the wall/floor layer. Do not create rectangular HUD cards, dashboards, labels, screens, or readable text. The solution must feel built into the room, not projected on top.
'''.strip(),
    },
]

for scene in SCENES:
    source = scene['source']
    out = OUTDIR / f"{scene['name']}.mp4"
    if not source.exists():
        raise FileNotFoundError(source)
    print(f"GENERATE {scene['name']} from {source}", flush=True)
    url = image2video(
        source,
        scene['prompt'],
        model='kling-v3',
        duration=5,
        aspect_ratio='16:9',
        mode='pro',
        negative_prompt=NEGATIVE,
        cfg_scale=0.32,
        poll_interval=15,
        timeout=1200,
    )
    print('Kling URL received', flush=True)
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    out.write_bytes(r.content)
    print(f'OK {out} {out.stat().st_size//1024}KB', flush=True)

print('DONE repair batch', flush=True)
