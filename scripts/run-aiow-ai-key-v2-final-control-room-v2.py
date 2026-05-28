#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots'
OUT.mkdir(parents=True, exist_ok=True)

refs = [
    ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/03-privacy-boundary-wide-room-person-unlock-v1.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/02-model-router-secure-hardware-bay-v3.png',
    ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/07-local-compute-hardware-bay-unlock-v1.png',
]

prompt = """
Premium photoreal final AIOW Control Room v2 styleframe, wide cinematic hero payoff but with a large unmistakable physical keyhole ritual in the foreground.

Composition: foreground left or foreground right contains a large machined graphite/champagne wall lock or table-edge lock, close enough that the AIOW AI Key is clearly physically inserted inside a real dark keyway. The key blade and teeth disappear into the slot; the lock lip overlaps the blade; tight contact shadow and seam occlusion prove it is not pasted on top. A professional Debbie-like female operator is visible mid-ground/background, calm and purposeful, in a refined dark operating room. The wider control room is visible behind her: privacy boundary, model routing hardware, local compute bay and proof/archive surfaces are present as physical architecture, not dashboard screens.

Moment: the key has just completed a 20-30 degree quarter-turn. Only now the room comes online. Restrained warm cream-gold light starts from the keyhole seam and travels as thin physical route/proof lines into the room architecture. The final room is the payoff, but the key-in-keyhole foreground action must remain the clear anchor.

Style: Oryzo-clean premium product-film, dark graphite, smoked glass, brushed champagne metal, tactile shadows, negative space, elegant calm. No circular activation table as the main object. No glowing token/disc/platform. No fake dashboard wall, no readable UI text, no hologram overload, no crypto, no coin, no sci-fi clutter, no cheap cyberpunk, no spy drama, no fashion-stock pose, no floating/pasted key, no flat decorative plaque, no extra fingers, no hand distortion.
""".strip()

out = OUT / '08-final-aiow-control-room-foreground-lock-v2.png'
cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
for ref in refs:
    cmd.extend(['--ref', str(ref)])
print('RUN', out)
subprocess.run(cmd, check=True)
print('OK', out)
