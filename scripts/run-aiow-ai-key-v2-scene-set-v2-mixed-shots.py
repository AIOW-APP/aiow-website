#!/usr/bin/env python3
import pathlib, subprocess

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v2-mixed-shots'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'motion': ROOT / 'public/aiow/story-v416/proofs/motion/intake-true-insertion-quarterturn-kling-v2-fixed-pivot-contact.jpg',
}

negative = """
No repetitive macro-only composition, no key pasted on surface, no floating key, no flat UI slot, no fake dashboard, no crypto symbols, no neon excess, no sci-fi clutter, no humanoid robots, no fashion stock pose, no cartoon mascot, no extra fingers, no fused fingers, no distorted hands, no unreadable text, no watermark, no overdramatic spy scene, no cheap cyberpunk.
""".strip()

scenes = [
    {
        'name': '03-privacy-boundary-wide-room-person-unlock-v1.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium cinematic wide-room styleframe for AIOW Privacy Boundary. A calm professional woman/operator is seen from behind in three-quarter view entering a dark refined private data room. She holds the same AIOW AI Key and inserts it into a real physical wall/door lock on the boundary threshold. The lock/key action is smaller than a macro shot but still clearly readable, highlighted by warm cream-gold light and shallow focus. After the key turn, a vertical boundary seam glows subtly and the private room beyond wakes with restrained local-data light. Dark graphite walls, brushed brass lock plate, calm Oryzo-like negative space, premium product-film atmosphere. Not a spy scene, not fashion stock, not a dashboard.
""".strip()
    },
    {
        'name': '06-debbie-operating-room-full-person-unlock-v1.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium cinematic full-room styleframe for AIOW: Debbie/operator enters the AIOW operating room and turns the AIOW AI Key. The person is tasteful, realistic, calm, professional, not mascot, not cartoon, not fashion stock. Show more of the body and room than a macro hand shot: a full or three-quarter person near a wall hardware bay/door dock, inserting the same dark titanium and champagne-gold AIOW AI Key into a real physical keyhole. The keyhole is smaller in the scene but visibly real, with warm cream-gold activation glow after the turn. The room quietly comes online: subtle rails, local compute surfaces, soft proof-lines, dark graphite/champagne materials, no readable text, no dashboard clutter.
""".strip()
    },
    {
        'name': '02-model-router-medium-arm-console-v2.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium medium-shot styleframe for AIOW Model Router with more environmental variation than a macro lock shot. Show forearm + hand at a refined routing console, inserting and turning the AIOW AI Key in a real physical console keyhole. The lock is in the foreground/side of the console, the arm and part of the operator are visible, and the routing surface extends into the background. After the key turn, 3–4 thin warm route lanes split outward from the keyhole across the console. Physical, tactile, dark graphite, brushed champagne metal, Oryzo-clean. No dashboard screens, no fake metrics, no neon circuit board.
""".strip()
    },
    {
        'name': '05-proof-audit-desk-room-v3.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium desk-room hybrid styleframe for AIOW Proof/Audit Layer. Show an older professional woman/operator at a dark audit/proof table, not just a macro hand. Her hand turns the AIOW AI Key inside a real physical audit dock/keyhole on the table edge or ledger surface. The key action is clear and physical, with lock body wrapping the blade and warm seam glow after the turn. Across the table, subtle receipt-like proof traces and document-light lines activate from the keyhole, physical and restrained. Dark graphite table, brushed brass lock, mature elegant hand/persona, calm archive/proof room atmosphere. No blockchain cliché, no crypto, no dashboard, no readable text.
""".strip()
    },
]

for scene in scenes:
    out = OUT / scene['name']
    prompt = scene['prompt'] + "\n\nNegative constraints: " + negative
    cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
    for r in scene['refs']:
        cmd.extend(['--ref', str(REFS[r])])
    print('RUN', out.name)
    subprocess.run(cmd, check=True)

print(f'OK generated mixed-shot refs in {OUT}')
