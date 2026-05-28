#!/usr/bin/env python3
"""Generate stronger Local Compute stills for AIOW AI Key story.

Goal: fix the weak Local Compute scene at the still level before motion.
Hard requirement: visible physical rack lock/keyway first; AI Key mechanically seats in it;
local compute layer reacts only after the lock turn. Avoid token/chip/HUD readings.
"""
import pathlib
import subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/local-compute-rack-lock-v3'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'router': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/02-model-router-secure-hardware-bay-v3.png',
    'old_local': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/07-local-compute-hardware-bay-unlock-v1.png',
    'operator': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
}

negative = """
No token, no access chip, no credit-card reader, no loose badge, no key lying on top, no flat sticker key, no floating key, no oversized rectangular dock, no wide loose slot, no glow before insertion/turn, no fake dashboard clutter, no sci-fi neon excess, no server-room mess, no crypto, no coin, no audio mixing desk, no readable text, no watermark, no fashion-stock pose, no overdramatic spy scene, no extra fingers, no fused fingers, no rubber skin, no unclear contact point, no morphing key.
""".strip()

scenes = [
    {
        'name': 'local-compute-rack-lock-foreground-keyway-v3a.png',
        'refs': ['master', 'golden', 'router'],
        'prompt': """
Premium photoreal AIOW Local Compute scene, product-film still, dark graphite and champagne metal. Composition: large foreground server rack lock/keyway on the right third, clearly a real mechanical vertical keyhole cut into a brushed-metal local compute rack door. A professional woman's hand inserts the same AIOW AI Key physically into the keyway; the blade is seated inside the slot, not on top. The rack modules sit behind it in soft focus. The moment is just after seating, before the full activation: only a tiny warm cream-gold seam appears at the keyway, while the local compute lane behind remains mostly dormant. Calm Oryzo-clean negative space, tactile hardware, no dashboard wall.
""".strip(),
    },
    {
        'name': 'local-compute-rack-lock-quarter-turn-v3b.png',
        'refs': ['master', 'golden', 'old_local', 'operator'],
        'prompt': """
Premium photoreal AIOW Local Compute / owned hardware bay scene. Medium-close shot with full forearm visible: an older professional woman calmly turns the AIOW AI Key inside a real rack-mounted mechanical key switch. The key is visibly inserted into a narrow metal keyway and rotated a quarter turn; the hand grip and contact point are anatomically correct. After the click, subtle cream-gold local compute rails wake inside the rack: tiny physical status pins and short routed light lanes, not HUD graphics. The lock/key is the cause; the hardware layer reacts afterward. Refined operating room, engineered, quiet, premium.
""".strip(),
    },
    {
        'name': 'local-compute-rack-lock-wide-room-v3c.png',
        'refs': ['master', 'router', 'operator'],
        'prompt': """
Premium cinematic wide AIOW Local Compute scene inside a calm private operating room. A professional operator stands beside a compact local compute cabinet. In the foreground, the cabinet has an oversized but realistic physical rack lock/keyhole, and the AIOW AI Key is inserted into it with clear mechanical seating. The slot is visible first; from the lock seam, restrained cream-gold lines run into owned compute modules, showing the local lane coming online after the turn. Vary the shot from macro: person + arm + hardware bay visible, but key/slot remains unmistakable. No abstract token, no screen UI, no fake data.
""".strip(),
    },
]

for scene in scenes:
    out = OUT / scene['name']
    if out.exists() and out.stat().st_size > 1000:
        print(f'SKIP exists {out}')
        continue
    prompt = scene['prompt'] + "\n\nNegative constraints: " + negative
    cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
    for r in scene['refs']:
        ref = REFS[r]
        if ref.exists():
            cmd.extend(['--ref', str(ref)])
    print('RUN', out.name, flush=True)
    subprocess.run(cmd, check=True)

print(f'OK generated Local Compute rack-lock v3 stills in {OUT}')
