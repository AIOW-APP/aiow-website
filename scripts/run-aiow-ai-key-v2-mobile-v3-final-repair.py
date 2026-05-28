#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/mobile'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'operator_v2': OUT / 'mobile-06-operator-room-unlock-v2.png',
    'final_v1': OUT / 'mobile-final-aiow-control-room-foreground-lock-v1.png',
    'intake_mobile': OUT / 'mobile-02-intake-keyhole-insertion-v1.png',
    'router_v2': OUT / 'mobile-05-model-router-hardware-bay-v2.png',
    'compute_mobile': OUT / 'mobile-04-local-compute-hardware-bay-v1.png',
}

base = """
Premium photoreal AIOW AI Key MOBILE vertical styleframe, 9:16 portrait, composed for phone. Must be mobile-first, not a desktop crop. Critical: the AIOW AI Key must be clearly physically inserted into a real mechanical keyhole/lock, readable at phone size, center-safe in the lower/middle area. Key blade/teeth disappear into a dark keyway; lock lip overlaps blade; contact shadows and occlusion prove physical insertion. Top 20-25 percent calm/dark copy-safe. Dark graphite, smoked glass, brushed champagne metal, warm cream-gold activation from the keyhole only after seating/turn. No pasted/floating key, no decorative plaque, no fake dashboard text, no unreadable labels, no crypto/coin/token, no audio mixing desk, no faders/knobs, no cheap cyberpunk, no fashion-stock pose, no extra fingers.
""".strip()

scenes = [
    {
        'name': 'mobile-06-operator-room-unlock-v3.png',
        'refs': ['master', 'golden', 'operator_v2', 'intake_mobile', 'compute_mobile'],
        'prompt': """
Repair the operator room mobile scene. Convert the wide corridor into a tighter medium portrait composition. A calm Debbie-like professional woman is visible from thigh/waist up in a refined operating room, but the physical key/lock ritual is the hero. The lock/key must be 25-35% larger than v2, near center-safe lower-middle, with her hand turning the inserted AIOW AI Key in a wall or console-edge mechanical lock. The room softly activates behind her from that exact keyhole. Keep some room/person context, but no wide establishing shot, no curved desk, no control-console dominance.
""".strip(),
    },
    {
        'name': 'mobile-final-aiow-control-room-foreground-lock-v2-clean.png',
        'refs': ['master', 'golden', 'final_v1', 'router_v2'],
        'prompt': """
Clean repair of final control room mobile hero. Preserve the strong large foreground physical key/lock and premium AIOW control room depth, but remove background labels, text panels, fake UI/dashboard modules and unreadable typography. Background should be abstract architecture, warm route seams, quiet control-room depth. Key head must clearly read as a physical key, not coin/token: visible neck/blade/teeth inserted into a real keyway with metal occlusion. Top copy area quiet/dark. Room activation glow originates only from the physical keyhole seam after turn.
""".strip(),
    },
]

for scene in scenes:
    out = OUT / scene['name']
    if out.exists() and out.stat().st_size > 1000:
        print(f'SKIP exists {out}')
        continue
    prompt = base + "\n\nScene repair: " + scene['prompt']
    cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1024x1536', '--quality', 'high', '--out', str(out)]
    for key in scene['refs']:
        cmd.extend(['--ref', str(REFS[key])])
    print('RUN', out.name)
    subprocess.run(cmd, check=True)

print('OK generated mobile v3/final clean repairs in', OUT)
