#!/usr/bin/env python3
import pathlib, subprocess, shlex, textwrap

ROOT = pathlib.Path('/Users/handsomebastard/projects/aiow-website')
GEN = pathlib.Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')
OUT = ROOT / 'public/aiow/story-v416/proofs/scene-set-v1'
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    'master': ROOT / 'public/aiow/story-v416/proofs/master-key-v2.png',
    'golden': ROOT / 'public/aiow/story-v416/proofs/intake-true-keyhole-insertion-v4.png',
    'motion_style': ROOT / 'public/aiow/story-v416/proofs/intake-hand-key-proof-v2.png',
    'router': ROOT / 'public/aiow/story-v416/proofs/model-router-hand-key-proof-v2.png',
}

base_negative = """
No key lying on top of surface, no pasted key, no floating key, no flat overlay, no broad generic slot, no padlock cliché, no fake dashboard, no busy circuit board, no sci-fi neon excess, no crypto symbols, no readable text, no watermark, no extra fingers, no fused fingers, no rubber skin, no impossible wrist, no warped key, no melted metal, no random UI clutter.
""".strip()

scenes = [
    {
        'name': '02-model-router-keyturn-styleframe-v1.png',
        'refs': ['master', 'golden', 'router'],
        'prompt': """
Create a premium photoreal macro product-film still for AIOW Scene 02: Model Router. Preserve the same AIOW AI Key identity/material from the master reference and the same physical key-in-lock feel from the golden insertion reference. A realistic woman's hand with tasteful nude nail polish holds the key already inserted in a real machined keyhole/lock body, not on top of a surface. The lock is integrated into a refined dark graphite and brushed champagne-gold routing console, but not a busy dashboard. The key has just turned like a switch-on action; a restrained cream-gold seam glow appears from the keyhole. From the seam, 3 to 4 thin organized route lanes begin to split outward, abstract and elegant, suggesting choosing the right model/tool path. Calm Oryzo-like negative space, warm dark premium lighting, shallow depth of field, tactile metal, no readable text.
""".strip()
    },
    {
        'name': '03-privacy-boundary-keyturn-styleframe-v1.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium photoreal macro product-film still for AIOW Scene 03: Privacy Boundary. Use the same AIOW AI Key identity/material from the master reference and the same physical insertion feel from the golden reference: real key inside a real lock/keyhole, lock body wrapping around the blade, not pasted on. A different realistic woman's hand, darker skin tone, tasteful subtle nude nail polish, naturally grips the key after a restrained switch-on turn. The lock is embedded in a heavy local-data boundary surface: dark ceramic, brushed brass, privacy-vault materiality, calm not hacker-like. After the turn, a soft cream-gold boundary ring closes around the lock and a few masked document/data lanes glow very subtly from the seam. No padlock icon, no cybersecurity cliché, no readable text, no busy UI.
""".strip()
    },
    {
        'name': '04-agent-workflow-gate-keyturn-styleframe-v1.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium photoreal macro product-film still for AIOW Scene 04: Agent Workflow Gate. Preserve the same AIOW AI Key material and the same real keyhole insertion mechanics: key visibly inside the lock, physical depth, lock lip/body occluding the blade, not on a flat surface. A realistic Latina woman's hand with subtle warm beige nail polish holds the key after a restrained switch-on turn. The lock is part of a precision workflow rail / approval console: dark graphite rails, brushed champagne accents, small abstract workflow modules waking up in sequence after the turn. The activation begins only from the keyhole seam as a restrained cream-gold glow and tiny ordered pulses. No robots, no cartoon agents, no busy kanban, no readable labels.
""".strip()
    },
    {
        'name': '05-proof-audit-keyturn-styleframe-v1.png',
        'refs': ['master', 'golden'],
        'prompt': """
Create a premium photoreal macro product-film still for AIOW Scene 05: Proof / Audit Layer. Preserve the same AIOW AI Key material and the same real physical key-in-keyhole read: the key blade is inside a real machined lock, the lock body wraps around it, with contact shadow and depth. A realistic older woman's hand, elegant mature skin texture, tasteful pearl nude nail polish, turns the key like switching on a proof ledger. The lock is embedded in a dark proof/audit surface with brushed brass rim and subtle paper/receipt-trace material cues. After the turn, restrained cream-gold proof-lines and receipt-like traces activate from the seam. No blockchain cliché, no crypto, no fake metrics, no readable gibberish text, no dashboard clutter.
""".strip()
    },
]

for scene in scenes:
    out = OUT / scene['name']
    if out.exists() and out.stat().st_size > 1000:
        print(f'SKIP exists {out}')
        continue
    prompt = scene['prompt'] + "\n\nNegative constraints: " + base_negative
    cmd = ['python3', str(GEN), prompt, '--model', 'gpt-image-2', '--size', '1536x1024', '--quality', 'high', '--out', str(out)]
    for r in scene['refs']:
        cmd.extend(['--ref', str(REFS[r])])
    print('RUN', out.name)
    subprocess.run(cmd, check=True)

print(f'OK generated scene refs in {OUT}')
