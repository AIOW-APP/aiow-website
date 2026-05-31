# Anti-Generic SaaS Gate

Status: ACTIVE
Date: 2026-05-17 18:49 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-184821-597ea7

## Purpose

Reject old, boring, generic, template-driven websites/apps before they reach Richard as “done”.

This gate applies to every new website, webapp, PWA, native app, desktop app, game/3D interface, product dashboard, landing page, AI workflow UI, and visual product experience.

## Gate result

```text
ANTI-GENERIC-SAAS GATE
Task ID:
Project:
State: PASS/PARTIAL/FAIL
Percent:
Platform reviewed:
Evidence reviewed:
Art direction:
Mobile/desktop:
Motion:
Assets:
AI/product honesty:
Performance/accessibility:
Top blockers:
Next owner:
Richard needed:
```

## Automatic FAIL conditions

Fail the work if any of these are true:

- generic SaaS cards are the main design idea
- old template look
- fake light mode
- random gradients without art direction
- cheap AI art
- inconsistent icons
- no motion thinking
- no mobile-first design
- no evidence
- stretched mobile on desktop
- desktop layout is just enlarged phone UI
- card-in-card clutter without purpose
- placeholder UI pretending to be real functionality
- fake data presented as real
- stale/rejected assets render
- before/after screenshots are identical when change is claimed
- dark/light screenshots are byte-identical
- AI saves or alters user-impacting data without review
- trading/live automation can place live orders without Richard approval

## Required PASS evidence

A PASS requires evidence paths, not opinion:

- platform/stack decision file
- screenshots for relevant viewports
- logs for tests/build/browser checks
- asset manifest if assets changed
- motion plan or reduced-motion rationale when motion exists
- accessibility/performance notes appropriate to scope
- MD5/SHA report for visual before/after or dark/light comparisons
- Book QA if product acceptance is being claimed

## Review checklist

### Product shape

- Does the product have a clear job-to-be-done?
- Is the first screen/interaction immediately understandable?
- Is the primary user loop visible and usable?
- Are secondary dashboards hidden until useful?
- Is the product honest about prototype vs live functionality?

### Art direction

- Is there a clear visual concept beyond “cards on gradient”? 
- Are typography, spacing, color, iconography, imagery, and motion aligned?
- Are assets approved and traceable?
- Is old/rejected art excluded?
- Does the visual language support the product's category wedge?

### Desktop/mobile

- Are desktop and mobile designed separately?
- Does desktop use space intentionally?
- Does mobile avoid clipping, stretch, nav overlap, and cramped text?
- Are touch targets and safe areas respected?
- Are responsive breakpoints tested with screenshots?

### Motion

- Is there a motion plan?
- Does motion explain state, hierarchy, transition, or product meaning?
- Is reduced-motion fallback present for non-trivial motion?
- Is performance acceptable?
- Is 3D/cinematic work justified and not half-baked?

### AI/product honesty

- Are AI outputs structured where needed?
- Are user-impacting changes review-before-save?
- Is fake AI magic avoided?
- Are uncertainty/caveats visible where needed?
- Are provider adapters or boundaries planned for maintainability?

### Backend/security

- Are secrets excluded from client/logs/evidence?
- Are inputs validated?
- Is authorization/RLS planned for real user data?
- Is production/live behavior gated by explicit approval where needed?

### Evidence

- Does `MANIFEST.md` exist for evidence drop?
- Are screenshots and logs included?
- Are checksums included?
- Does before/after differ visibly and by hash?
- Does dark/light differ visibly and by hash?

## PASS/PARTIAL/FAIL guidance

- **PASS:** modern, intentional, evidence-backed, platform-appropriate, and not generic.
- **PARTIAL:** useful progress but still missing evidence, motion, mobile/desktop distinction, or product honesty.
- **FAIL:** generic/stale/unsupported/fake, or no evidence.

## Relationship to Book

This gate can be run by Commander as a pre-Book filter. It is not Book PASS. For product acceptance, Book still reviews evidence using `ops/qa/BOOK-RED-TEAM-GATE.md`.

## Final rule

If the reviewer cannot explain the product's art direction, primary loop, platform choice, evidence path, and why it is not generic SaaS, the gate fails.


## Related gate

Before product-facing website/app release, also apply `ops/qa/ANTI-GARE-WEBSITE-GATE.md` and require an Experience Plan plus responsive evidence.
