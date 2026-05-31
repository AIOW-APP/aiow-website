#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
files = {
    "intake_api": ROOT / "app/api/onetap/intake/route.ts",
    "interest_api": ROOT / "app/api/onetap/founding-interest/route.ts",
    "intake_ui": ROOT / "app/onetap-day/OneTapConciergeIntake.tsx",
    "product_page": ROOT / "app/handsome/apps/onetap-day/page.tsx",
}
issues: list[str] = []
for name, path in files.items():
    if not path.exists():
        issues.append(f"missing:{name}:{path}")

if not issues:
    intake_api = files["intake_api"].read_text()
    interest_api = files["interest_api"].read_text()
    ui = files["intake_ui"].read_text()
    page = files["product_page"].read_text()

    must_have = {
        "intake durable local fallback": "captureOneTapSubmission" in intake_api,
        "interest durable local fallback": "captureOneTapSubmission" in interest_api,
        "intake succeeds without resend": "deliveryState: \"LOCAL_CAPTURED" in intake_api,
        "interest succeeds without resend": "deliveryState: \"LOCAL_CAPTURED" in interest_api,
        "user-facing useful next step": "Wat gebeurt hierna" in ui,
        "no payment dead-end headline": "De SLA klok start pas na gecontroleerde intake + betaling" not in ui,
        "no stripe checkout attrs on user surface": "data-stripe-checkout" not in ui,
        "clear review request CTA": "Vraag OneTap-review aan" in ui,
        "product says request not just proof": "Vraag een OneTap-review" in page,
    }
    for label, ok in must_have.items():
        if not ok:
            issues.append(label)

    forbidden = [
        ("api hard 500 when resend missing", "Intake service not configured" in intake_api or "Interest service not configured" in interest_api),
        ("visible euro price", "€19" in ui or "€19" in page),
        ("visible AIOW AI-tools", "AIOW AI-tools" in ui or "AIOW data boundary" in ui),
        ("visible internal funnel metrics", any(term in ui or term in page for term in ["interest_intent_rate", "paid_rate", "Soft gate", "Hard gate", "N≥30", "14–21", "provider-off", "active=false", "monetization"])),
        ("overpromised automatic plan", "Krijg een bruikbaar plan terug" in ui or "één uitvoerbaar plan" in page),
    ]
    for label, bad in forbidden:
        if bad:
            issues.append(label)

if issues:
    print("ONETAP_READY_FOR_USE_GUARD=FAIL")
    for issue in issues:
        print(f"- {issue}")
    sys.exit(1)

print("ONETAP_READY_FOR_USE_GUARD=PASS")
