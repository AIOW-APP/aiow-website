#!/usr/bin/env python3
"""Grow AIOW B2B knowledge pages from controlled templates."""
from __future__ import annotations

import argparse, json, re, subprocess
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "lib/aiow-knowledge-pages.ts"
REPORT_DIR = ROOT / "evidence/aiow-knowledge-growth"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

SERVICES = [
    ("ai-implementatie", "AI-implementatie", "veilige AI-implementatie van intake tot pilot en beheer"),
    ("ai-agents", "AI-agents", "AI-agents met rollen, logs, toolrechten en menselijke approvals"),
    ("ai-automatisering", "AI-automatisering", "procesautomatisering met AI rond inbox, documenten, planning en beslissingen"),
    ("private-ai", "Private AI", "private, lokale of hybride AI waar data/risico dat vraagt"),
    ("ai-systeemscan", "AI-systeemscan", "een concrete scan van processen, data, risico en eerste AI-wedge"),
    ("ai-workflows", "AI-workflows", "werkende AI-workflows in plaats van losse prompts"),
    ("ai-kennisbank", "AI-kennisbank", "interne kennis ophalen, structureren en veilig gebruiken"),
    ("ai-klantcontact", "AI-klantcontact", "klantvragen triëren, conceptantwoorden maken en escaleren"),
    ("ai-offertes", "AI voor offertes", "offertes sneller voorbereiden met behoud van menselijke controle"),
    ("ai-documenten", "AI-documentautomatisering", "documenten samenvatten, controleren, routeren en hergebruiken"),
    ("ai-governance", "AI governance", "beleid, logging, modelkeuze, rechten en approval gates"),
    ("lokale-llm", "Lokale LLM", "lokale modellen en RAG inzetten waar soevereiniteit waarde levert"),
]
SECTORS = [("mkb","MKB"),("logistiek","logistiek en transport"),("bouw","bouw en installatie"),("zorg","zorg en welzijn"),("finance","finance en administratie"),("legal","legal en zakelijke dienstverlening"),("ecommerce","e-commerce en retail"),("marketing","marketingbureaus"),("hr","HR en recruitment"),("vastgoed","vastgoed"),("productie","maakindustrie"),("onderwijs","onderwijs en kennisorganisaties")]
REGIONS = [("nederland","Nederland"),("amsterdam","Amsterdam"),("rotterdam","Rotterdam"),("utrecht","Utrecht"),("den-haag","Den Haag"),("eindhoven","Eindhoven/Brainport"),("schiphol-haarlemmermeer","Schiphol/Haarlemmermeer"),("haarlem","Haarlem"),("leiden","Leiden"),("breda","Breda"),("groningen","Groningen"),("arnhem","Arnhem"),("zwolle","Zwolle"),("tilburg","Tilburg"),("amersfoort","Amersfoort"),("almere","Almere")]
INTENTS = [("voor-bedrijven","voor bedrijven"),("implementatieplan","implementatieplan"),("kosten-en-aanpak","kosten en aanpak"),("veilig-inzetten","veilig inzetten"),("pilot-in-30-dagen","pilot in 30 dagen"),("workflow-voorbeelden","workflowvoorbeelden"),("privacy-en-data","privacy en data"),("tooling-en-integraties","tooling en integraties")]
BAD_PATTERNS = [r"gegarandeerd #?1", r"nummer 1", r"vanaf €", r"klantcase:", r"twitter\.com", r"x\.com", r"revolutionair", r"game-changing"]


def slugify(text: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text.lower().replace("&", " en "))).strip("-")


