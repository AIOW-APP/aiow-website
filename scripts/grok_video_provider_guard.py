#!/usr/bin/env python3
from pathlib import Path
import re, sys, json
root = Path(__file__).resolve().parents[1]
provider = root / 'core/media/video-provider.ts'
generate = root / 'core/content/generate.ts'
pkg = root / 'package.json'
missing = []
if not provider.exists():
    missing.append('core/media/video-provider.ts')
else:
    text = provider.read_text()
    checks = {
        'provider union includes grok/kling': r"VideoProvider\s*=\s*['\"]grok['\"]\s*\|\s*['\"]kling['\"]",
        'default chooses grok': r"DEFAULT_VIDEO_PROVIDER\s*[:=][^\n]+['\"]grok['\"]",
        'xAI endpoint isolated': r"https://api\.x\.ai/v1/video/generations|client\.video\.generate|grok-imagine-video",
        'image-to-video request supports imageUrl': r"imageUrl[^\n]+string",
        'safe secret handling': r"XAI_API_KEY|process\.env\.XAI_API_KEY",
        'kling fallback exists': r"fallbackProvider[^\n]+kling|provider:\s*['\"]kling['\"]",
        'no secret logging': r"redactVideoProviderError|sanitizeVideoProviderError|redacted",
        'cost/latency/failure metadata': r"estimatedCostUsd|latencyMs|failureReason",
    }
    for label, pattern in checks.items():
        if not re.search(pattern, text, re.S):
            missing.append(label)

generate_text = generate.read_text()
if 'VideoProvider' not in generate_text or 'grok' not in generate_text or 'kling' not in generate_text:
    missing.append('ContentBrief exposes videoProvider grok/kling')

pkg_data = json.loads(pkg.read_text())
if 'guard:grok-video' not in pkg_data.get('scripts', {}):
    missing.append('package script guard:grok-video')

if missing:
    print('GROK_VIDEO_PROVIDER_GUARD_FAIL ' + '; '.join(missing))
    sys.exit(1)
print('GROK_VIDEO_PROVIDER_GUARD_PASS')
