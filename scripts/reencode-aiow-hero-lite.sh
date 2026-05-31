#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
manifest="public/aiow/homepage-story/hero-lite-reencode-manifest.jsonl"
: > "$manifest"
encode() {
  local src="$1" out="$2" scale="$3" crf="$4"
  if [[ -s "$out" ]]; then
    echo "skip existing $out"
  else
    echo "hero-lite $src -> $out"
    ffmpeg -nostdin -hide_banner -loglevel error -y -i "$src" \
      -an -map 0:v:0 \
      -vf "$scale" \
      -c:v libx264 -preset slow -crf "$crf" \
      -pix_fmt yuv420p -profile:v high -level 4.0 \
      -g 48 -keyint_min 48 -sc_threshold 0 \
      -movflags +faststart \
      "$out"
  fi
  src_bytes=$(stat -f%z "$src")
  out_bytes=$(stat -f%z "$out")
  duration=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$out" 2>/dev/null || echo null)
  SRC="$src" OUT="$out" SRC_BYTES="$src_bytes" OUT_BYTES="$out_bytes" DURATION="$duration" CRF="$crf" SCALE="$scale" python3 - <<'PYJSON' >> "$manifest"
import json, os
src=int(os.environ['SRC_BYTES']); out=int(os.environ['OUT_BYTES'])
print(json.dumps({'src': os.environ['SRC'], 'out': os.environ['OUT'], 'srcBytes': src, 'outBytes': out, 'savingPct': round((1-out/src)*100,1), 'duration': float(os.environ['DURATION']), 'scale': os.environ['SCALE'], 'codec': 'h264', 'crf': int(os.environ['CRF']), 'audio': False, 'movflags': '+faststart'}, ensure_ascii=False))
PYJSON
}
encode "public/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-12s-with-sound.mp4" "public/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-12s-lite.mp4" "scale=1600:-2" 23
encode "public/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-12s-with-sound.mp4" "public/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-12s-lite.mp4" "scale=-2:1280" 24
echo "$manifest"
