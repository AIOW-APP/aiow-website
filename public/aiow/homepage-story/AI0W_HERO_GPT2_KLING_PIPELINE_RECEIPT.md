# AIOW Hero — GPT Image 2 → Kling Pipeline Receipt

Status: generation running
Date: 2026-05-06

## Required standard
The AIOW flagship hero must be produced through the premium controlled pipeline:

1. GPT Image 2 keyframe/poster
2. Kling v2.1 Master image-to-video
3. Add premium ambient/UI audio bed
4. Persist source poster, raw Kling video, final audio video, manifest, and script in repo

## Persistent files

Keyframes:
- `/public/aiow/homepage-story/aiow-hero-gpt-image-2-keyframe-desktop.jpg`
- `/public/aiow/homepage-story/aiow-hero-gpt-image-2-keyframe-mobile.jpg`

Generation script:
- `/scripts/generate-aiow-hero-gpt2-kling.py`

Expected raw Kling outputs:
- `/public/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-10s.mp4`
- `/public/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-10s.mp4`

Expected final audio outputs:
- `/public/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-12s-with-sound.mp4`
- `/public/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-12s-with-sound.mp4`

Manifest:
- `/public/aiow/homepage-story/aiow-hero-gpt2-kling-manifest.json`

Runtime log:
- Big Mac `/tmp/aiow-hero-gpt2-kling.log`

## Notes
The previous Sora/fallback hero is not the final-quality target. The final target is this GPT Image 2 → Kling route.
