#!/usr/bin/env python3
import json, subprocess, sys
from pathlib import Path

MANIFEST = Path('/Users/handsomebastard/projects/aiow-website/evidence/aiow-ai-key-v2-proof-run-001.json')
GEN = Path('/Users/handsomebastard/debbie/scripts/gpt_image_gen.py')

def main():
    data = json.loads(MANIFEST.read_text())
    for job in data['jobs']:
        out = Path(job['out'])
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists() and out.stat().st_size > 100_000:
            print(f"SKIP exists {job['id']} {out} {out.stat().st_size}")
            continue
        cmd = [sys.executable, str(GEN), job['prompt'], '--model', 'gpt-image-2', '--size', job['size'], '--quality', 'high', '--out', str(out)]
        print(f"RUN {job['id']} -> {out}", flush=True)
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=420)
        if p.returncode != 0:
            print(f"FAIL {job['id']} code={p.returncode}", file=sys.stderr)
            print((p.stderr or p.stdout)[-1000:], file=sys.stderr)
            sys.exit(p.returncode)
        print(p.stdout.strip())
    print('DONE')

if __name__ == '__main__':
    main()
