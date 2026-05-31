# Book Red-Team Gate

Status: ACTIVE
Date: 2026-05-17 18:43 CEST
Owner: Handsome / Hermes / Mac Studio
QA Worker: Book / MacBook / OpenClaw + Opus lane when available
Task: td-20260517-184147-52fabb

## Purpose

Book is the independent QA gate for product acceptance. Book must actively look for failures, not confirm Commander optimism.

## Core rule

Book QA is evidence-first and adversarial. Book must inspect the evidence drop, screenshots, logs, hashes, and task contract before recommending PASS/PARTIAL/FAIL.

## Required Book QA report format

```text
🧪 BOOK QA REPORT
Task ID:
State: PASS/PARTIAL/FAIL
Percent:
Evidence reviewed:
Visual:
Functional:
Platform:
Security:
Performance:
Top blockers:
Next owner:
Richard needed:
```

## Book must actively search for

- oude art
- fake light mode
- clipping
- broken desktop
- mobile stretch
- card-in-card
- placeholder UI
- fake data
- identical before/after
- missing logs
- bad motion
- stale assets

## Specific red-team checks

### Evidence integrity

- Does `MANIFEST.md` exist?
- Is the task file included?
- Is `WHAT-CHANGED-SINCE-PREVIOUS-QA.md` included?
- Are logs present for claimed checks?
- Are hashes/checksums present?
- Do before/after screenshots differ by hash?
- Do dark/light screenshots differ by hash?
- Are screenshot files actually viewable?

### Visual/product

- Does light mode look genuinely lighter?
- Are rejected/old assets visible anywhere?
- Are there debug labels, placeholder strings, lorem ipsum, fake UI badges, or stale route labels?
- Is desktop a real desktop layout rather than stretched mobile?
- Does mobile avoid stretch/clipping/bottom-nav overlap?
- Are cards nested inside cards without purpose?
- Is motion meaningful and not janky or distracting?
- Are hero, app shell, modal, navigation, empty/error/loading states coherent?

### Functional

- Do visible controls work or honestly state they are not live?
- Does the main user loop mutate state correctly?
- Does persistence/reload work when claimed?
- Do routes resolve?
- Do build/runtime logs support the claim?

### Platform

- Browser/device/viewport stated?
- Desktop and mobile considered if product requires both?
- Console/runtime errors checked if browser evidence exists?
- PWA/service worker/manifest checked if claimed?

### Security/privacy

- No production secrets in screenshots/logs/final message?
- No exposed service-role/API keys?
- No public posting/deploy unless approved?
- No sensitive personal data leaked in evidence bundle?

### Performance

- Build/perf output included where relevant?
- No obviously massive uncompressed media in production paths unless justified?
- Motion/media loads acceptably for the target context?

## State guidance

- **PASS:** evidence complete, no blockers, Book reviewed actual evidence, product acceptance is reasonable.
- **PARTIAL:** meaningful progress but one or more non-fatal issues or missing scope elements.
- **FAIL:** blocker defects, missing evidence, fake light mode, old art render, identical before/after where change claimed, missing logs/checksums, or product claim unsupported.

## Percent guidance

Percent should reflect acceptance confidence, not effort spent:

- 90-100: near/full acceptance
- 70-89: usable but non-trivial issues
- 50-69: partial, important gaps
- 25-49: major blockers
- 0-24: unusable/wrong/no evidence

## Output path

Book reports should go to one of:

```text
ops/qa/<task-id>-book-qa.md
ops/inbox/book/<task-id>-book-qa.md
```

Commander processes Book's report and then updates final status.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
