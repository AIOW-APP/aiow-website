#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/mobile'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'privacy_v1': OUT / 'mobile-03-privacy-boundary-room-person-v1.png',
    'router_v1': OUT / 'mobile-05-model-router-hardware-bay-v1.png',
    'operator_v1': OUT / 'mobile-06-operator-room-unlock-v1.png',
    'intake_mobile': OUT / 'mobile-02-intake-keyhole-insertion-v1.png',
    'compute_mobile': OUT / 'mobile-04-local-compute-hardware-bay-v1.png',
    'final_mobile': OUT / 'mobile-final-aiow-control-room-foreground-lock-v1.png',
    'operator_desktop': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
}

base = """
Premium photoreal AIOW AI Key MOBILE vertical styleframe, 9:16 portrait, composed for phone not cropped from desktop. Critical rule: the AIOW AI Key must be clearly physically inserted into a real mechanical keyhole/lock in the center-safe lower/middle area. Key blade/teeth disappear into dark keyway, lock lip overlaps blade, contact shadow and seam depth visible. Top 20-25 percent calm/dark for copy overlay. Dark graphite, smoked glass, brushed champagne metal, warm cream-gold activation from keyhole seam only. No pasted/floating key, no decorative plaque, no fake dashboard text, no crypto/coin/token, no audio mixing desk, no faders/knobs/equalizer rows, no cheap cyberpunk, no fashion-stock pose, no unreadable labels, no extra fingers.
""".strip()

scenes = [
    {
        'name': 'mobile-03-privacy-boundary-room-person-v2.png',
        'refs': ['master', 'golden', 'privacy_v1', 'intake_mobile'],
        'prompt': """
Repair the privacy boundary mobile scene. Keep the premium vertical private-room/corridor feeling, but move the hand/key/lock larger and more central. A calm professional woman is still visible 3/4 body, but the foreground/midground physical door lock is the primary focus. The AIOW AI Key is already inserted and turned in a real privacy boundary door lock, lower-middle center-safe, readable at phone size. Door/room behind softly activates. No tiny key at edge, no wide environment dominance.
""".strip(),
    },
    {
        'name': 'mobile-05-model-router-hardware-bay-v2.png',
        'refs': ['master', 'golden', 'router_v1', 'compute_mobile'],
        'prompt': """
Repair the model router mobile scene. Secure vertical router hardware bay, sealed enterprise AI routing modules, NOT an audio/mixing desk. Raise and enlarge the key/lock action so it sits around lower-middle/center-safe area, clearly readable on phone. A professional woman's hand turns the AIOW AI Key in a real hardware module keyhole; 3-4 thin warm model lanes activate upward through physical ports. No abstract tiny lock at bottom, no circuit-board UI, no faders, no knobs, no equalizer lights.
""".strip(),
    },
    {
        'name': 'mobile-06-operator-room-unlock-v2.png',
        'refs': ['master', 'golden', 'operator_v1', 'operator_desktop', 'final_mobile'],
        'prompt': """
Full rerender/repair of the operator room mobile scene. Make it a medium mobile portrait shot, not a wide control-room environment. A calm Debbie-like professional woman is visible full or 3/4 body in a refined AIOW operating room, but the physical lock/key ritual is clearly readable in the lower-middle center-safe area. She inserts/turns the AIOW AI Key in a wall or table-edge mechanical lock; room architecture activates softly from that exact keyhole. Avoid curved console/mixing desk look. No generic wide command center. Human, purposeful, premium, with real key/lock as the hero.
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

print('OK generated mobile repair v2 scenes in', OUT)
