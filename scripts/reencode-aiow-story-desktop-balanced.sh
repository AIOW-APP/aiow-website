#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
manifest="public/aiow/homepage-story/desktop-balanced-reencode-manifest.jsonl"
: > "$manifest"
count=0
while IFS= read -r src; do
  out="${src%-scrub.mp4}-desktop-balanced.mp4"
  if [[ -s "$out" ]]; then
    echo "skip existing $out"
  else
    echo "desktop-balanced $src -> $out"
    ffmpeg -nostdin -hide_banner -loglevel error -y -i "$src" \
      -an -map 0:v:0 \
      -vf "scale=1600:-2" \
      -c:v libx264 -preset slow -crf 21 \
      -pix_fmt yuv420p -profile:v high -level 4.0 \
      -g 12 -keyint_min 12 -sc_threshold 0 \
      -movflags +faststart \
      "$out"
  fi
  src_bytes=$(stat -f%z "$src")
  out_bytes=$(stat -f%z "$out")
  duration=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$out" 2>/dev/null || echo null)
  SRC="$src" OUT="$out" SRC_BYTES="$src_bytes" OUT_BYTES="$out_bytes" DURATION="$duration" python3 - <<'PYJSON' >> "$manifest"
import json, os
src=int(os.environ['SRC_BYTES']); out=int(os.environ['OUT_BYTES'])
print(json.dumps({'src': os.environ['SRC'], 'out': os.environ['OUT'], 'srcBytes': src, 'outBytes': out, 'savingPct': round((1-out/src)*100,1), 'duration': float(os.environ['DURATION']), 'width': 1600, 'gop': '12 frames / approx 0.5s at 24fps', 'codec': 'h264', 'crf': 21, 'audio': False, 'movflags': '+faststart'}, ensure_ascii=False))
PYJSON
  count=$((count+1))
done < <(find public/aiow/homepage-story/layer-* -maxdepth 1 -type f -name "*desktop*-scrub.mp4" | sort)
echo "done $count desktop videos"
echo "$manifest"
