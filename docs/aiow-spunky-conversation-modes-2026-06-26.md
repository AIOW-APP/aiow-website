# AIOW Spunky conversation modes

Status: live since 2026-06-26.

## Runtime

Spunky runs on the Mac Mini via:

- service: `com.aiow.spunky-webhook`
- script: `/Users/handsomebastard/spunky-webhook/spunky_webhook.py`
- public route: `https://spunky.aiow.ai/chat`
- website bridge: `/api/spunky/chat`

Secrets are stored in LaunchAgent/Vercel env and must not be printed in logs.

## Phases

| Phase | When | Spunky may | Spunky must not |
|---|---|---|---|
| `anonymous` | first website contact | deliver value, build temporary Venture Memory, ask one sharp question, ask for name/e-mail only after context value | promise pricing, contract, production work or external follow-up |
| `account` | account or linked memory exists | fill missing intake, prepare Deal Card, ask for documents/context | accept collaboration or terms without AIOW review |
| `signed` | proposal or appointment signed | help execution inside signed scope, surface blockers, prepare sprint handoff | expand scope or make legal/financial/public claims |

## Modes

| Mode | Trigger | Goal |
|---|---|---|
| `greeting` | hey, hoi, hi | warm start, invite messy input |
| `lead_machine` | leads, sales, CRM, follow-up, offerte | find where value leaks |
| `workflow_scan` | process, automation, admin, support, planning | find 30-day measurable workflow improvement |
| `new_venture` | idea, app, platform, startup, venture | test audience, urgency, proof, AI moat |
| `pricing_model` | budget, pricing, revenue share, equity | route to scan, proof sprint, fixed build, growth partner or venture review |
| `team_access` | Team Richard, Mini, Book, Handsome, Spunky, Mac Mini | explain routing and ask desired outcome |
| `general_intake` | fallback | convert loose input to Venture Memory |

## Verified live smoke

Production `/api/spunky/chat` returned:

- `source: spunky-webhook`
- `storageMode: supabase`
- `conversationMode: greeting` for `hey`
- `conversationMode: lead_machine` for lead/follow-up request
- `relationshipStage: account` with `handoffPhase: account`
- `relationshipStage: signed` with `handoffPhase: signed`

## UX rules

- Enter sends.
- Shift+Enter creates a new line.
- Replies are sanitized to avoid em dash characters.
- Spunky asks for contact only after enough context value or explicit contact intent.
