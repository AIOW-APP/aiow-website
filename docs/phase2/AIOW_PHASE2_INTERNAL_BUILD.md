# AIOW Phase 2 Internal Build

Status: internal build/prep only. No live automation, accounts, payments, forms, webhooks or analytics are activated.

## Goal
Create a safe internal path from WhatsApp intake to account/quote/planning preparation while keeping all customer-facing actions manual-approved.

## Phase 2 modules
1. Lead intake registry — manual/admin-created from WhatsApp context.
2. Account draft — internal company/client workspace.
3. Quote builder — draft scope/price/planning with legal review flag.
4. Planning proposal — proposed work windows, not calendar automation.
5. Audit log — every internal action recorded.

## Go-live blockers
- Richard approval for provider/database/auth.
- Privacy/terms wording.
- WhatsApp provider decision.
- Customer auth/role model.
- Legal wording for quote acceptance.

## Current policy
- `/api/contact` and `/api/scan/request` remain disabled.
- WhatsApp CTA remains primary.
- `/api/quotes/demo/accept` remains disabled.
