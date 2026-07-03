# AIOW private intake rule — 2026-06-24

## Decision

AIOW.ai customer/venture intake must be privacy-first.

Public pages may only collect a minimal pre-aanvraag:

- company/project name;
- contact name/email/phone;
- website/LinkedIn;
- industry;
- non-sensitive short description;
- broad interest/deal type.

Public pages must not ask for:

- revenue;
- margins/profit;
- customer lists;
- warm contacts;
- confidential IP;
- detailed documents/data;
- supplier/partner details;
- detailed deal terms;
- sensitive operational bottlenecks.

Those belong inside a private customer portal after account-ID + access code.

## Implemented

- `/nl/aanmelden` is now a public privacy-first pre-aanvraag only.
- The old detailed venture fields were removed from the public form.
- `/portal/account/new` copy now frames the flow as a private customer account.
- `/portal/customer/[accountId]` now shows a `Private venture intake` form only after the access code unlocks the portal.

## Product principle

Public AIOW.ai = positioning + low-risk lead capture.
Private customer portal = due diligence, venture analysis, deal cards, financials, contacts, docs, proof and roadmap.

## Next hardening

The preview currently uses account-ID + access code. Production should upgrade to:

- real auth provider or signed magic links;
- encrypted storage for sensitive fields;
- role-based admin/customer access;
- append-only audit log;
- explicit privacy/data processing copy;
- document upload permissions;
- legal templates for revenue/profit/equity terms.