def make_page(service, sector, region, intent):
    service_slug, service_name, service_desc = service
    sector_slug, sector_name = sector
    region_slug, region_name = region
    intent_slug, intent_name = intent
    slug = slugify(f"{service_slug}-{sector_slug}-{region_slug}-{intent_slug}")
    title = f"{service_name} voor {sector_name} in {region_name}: {intent_name}"
    summary = f"Praktische B2B uitleg voor Nederlandse bedrijven die {service_desc} willen inzetten in {sector_name}, met focus op {region_name}, governance en meetbare proceswinst."
    return {
        "slug": slug,
        "kind": "knowledge",
        "serviceSlug": service_slug,
        "service": service_name,
        "sectorSlug": sector_slug,
        "sector": sector_name,
        "regionSlug": region_slug,
        "region": region_name,
        "intent": intent_name,
        "title": title,
        "h1": title,
        "summary": summary,
        "sections": [
            ["Wanneer is dit relevant?", f"Dit is relevant wanneer een team in {sector_name} repetitief kenniswerk, klantvragen, documenten, planning of besluitvoorbereiding wil verbeteren zonder losse AI-chaos. AIOW kijkt eerst naar proces, data, risico en menselijke goedkeuring."],
            ["Wat levert AIOW concreet?", f"AIOW bouwt een werkende AI-werklaag: intake, modelrouting, prompts/agents, rechten, logs, evaluaties en overdracht naar het team. Voor {region_name} betekent dat: praktisch starten met bestaande systemen en alleen automatiseren waar waarde bewezen is."],
            ["Veiligheid en governance", "AIOW werkt met dataclassificatie, menselijke approvals, logging, rollback en waar nodig lokale/private AI. Cloudmodellen worden alleen gebruikt wanneer dat past bij data, risico, kwaliteit en kosten."],
            ["Eerste stap", "Start met een AI-systeemscan: processen kiezen, datagrens bepalen, quick wins rangschikken, eerste pilot definiëren en KPI’s vastleggen. Geen hype; eerst bewijs."],
        ],
        "faq": [
            [f"Is {service_name} geschikt voor {sector_name}?", "Ja, als er concrete processen zijn met herhaalbaar kenniswerk, documenten, klantvragen of planning. AIOW valideert dit eerst met een systeemscan."],
            ["Moet alles lokaal draaien?", "Nee. De beste route wint: lokaal/private AI waar dat waarde of privacyvoordeel geeft; cloud waar dat veiliger, sneller of beter is."],
            ["Wat is de eerste deliverable?", "Een korte proces- en datamap, prioriteitenlijst, pilotvoorstel, governance-afspraken en meetbare KPI’s."],
        ],
    }


def all_candidates():
    for service in SERVICES:
        for sector in SECTORS:
            for region in REGIONS:
                for intent in INTENTS:
                    yield make_page(service, sector, region, intent)


def existing_count() -> int:
    if not OUT.exists():
        return 0
    return len(re.findall(r'"slug":\s*"[^"]+"', OUT.read_text(encoding="utf-8")))


def write_pages(pages):
    parts = [
        "export type AiowKnowledgePage = {\n  slug: string;\n  kind: string;\n  serviceSlug: string;\n  service: string;\n  sectorSlug: string;\n  sector: string;\n  regionSlug: string;\n  region: string;\n  intent: string;\n  title: string;\n  h1: string;\n  summary: string;\n  sections: Array<[string, string]>;\n  faq: Array<[string, string]>;\n};\n\n",
        "export const aiowKnowledgePages = ", json.dumps(pages, ensure_ascii=False, indent=2), " satisfies AiowKnowledgePage[];\n\n",
        "export function getAiowKnowledgePage(slug: string) {\n  return aiowKnowledgePages.find((page) => page.slug === slug);\n}\n\n",
        "export const aiowKnowledgeCategories = {\n  services: ", json.dumps([{"slug": a, "name": b, "desc": c} for a, b, c in SERVICES], ensure_ascii=False, indent=2), ",\n  sectors: ", json.dumps([{"slug": a, "name": b} for a, b in SECTORS], ensure_ascii=False, indent=2), ",\n  regions: ", json.dumps([{"slug": a, "name": b} for a, b in REGIONS], ensure_ascii=False, indent=2), "\n};\n",
    ]
    OUT.write_text("".join(parts), encoding="utf-8")


def scan_failures():
    text = OUT.read_text(encoding="utf-8")
    return [pattern for pattern in BAD_PATTERNS if re.search(pattern, text, re.I)]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-pages", type=int)
    parser.add_argument("--daily", type=int, default=0)
    parser.add_argument("--build", action="store_true")
    args = parser.parse_args()

    before = existing_count()
    target = args.target_pages or before + max(args.daily, 0)
    pages = list(all_candidates())[:target]
    write_pages(pages)
    failures = scan_failures()
    build_ok = True
    build_tail = ""
    if args.build:
        proc = subprocess.run(["npm", "run", "build"], cwd=ROOT, text=True, capture_output=True, timeout=600)
        build_ok = proc.returncode == 0
        build_tail = (proc.stdout + proc.stderr)[-4000:]

    ok = not failures and build_ok
    report = {
        "generated_at": datetime.now().isoformat(),
        "before_pages": before,
        "after_pages": len(pages),
        "added_count": max(0, len(pages) - before),
        "scan_failures": failures,
        "build_ok": build_ok,
        "build_tail": build_tail,
    }
    report_path = REPORT_DIR / f"growth-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REPORT_DIR / "latest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"AIOW knowledge growth: {before} -> {len(pages)} pages; added={report['added_count']}; status={'PASS' if ok else 'REVIEW'}")
    print(report_path)
    return 0 if ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
