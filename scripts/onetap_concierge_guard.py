#!/usr/bin/env python3
"""Guard the OneTap Day concierge landing/intake boundary.

This is intentionally static: it protects the early revenue-test page from
shipping without consent/SLA/payment-boundary copy or accidentally activating a
payment provider before Richard approval.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "app" / "onetap-day" / "page.tsx"
CLIENT = ROOT / "app" / "onetap-day" / "OneTapConciergeIntake.tsx"
CSS = ROOT / "app" / "onetap-day" / "onetap-day.module.css"
API = ROOT / "app" / "api" / "onetap" / "intake" / "route.ts"
INTEREST_API = ROOT / "app" / "api" / "onetap" / "founding-interest" / "route.ts"
PRIVACY_NL = ROOT / "app" / "nl" / "privacy" / "page.tsx"
PRIVACY_EN = ROOT / "app" / "en" / "privacy" / "page.tsx"

REQUIRED_FILES = [PAGE, CLIENT, CSS, API, INTEREST_API, PRIVACY_NL, PRIVACY_EN]
REQUIRED_CLIENT_MARKERS = [
    "\"use client\"",
    "const REQUIRED_FIELDS",
    "email",
    "rawTasks",
    "fixedAppointments",
    "workWindow",
    "priorityContext",
    "planningBaselineMinutes",
    "consentAccepted",
    "setHydrated(true)",
    "if (!hydrated)",
    "localStorage.setItem",
    "localStorage.getItem",
    "Raw intake max 30 dagen",
    "Geen calendar OAuth",
    "Geen voice upload",
    "Geen wachtwoorden, medische details",
    "24 uur na betaling + complete intake",
    "€19",
    "eerste 10 betalende users",
    "A-Z gates groen",
    "Book co-sign op strategie/prijs/taste/positionering",
    "Betaling tijdelijk gepauzeerd",
    "data-controlled-intake=\"server-capture\"",
    "/api/onetap/intake",
    "AI-tools mag gebruiken",
    "data-stripe-checkout=\"onetap-day-paused\"",
    "Betaal €19 Founding 10 via Stripe",
    "support@aiow.ai",
    "hello@aiow.ai",
    "Founding Premium Interest Test",
    "interest_intent_rate",
    "provider-off",
    "data-onetap-metric=\"offer_view\"",
    "data-onetap-metric=\"interest_submit\"",
    "day-2",
    "day-7",
    "day-30",
    "/api/onetap/founding-interest",
    "Geen live checkout",
]
REQUIRED_PAGE_MARKERS = [
    "OneTap Day Concierge",
    "metadata",
    "OneTapConciergeIntake",
    "24 uur",
    "complete intake",
]
FORBIDDEN_PAYMENT_PATTERNS = [
    r"stripe\.checkout",
    r"checkout\.stripe\.com",
    r"PAYMENT_PROVIDER_ACTIVE\s*=\s*true",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> None:
    missing = [str(path.relative_to(ROOT)) for path in REQUIRED_FILES if not path.exists()]
    if missing:
        fail("missing required files: " + ", ".join(missing))

    page = PAGE.read_text(encoding="utf-8")
    client = CLIENT.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    api = API.read_text(encoding="utf-8")
    privacy_nl = PRIVACY_NL.read_text(encoding="utf-8")
    privacy_en = PRIVACY_EN.read_text(encoding="utf-8")
    combined = "\n".join([page, client, css, api, privacy_nl, privacy_en])

    for marker in REQUIRED_PAGE_MARKERS:
        if marker not in page:
            fail(f"page missing marker: {marker}")

    for marker in REQUIRED_CLIENT_MARKERS:
        if marker not in client:
            fail(f"client missing marker: {marker}")

    if client.count("required") < 7:
        fail("expected at least seven required form controls")

    if not re.search(r"disabled=\{!canSubmit\}", client):
        fail("submit button must be disabled until complete intake + consent")

    if not re.search(r"const canSubmit\s*=\s*", client):
        fail("client must compute canSubmit")

    if not re.search(r"data-payment-boundary=\"yellow-gate\"", client):
        fail("visible payment approval boundary missing")
    for marker in ["RESEND_API_KEY", "hello@aiow.ai", "PAUSED_PROVIDER_OFF", "aiTransitAccepted", "raw intake retention max 30 days", "INTAKE_RATE_LIMIT", "rateLimitKey", "Retry-After"]:
        if marker not in api:
            fail(f"controlled intake api missing marker: {marker}")
    interest_api = INTEREST_API.read_text(encoding="utf-8")
    for marker in [
        "INTEREST_RATE_LIMIT",
        "foundingInterestId",
        "interest_intent_rate",
        "PROVIDER_OFF_INTEREST_ONLY",
        "RESEND_API_KEY",
        "support@aiow.ai",
        "hello@aiow.ai",
        "day2Value",
        "day7Value",
        "day30Value",
        "no live checkout",
    ]:
        if marker not in interest_api:
            fail(f"founding interest api missing marker: {marker}")
    for marker in ["OneTap Day", "maximaal 30 dagen", "AI-tools", "Resend", "resend.com/legal/dpa", "resend.com/legal/subprocessors"]:
        if marker not in privacy_nl:
            fail(f"Dutch privacy page missing marker: {marker}")
    for marker in ["OneTap Day", "maximum of 30 days", "AI tools", "Resend", "resend.com/legal/dpa", "resend.com/legal/subprocessors"]:
        if marker not in privacy_en:
            fail(f"English privacy page missing marker: {marker}")

    for pattern in FORBIDDEN_PAYMENT_PATTERNS:
        if re.search(pattern, combined, flags=re.IGNORECASE):
            fail(f"forbidden payment activation pattern present: {pattern}")

    print("PASS: OneTap Day concierge landing/intake guard")


if __name__ == "__main__":
    main()
