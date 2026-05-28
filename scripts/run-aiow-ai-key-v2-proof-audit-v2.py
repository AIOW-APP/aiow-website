#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v1'

refs = [
    ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    OUT / '05-proof-audit-keyturn-styleframe-v1.png',
]

out = OUT / '05-proof-audit-keyturn-styleframe-v2.png'

prompt = """
Create a refined v2 photoreal macro product-film still for AIOW Scene 05 Proof / Audit Layer. Improve the previous proof-audit scene by making the key-in-lock action as physically convincing as the golden insertion reference: the same AIOW AI Key is visibly deeper inside a real machined round lock/keyhole, with the lock body wrapping around the blade, clear contact shadow, visible metal-on-metal depth, and no pasted-on surface feeling.

A realistic older woman's hand with elegant mature skin texture and tasteful pearl nude nail polish holds the key after a restrained switch-on turn. Keep the proof/audit meaning, but simplify the composition: the lock/key is the hero; the audit document/proof traces are secondary and calm. Reduce the dominance of the lens/portal shape. Use dark graphite, brushed brass/champagne rim, warm cream-gold seam glow only from the keyhole, and subtle receipt-like proof lines reflected across a paper/audit surface after the turn.

Premium Oryzo-clean negative space, tactile high-end product-film lighting, shallow depth of field, no readable text, no fake dashboard, no crypto, no blockchain cliché, no neon clutter.

Negative constraints: no key lying on top of surface, no pasted key, no floating key, no flat overlay, no broad generic slot, no padlock cliché, no fake dashboard, no busy circuit board, no sci-fi neon excess, no crypto symbols, no readable text, no watermark, no extra fingers, no fused fingers, no rubber skin, no impossible wrist, no warped key, no melted metal, no random UI clutter.
""".strip()

cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
for r in refs:
    cmd.extend(['--ref', str(r)])
print('RUN proof audit v2')
subprocess.run(cmd, check=True)
print(f'OK {out}')
