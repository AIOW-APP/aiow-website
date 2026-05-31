#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/mobile'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'privacy_desktop': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/03-privacy-boundary-wide-room-person-unlock-v1.png',
    'operator_room': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
    'router_desktop': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/02-model-router-secure-hardware-bay-v3.png',
    'compute_desktop': ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots/07-local-compute-hardware-bay-unlock-v1.png',
    'final_mobile': ROOT / 'public/aiow/story-v416/proofs/mobile/mobile-final-aiow-control-room-foreground-lock-v1.png',
}

base = """
Create a premium photoreal AIOW AI Key MOBILE vertical styleframe, composed specifically for 9:16 portrait mobile, not a desktop crop. Keep all critical action in the center-safe area. Leave calm negative space in the top 20-25 percent for minimal headline/copy overlay. The AIOW AI Key must be physically inserted into a real dark keyway/lock: blade and teeth disappear into the slot, lock lip overlaps the blade, contact shadow and seam occlusion prove it is inside the mechanism. Warm cream-gold activation begins from the keyhole seam only after the key turn. Dark graphite, smoked glass, brushed champagne metal, restrained premium Oryzo-clean product-film lighting.

Avoid: landscape crop feel, key too small, lock cut off by screen edge, pasted/floating key, flat decorative plaque, generic dashboard, unreadable AI text, crypto/coin/token, audio mixing desk, faders, equalizer lights, cheap cyberpunk, hologram clutter, fashion-stock pose, extra fingers, distorted hands.
""".strip()

scenes = [
    {
        'name': 'mobile-02-intake-keyhole-insertion-v1.png',
        'refs': ['master', 'golden', 'final_mobile'],
        'prompt': """
Mobile portrait Intake scene. A realistic female hand holds the same AIOW AI Key close to camera, already seated in a machined lock/keyhole built into a dark intake door or queue module. This is the clearest mobile proof of true insertion: large foreground lock in lower-middle center-safe area, key shaft visibly inside, subtle final-click/quarter-turn glow. Background hints at incoming work/mail/chat/documents as abstract physical slots, not screens full of text. Keep top area quiet for copy.
""".strip(),
    },
    {
        'name': 'mobile-03-privacy-boundary-room-person-v1.png',
        'refs': ['master', 'golden', 'privacy_desktop', 'final_mobile'],
        'prompt': """
Mobile portrait Privacy Boundary scene. Vertical secure corridor / private room threshold. A calm professional woman/operator stands 3/4 body in mid-ground, inserting and turning the AIOW AI Key in a real lock on a privacy boundary door or glass-metal wall. The lock/key is center-safe lower-middle and readable at phone size. Behind the door, private local-safe architecture glows softly. No unreadable labels except possibly tiny intentional AIOW mark.
""".strip(),
    },
    {
        'name': 'mobile-05-model-router-hardware-bay-v1.png',
        'refs': ['master', 'golden', 'router_desktop', 'operator_room'],
        'prompt': """
Mobile portrait Model Router scene. Tall secure hardware/router bay, not an audio mixing desk. A professional woman's arm/hand reaches into a vertical sealed router module and turns the AIOW AI Key in a real physical keyhole. After the turn, 3-4 restrained cream-gold model lanes travel upward through physical ports and modules. Make hardware vertical, sealed, architectural; no knobs/faders/equalizer rows. Key/lock must remain readable in lower-middle center-safe phone area.
""".strip(),
    },
    {
        'name': 'mobile-04-local-compute-hardware-bay-v1.png',
        'refs': ['master', 'golden', 'compute_desktop', 'operator_room'],
        'prompt': """
Mobile portrait Local Compute scene. Refined local compute/server hardware bay in a calm dark operating room. The operator unlocks a vertical compute cabinet/wall module with the same AIOW AI Key; the lock is real, physical, center-safe, with key blade inserted and seam glow starting after quarter-turn. Compute modules wake upward as small warm physical status pins and internal rails, not dashboard screens. Premium, tactile, not cluttered server-room.
""".strip(),
    },
    {
        'name': 'mobile-06-operator-room-unlock-v1.png',
        'refs': ['master', 'golden', 'operator_room', 'final_mobile'],
        'prompt': """
Mobile portrait Debbie/operator room scene. A calm Debbie-like professional woman is visible full or 3/4 body in a refined dark AIOW operating room. She enters/stands near a physical wall/table-edge lock and turns the AIOW AI Key. The key/lock is prominent enough for phone, lower-middle center-safe, while the room rises vertically behind her and softly activates after the turn. Human, premium, purposeful; not fashion stock, not spy drama.
""".strip(),
    },
]

for scene in scenes:
    out = OUT / scene['name']
    if out.exists() and out.stat().st_size > 1000:
        print(f'SKIP exists {out}')
        continue
    prompt = base + "\n\nScene: " + scene['prompt']
    cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1024x1536', '--quality', 'high', '--out', str(out)]
    for key in scene['refs']:
        cmd.extend(['--ref', str(REFS[key])])
    print('RUN', out.name)
    subprocess.run(cmd, check=True)

print('OK generated mobile core scenes in', OUT)
