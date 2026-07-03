#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = ROOT / "lib" / "aiow-projects.ts"
home = ROOT / "components" / "aiow" / "AiowNativeMotionPage.tsx"
projects_page = ROOT / "app" / "projects" / "page.tsx"
projects_json = ROOT / "app" / "projects.json" / "route.ts"
onetap_page = ROOT / "app" / "onetap-day" / "page.tsx"
robots = ROOT / "app" / "robots.ts"

texts = {
    path: path.read_text(encoding="utf-8") if path.exists() else ""
    for path in [manifest, home, projects_page, projects_json, onetap_page, robots]
}

failures = []

def require(path, marker):
    if marker not in texts[path]:
        failures.append(f"{path.relative_to(ROOT)} missing required marker: {marker}")

def forbid(path, marker):
    if marker in texts[path]:
        failures.append(f"{path.relative_to(ROOT)} contains forbidden marker: {marker}")

# AIOW.ai must stay B2B/informational. Consumer app showcase belongs on Handsome.bot.
require(manifest, 'slug: "onetap-day"')
require(manifest, 'showOnAiow: false')
require(manifest, 'Consumer app exposure belongs on Handsome.bot')
forbid(home, 'visibleAiowProjects')
forbid(home, 'id="made-by-aiow"')
forbid(home, '/onetap-day')
forbid(projects_page, 'visibleAiowProjects')
require(projects_page, 'Consumer apps, early-adopter deals en lifetime-founder opties horen op Handsome.bot')
require(projects_page, 'robots: { index: false, follow: false }')
require(projects_json, 'projects: []')
require(projects_json, 'Handsome.bot')
require(onetap_page, 'robots: { index: false, follow: false }')
require(onetap_page, 'Founding 20')
require(onetap_page, 'geen future-products lifetime')
require(robots, '"/projects"')
require(robots, '"/projects.json"')
require(robots, '"/onetap-day"')

if failures:
    raise SystemExit("AIOW_B2B_SEPARATION_GUARD_FAIL\n" + "\n".join(failures))

print("AIOW_B2B_SEPARATION_GUARD_PASS")
