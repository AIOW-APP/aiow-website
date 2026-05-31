#!/usr/bin/env python3
"""Generate lock-first AIOW motion proofs.

Grammar for every clip:
1. real physical slot/lock/key is visible first;
2. no glow before seating/turn/click;
3. after lock action, layer reacts with restrained routes/glow/nodes.
"""
import pathlib
import requests
import sys

sys.path.insert(0, '/Users/handsomebastard/debbie')
from agents.kling_client import image2video

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
OUTDIR = ROOT / 'public/aiow/story-v416/proofs/motion/lock-first-v2'
OUTDIR.mkdir(parents=True, exist_ok=True)

NEGATIVE = (
    'key pulling out, key sliding sideways, moving pivot, floating key, pasted key, flat overlay, '
    'key lying on top, key on surface, loose wide slot, oversized rectangular dock, unclear contact point, '
    'morphing key, morphing lock, changing hand anatomy, extra fingers, fused fingers, rubber skin, '
    'glow before insertion, glow before turn, solution before lock, instant activation, big holograms, '
    'fake dashboard clutter, readable UI text, captions, watermark, crypto symbols, coin, token, '
    'audio mixing desk, faders, knobs, equalizer lights, cyberpunk neon, camera shake, zoom, pan, jitter, low quality, blurry'
)

SCENES = [
    {
        'name': 'model-router-slot-turn-layer-routes-v1',
        'source': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/02-model-router-secure-hardware-bay-v3.png',
        'aspect_ratio': '16:9',
        'prompt': '''
Premium realistic AIOW model router product-film motion. Use the source image as the exact composition: professional operator hand, secure hardware bay, real physical key/slot mechanism integrated into the model router layer. Preserve camera angle, materials, hand anatomy, key contact, and calm dark graphite/champagne palette.

The scene starts locked and almost still. The key is physically seated in a narrow real keyway/slot; it must never float, lie on top, or become a pasted graphic. First second: no glow, no routes, just the visible slot/lock. Seconds 1-3: restrained 20-30 degree fixed-axis turn/click inside the keyway. Seconds 3-5: only after the turn completes, warm cream-gold route lines wake from the slot and travel through the model-router hardware lanes, one lane at a time, like a precision operating layer choosing the right model. Keep the activation architectural and subtle, not sci-fi holographic.

Final feeling: the real slot unlocks the model routing layer, and the layer reacts with clean proof-lines.
'''.strip(),
    },
    {
        'name': 'privacy-boundary-lock-opens-safe-routes-v1',
        'source': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/03-privacy-boundary-wide-room-person-unlock-v1.png',
        'aspect_ratio': '16:9',
        'prompt': '''
Premium realistic AIOW privacy boundary motion. Use the source image as the exact composition: wide private operating room, professional woman/operator, real boundary door/lock/keyhole integrated into the privacy layer. Preserve camera angle, anatomy, room geometry, and quiet cinematic palette.

Start with the boundary locked. A real key is already seated in a narrow physical keyhole/slot at the boundary surface. No glow or solution before the lock action. First second: still, locked, visible contact shadow and keyway depth. Seconds 1-3: the key performs a small fixed-axis turn/click, mechanically plausible and restrained. Seconds 3-5: only after the click, safe warm route lines light up inside the private boundary layer: local/masked/cloud-safe paths separate gently, like privacy policy becoming architecture. Keep it premium and realistic; no fake dashboards or neon.

Final feeling: privacy is not a promise; the boundary lock opens and the safe layer routes wake up.
'''.strip(),
    },
    {
        'name': 'local-compute-hardware-lock-local-lane-v1',
        'source': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/07-local-compute-hardware-bay-unlock-v1.png',
        'aspect_ratio': '16:9',
        'prompt': '''
Premium realistic AIOW local compute hardware motion. Use the source image as the exact composition: local hardware bay, real key/lock mechanism integrated into the rack or compute enclosure, clean operator/product-film mood. Preserve the camera, key contact, lock geometry, rack details, and calm graphite/champagne palette.

Start with the hardware layer locked and quiet. The key is physically inserted in the rack slot/keyhole, not floating and not pasted on top. First second: no glow, no pulses. Seconds 1-3: the key seats/clicks and turns 20-30 degrees around the fixed keyway axis. Seconds 3-5: after the turn, a restrained warm pulse enters the hardware bay and one local compute lane comes alive: small rack indicators, route seam, and proof-line glow. No dashboards, no sci-fi overload, no UI text.

Final feeling: the hardware lock turns, and work drops into the local lane.
'''.strip(),
    },
]


def download(url: str, out: pathlib.Path):
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    out.write_bytes(r.content)
    print(f'OK {out} {out.stat().st_size//1024}KB', flush=True)


for scene in SCENES:
    source = scene['source']
    out = OUTDIR / f"{scene['name']}.mp4"
    if not source.exists():
        raise FileNotFoundError(source)
    if out.exists() and out.stat().st_size > 100_000:
        print(f'SKIP existing {out}', flush=True)
        continue
    print(f"GENERATE {scene['name']} from {source}", flush=True)
    url = image2video(
        source,
        scene['prompt'],
        model='kling-v3',
        duration=5,
        aspect_ratio=scene['aspect_ratio'],
        mode='pro',
        negative_prompt=NEGATIVE,
        cfg_scale=0.35,
        poll_interval=15,
        timeout=1200,
    )
    print('Kling URL received', flush=True)
    download(url, out)

print('DONE lock-first motion batch', flush=True)
