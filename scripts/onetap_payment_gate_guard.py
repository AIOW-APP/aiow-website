#!/usr/bin/env python3
"""Guard the OneTap Day Stripe payment gate.

The gate has two safe states:
1. Stripe prepared/link-created but not exposed on the page.
2. Stripe public checkout exposed with the exact approved Payment Link.

It still forbids direct Stripe Checkout SDK redirects, env toggles, or accidental
wrong payment URLs.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PROJECT = Path("/Users/handsomebastard/projects/onetap-day")
PAYMENT_CARD = PROJECT / "docs" / "payment-approval-card.md"
STRIPE_GATE = PROJECT / "docs" / "stripe-payment-gate.md"
AUDIT_SCHEMA = PROJECT / "docs" / "payment-receipt-audit-schema.md"
PRODUCT_JSON = PROJECT / "product.json"
PAGE = ROOT / "app" / "onetap-day" / "page.tsx"
CLIENT = ROOT / "app" / "onetap-day" / "OneTapConciergeIntake.tsx"

APPROVED_PAYMENT_LINK = "https://buy.stripe.com/9B69AU6C7aPYfiC8zs2kw00"
FORBIDDEN_ALWAYS = [
    r"checkout\.stripe\.com",
    r"stripe\.checkout",
    r"ONETAP_PAYMENT_ACTIVATION_APPROVED\s*=\s*true",
]

REQUIRED_DOC_MARKERS = [
    "Stripe",
    "EUR 19.00",
    "one-time",
    "first 10 paying users",
    "24 hours after successful payment and complete intake",
    "hello@aiow.ai",
    "support@aiow.ai",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def read(path: Path) -> str:
    if not path.exists():
        fail(f"missing required file: {path}")
    return path.read_text(encoding="utf-8")


def main() -> None:
    card = read(PAYMENT_CARD)
    stripe_gate = read(STRIPE_GATE)
    audit = read(AUDIT_SCHEMA)
    page = read(PAGE)
    client = read(CLIENT)
    product = json.loads(read(PRODUCT_JSON))
    public_combined = "\n".join([page, client])

    for marker in REQUIRED_DOC_MARKERS:
        if marker not in card:
            fail(f"payment approval card missing marker: {marker}")

    for marker in ["Payment provider: **Stripe**", "payment_provider_active", "checkout_url_exposed"]:
        if marker not in stripe_gate:
            fail(f"stripe gate missing marker: {marker}")

    for marker in ["payment_succeeded", "checkout_session_id", "amount_total", "currency", "email_hash_sha256", "raw_intake_retention_days"]:
        if marker not in audit:
            fail(f"audit schema missing marker: {marker}")

    for pattern in FORBIDDEN_ALWAYS:
        if re.search(pattern, public_combined, flags=re.IGNORECASE):
            fail(f"forbidden public payment pattern present: {pattern}")

    finance = product.get("finance", {})
    if finance.get("provider") != "Stripe":
        fail("product.json finance.provider must be Stripe")

    payment = product.get("payment", {})
    if payment.get("provider") != "stripe":
        fail("product.json payment.provider must be stripe")

    if payment.get("activation_state") not in {
        "prepared_not_activated",
        "payment_link_created_not_public",
        "payment_link_deactivated_not_public",
        "public_checkout_exposed",
    }:
        fail("unexpected payment activation_state")

    exposed = payment.get("checkout_url_exposed") is True
    contains_link = APPROVED_PAYMENT_LINK in public_combined
    contains_buy = "buy.stripe.com" in public_combined
    target_paying_users = product.get("finance", {}).get("target_paying_users")

    if "Founding 20" in public_combined or "eerste 20 betalende users" in public_combined:
        fail("public OneTap copy says Founding/Cap 20 while canonical docs/Stripe metadata use first 10")

    if target_paying_users == 10 and "eerste 10 betalende users" not in public_combined:
        fail("public OneTap copy must show canonical first 10 paying users cap")

    if exposed:
        if payment.get("payment_link_url") != APPROVED_PAYMENT_LINK:
            fail("exposed checkout must use the approved payment link URL")
        if not contains_link:
            fail("checkout_url_exposed=true but approved payment link is not in the page/client")
        if 'data-stripe-checkout="onetap-day-live"' not in client:
            fail("public Stripe checkout must carry data-stripe-checkout marker")
    else:
        if contains_buy:
            fail("Stripe buy link present while checkout_url_exposed is false")
        for unsafe_copy in ["Stripe €19 live", "Stripe checkout is actief", "Stripe betaling actief"]:
            if unsafe_copy in public_combined:
                fail(f"unsafe live-payment copy present while checkout_url_exposed is false: {unsafe_copy}")

    print("PASS: OneTap Day Stripe payment gate safe")


if __name__ == "__main__":
    main()
