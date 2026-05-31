#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/mobile'
OUT.mkdir(parents=True, exist_ok=True)

refs = [
    ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/08-final-aiow-control-room-foreground-lock-v2.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
]

prompt = """
Create a premium photoreal AIOW Final Control Room MOBILE vertical styleframe, composed specifically for 9:16 portrait mobile, not a crop.

Composition for phone: tall vertical frame. The keyhole/key ritual must be readable in the center-safe lower-middle area. A large physical graphite/champagne lock is in the foreground lower third; the same AIOW AI Key is visibly inserted into a real dark keyway. The key blade and teeth disappear into the slot, lock lip overlaps the blade, contact shadow and seam occlusion prove it is inside the mechanism. A calm Debbie-like professional female operator is visible in the mid/background, full or 3/4 body, inside a refined dark AIOW control room. The room rises vertically behind her with privacy boundary, model routing, local compute and proof/archive architecture, all calm and premium.

Mobile-safe layout: leave clean negative space in the top 20-25 percent for minimal headline/copy overlay; keep the lock/key and operator away from extreme left/right edges; no tiny critical details. The phone crop should feel intentional, cinematic and readable at small screen size.

Moment: key has just completed a restrained quarter-turn; subtle cream-gold activation starts from the keyhole seam and travels upward into the room architecture. Dark graphite, smoked glass, brushed champagne metal, warm restrained light, Oryzo-clean, tactile product-film.

Avoid: landscape crop feel, key too small, lock cut off by screen edge, pasted/floating key, flat decorative plaque, unreadable text, fake dashboards, hologram clutter, circular token table, coin/crypto vibe, audio mixing desk, faders, equalizer lights, cheap cyberpunk, fashion-stock pose, extra fingers, distorted hand.
""".strip()

out = OUT / 'mobile-final-aiow-control-room-foreground-lock-v1.png'
cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1024x1536', '--quality', 'high', '--out', str(out)]
for ref in refs:
    cmd.extend(['--ref', str(ref)])
print('RUN', out)
subprocess.run(cmd, check=True)
print('OK', out)
