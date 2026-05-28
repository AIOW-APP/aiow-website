#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots'
OUT.mkdir(parents=True, exist_ok=True)

out = OUT / '05-proof-audit-desk-room-v3.png'
refs = [
    ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v1/05-proof-audit-keyturn-styleframe-v2.png',
]

prompt = """
Premium photoreal AIOW proof/audit room, medium-wide desk scene. A mature professional operator at a dark proof table turns the same AIOW AI Key in a real physical audit dock/keyhole on the table edge. The key is visibly inside the lock, not pasted on. Warm cream-gold seam glow appears after the turn. Subtle receipt-like proof lines activate across physical documents and ledger surfaces. Dark graphite, brushed brass, calm archive atmosphere, premium product-film lighting, no readable text, no dashboard.

Negative: pasted key, floating key, flat slot, fake dashboard, crypto, neon clutter, robots, stock pose, extra fingers, distorted hands, readable text, watermark.
""".strip()

cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
for r in refs:
    cmd.extend(['--ref', str(r)])
print('RUN proof audit v3 retry')
subprocess.run(cmd, check=True)
print(f'OK {out}')
