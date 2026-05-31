#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v3-mixed-shots'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'privacy_room': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/03-privacy-boundary-wide-room-person-unlock-v1.png',
    'operating_room': ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots/06-debbie-operating-room-full-person-unlock-v1.png',
}

negative = """
No repetitive macro-only composition, no key pasted on surface, no floating key, no flat UI slot, no fake dashboard wall, no crypto symbols, no neon excess, no sci-fi clutter, no humanoid robots, no fashion stock pose, no cartoon mascot, no extra fingers, no fused fingers, no distorted hands, no unreadable text, no watermark, no overdramatic spy scene, no cheap cyberpunk, no audio mixing desk, no coin/token look.
""".strip()

scenes = [
    {
        'name': '02-model-router-secure-hardware-bay-v3.png',
        'refs': ['master', 'golden', 'operating_room'],
        'prompt': """
Premium photoreal AIOW Model Router scene, medium-wide secure hardware/router bay, not an audio mixing desk. A calm professional operator is partly visible over-shoulder/arm at a dark graphite hardware bay. She inserts and turns the same AIOW AI Key in a real physical keyhole/dock on the side of a sealed router module. After the turn, thin warm cream-gold model lanes activate through physical ports and sealed modules, splitting into 3–4 calm routes. Bespoke secure infrastructure, brushed champagne metal, dark ceramic, tactile product-film lighting, Oryzo-clean negative space, no screens full of fake data, no faders, no readable text.
""".strip(),
    },
    {
        'name': '05-proof-audit-room-operator-table-v3.png',
        'refs': ['master', 'golden', 'privacy_room'],
        'prompt': """
Premium photoreal AIOW Proof/Audit room, medium-wide archive/proof table scene. A mature professional operator stands or sits at a dark audit table in a quiet proof room. Her hand turns the same AIOW AI Key inside a real physical audit dock/keyhole built into the table edge or ledger surface. The key action is readable but not a macro-only shot. After the turn, subtle cream-gold receipt/proof traces activate across physical documents and ledger-like surfaces from the keyhole seam. Dark graphite room, brushed brass details, warm controlled light, elegant mature presence, no blockchain, no crypto, no dashboard, no readable text.
""".strip(),
    },
    {
        'name': '07-local-compute-hardware-bay-unlock-v1.png',
        'refs': ['master', 'golden', 'operating_room'],
        'prompt': """
Premium photoreal AIOW Local Compute / Hardware Bay scene. A professional operator stands beside a refined local compute rack or hardware table inside a calm dark operating room. Her arm reaches to insert and turn the same AIOW AI Key in a real physical keyhole/dock on the hardware bay. The key action is smaller than macro but clearly highlighted by warm cream-gold seam light. After the turn, local compute modules wake softly: tiny physical status pins, warm rails, low internal glow. No server-room clutter, no dashboard wall, no sci-fi neon, no readable text. Oryzo-clean, tactile, engineered.
""".strip(),
    },
    {
        'name': '08-final-aiow-control-room-key-activation-v1.png',
        'refs': ['master', 'golden', 'operating_room', 'privacy_room'],
        'prompt': """
Premium cinematic final AIOW Control Room styleframe, wider hero conclusion. A calm operator/Debbie-like professional is present in a dark refined operating room. The AIOW AI Key has just been turned in a real physical central table slot or wall hardware dock; the key/lock action remains readable but the room is the hero. After the turn, the complete operating layer quietly comes online: restrained cream-gold lines from the lock connect to table rails, privacy boundary, model routing, local compute, and proof surfaces. Elegant dark graphite/champagne materials, negative space, no fake dashboard wall, no hologram overload, no readable text, no spy drama.
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
        cmd.extend(['--ref', str(REFS[r])])
    print('RUN', out.name)
    subprocess.run(cmd, check=True)

print(f'OK generated v3 mixed-shot refs in {OUT}')
