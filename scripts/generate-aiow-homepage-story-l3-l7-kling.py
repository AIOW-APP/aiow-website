#!/usr/bin/env python3
import concurrent.futures
import json
import pathlib
import sys
import time
import traceback
import requests

sys.path.insert(0, "/Users/handsomebastard/debbie")
from agents.kling_client import image2video

ROOT = pathlib.Path("/Users/handsomebastard/projects/aiow-website")
OUTROOT = ROOT / "public/aiow/homepage-story"
MANIFEST = OUTROOT / "generation-manifest-l3-l7.jsonl"
LOGDIR = OUTROOT / "logs"
LOGDIR.mkdir(parents=True, exist_ok=True)

MODEL = "kling-v2-1-master"
DURATION = 5
MODE = "pro"
CFG = 0.35
MAX_WORKERS = 3

NEGATIVE = (
    "space, galaxy, stars, spaceship, robot mascot, cyberpunk neon, sci-fi city, hologram overload, "
    "crypto coin, token platform, casino, chaotic camera, fast cuts, whip pan, jitter, shaky camera, "
    "morphing architecture, warped UI, readable text, subtitles, captions, logos, watermark, low quality, blur, "
    "distorted hands, extra fingers, uncanny faces, aggressive glow, neon purple, fantasy interface"
)

layers = {
    "03": {
        "id": "boundary",
        "desktop": ROOT / "public/aiow/story-v415/desktop/03-private-boundary.png",
        "mobile": ROOT / "public/aiow/story-v415/mobile/03-private-boundary.png",
        "brief": "A premium split business visual: external cloud route versus internal secure route. A calm policy gate decides what may leave the company and what stays local. Subtle data-flow motion, restrained architectural glow, secure boundary line, no sci-fi."
    },
    "04": {
        "id": "worklayer",
        "desktop": ROOT / "public/aiow/story-v415/desktop/05-model-router.png",
        "mobile": ROOT / "public/aiow/story-v415/mobile/05-model-router.png",
        "brief": "Loose business process blocks gently align into one clean AIOW operating layer between people, tools, documents, models and approvals. Premium calm motion, precise routing lines, business dashboard feeling without readable text."
    },
    "05": {
        "id": "hardware",
        "desktop": ROOT / "public/aiow/story-v415/desktop/04-local-hardware-dock.png",
        "mobile": ROOT / "public/aiow/story-v415/mobile/04-local-hardware-dock.png",
        "brief": "Premium product-film motion of local hardware and approved cloud routes: Mac Studio/Mac mini/MacBook, Nvidia compute, local model node. Soft reflections, quiet status lights, secure routing, no sci-fi, no neon."
    },
    "06": {
        "id": "agents",
        "desktop": ROOT / "public/aiow/story-v415/desktop/06-business-agents.png",
        "mobile": ROOT / "public/aiow/story-v415/mobile/06-business-agents.png",
        "brief": "A business request becomes a summary, task, draft, approval, CRM update and team handoff. Show a restrained chain reaction across business work surfaces. Human approval moment is calm and premium, no readable text."
    },
    "07": {
        "id": "outcome",
        "desktop": ROOT / "public/aiow/story-v415/desktop/12-final-installation.png",
        "mobile": ROOT / "public/aiow/story-v415/mobile/12-final-installation.png",
        "brief": "The same business after AIOW: focused team, clear dashboard surfaces, completed approvals, safe AI operating layer quietly running in the background. Calm, premium, trustworthy, clean business transformation outcome."
    },
}

def theme_prompt(theme: str) -> str:
    if theme == "light":
        return "Light theme variant: warm daylight, cream white and soft graphite UI surfaces, calm premium office atmosphere, subtle champagne highlights."
    return "Dark theme variant: deep graphite, warm charcoal, soft cream-gold highlights, premium low-light business environment, restrained contrast."

def prompt_for(layer, device, theme):
    camera = "wide 16:9 cinematic locked camera, shallow parallax and slow premium push-in" if device == "desktop" else "vertical 9:16 mobile-first locked composition, gentle depth motion and calm vertical parallax"
    return f"""
Use the provided source image as the exact visual design and composition reference. Create a refined 5-second premium image-to-video motion asset for the AIOW business homepage pinned scroll story.

Layer {layer}: {layers[layer]['brief']}
{theme_prompt(theme)}
Motion language: {camera}. Animate only subtle business-grade elements: soft light travel, slight interface depth, controlled data-routing lines, gentle environmental movement. Preserve the original layout, objects, perspective and brand mood. No new text, no gimmicks, no flashy AI tropes. The result should feel like an Oryzo/Lusion-level premium business website hero film: calm, expensive, credible, operational.
""".strip()

def task_list():
    tasks=[]
    for layer in ["03","04","05","06","07"]:
        for device in ["desktop","mobile"]:
            for theme in ["light","dark"]:
                src = layers[layer][device]
                aspect = "16:9" if device == "desktop" else "9:16"
                outdir = OUTROOT / f"layer-{layer}"
                outdir.mkdir(parents=True, exist_ok=True)
                out = outdir / f"layer-{layer}_{device}-{theme}_video_{MODEL}.mp4"
                tasks.append({"layer":layer,"device":device,"theme":theme,"src":str(src),"aspect":aspect,"out":str(out),"prompt":prompt_for(layer,device,theme)})
    return tasks

def run_one(t):
    out = pathlib.Path(t["out"])
    log = LOGDIR / (out.stem + ".log")
    if out.exists() and out.stat().st_size > 100_000:
        return {**t, "status":"skipped", "bytes":out.stat().st_size}
    try:
        if not pathlib.Path(t["src"]).exists():
            raise FileNotFoundError(t["src"])
        start=time.time()
        url = image2video(
            t["src"],
            t["prompt"],
            model=MODEL,
            duration=DURATION,
            aspect_ratio=t["aspect"],
            mode=MODE,
            negative_prompt=NEGATIVE,
            cfg_scale=CFG,
            poll_interval=15,
            timeout=1500,
        )
        r = requests.get(url, timeout=300)
        r.raise_for_status()
        tmp = out.with_suffix(".tmp.mp4")
        tmp.write_bytes(r.content)
        tmp.replace(out)
        rec = {**t, "status":"ok", "url":url, "bytes":out.stat().st_size, "seconds":round(time.time()-start,1), "model":MODEL, "mode":MODE}
        log.write_text(json.dumps(rec, ensure_ascii=False, indent=2))
        with MANIFEST.open("a") as f:
            f.write(json.dumps(rec, ensure_ascii=False)+"\n")
        return rec
    except Exception as e:
        rec = {**t, "status":"error", "error":repr(e), "traceback":traceback.format_exc()}
        log.write_text(json.dumps(rec, ensure_ascii=False, indent=2))
        with MANIFEST.open("a") as f:
            f.write(json.dumps(rec, ensure_ascii=False)+"\n")
        return rec

if __name__ == "__main__":
    tasks = task_list()
    print(f"Generating {len(tasks)} videos with {MAX_WORKERS} workers, model={MODEL}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs = [ex.submit(run_one,t) for t in tasks]
        for i,f in enumerate(concurrent.futures.as_completed(futs),1):
            rec=f.result()
            print(f"[{i}/{len(tasks)}] {rec[status]} layer-{rec[layer]} {rec[device]}-{rec[theme]} -> {rec.get(bytes,)} {rec.get(error,)}", flush=True)
    print("Done", flush=True)
