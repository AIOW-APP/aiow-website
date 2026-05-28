# Anti-Gare Website Gate

Status: ACTIVE
Date: 2026-05-17 19:11 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-191026-eb6165

## Purpose

No website/app may be released until Commander proves it is not a generic, boring, stale template.

This gate applies to:

- marketing websites
- landing pages
- webapps
- SaaS dashboards
- PWAs
- native-app-like web experiences
- AI tools with UI
- internal tools shown to humans
- any product surface Richard or users will judge visually

## Hard rule

Before release, every website/app needs an **Experience Plan** plus evidence.

No Experience Plan = no release.
No responsive evidence = no release.
No motion/states/accessibility thinking = no release.
No Book review when product-facing = no final PASS.

## Automatic reject conditions

Reject automatically if any are true:

- hero + 3 cards + pricing without its own concept
- standard SaaS dashboard with loose cards and no reason
- no motion concept
- no mobile-first UX
- no visual hierarchy
- no real art direction
- no dark/light plan when relevant
- no responsive evidence
- no performance budget
- no custom interaction
- no storytelling
- no “why this feels special”
- stock/AI art without a consistent system
- old UI/UX patterns without a conscious choice
- generic cards-grid unless consciously proven best for the product
- random gradients without a visual system
- stale/rejected assets rendering
- fake light mode or byte-identical dark/light screenshots
- desktop squeezed onto mobile
- mobile stretched to desktop
- card-in-card clutter
- placeholder UI pretending to be product

## Required Experience Plan

Each website/app must include an Experience Plan in the project docs or evidence bundle before release.

Recommended path:

```text
ops/decisions/EXPERIENCE-PLAN-<project>.md
```

Minimum required sections:

### 1. First 5 seconds

Answer:

- what does the user see first?
- what does the user feel?
- what is unique?
- what is the first proof that this is not template slop?

### 2. Storytelling

Answer:

- how is the concept explained?
- is the story driven by scroll, panels, scenes, motion, cards, 3D, video, copy, or interaction?
- what is revealed first, second, third?
- what must remain simple?

### 3. Motion

Answer:

- which elements move?
- why do they move?
- what state changes do they communicate?
- what is the motion grammar?
- is there a `prefers-reduced-motion` fallback?

### 4. Mobile

Answer:

- how does mobile feel?
- what is the primary thumb action?
- what is removed/collapsed/reordered for mobile?
- are touch/gesture patterns useful?
- proof that desktop was not simply shoved into mobile.

### 5. Desktop

Answer:

- what makes desktop powerful?
- full-screen composition, command center, split view, canvas, 3D, timeline, spatial layout, or other intentional structure?
- what does desktop add beyond a wide mobile layout?

### 6. Visual system

Define:

- colors
- typography
- icon system
- spacing/rhythm
- art direction
- assets
- UI states
- dark/light plan if relevant
- approved/rejected asset manifest

### 7. Proof

Required proof:

- screenshots
- responsive screenshots at mobile and desktop minimum
- video/preview when motion matters
- Lighthouse/performance or equivalent performance notes
- build/test/log output
- QA report
- Book review for product-facing release

## Book QA responsibility

Book must QA this gate for product-facing website/app releases.

Book checks:

- does the first screen feel intentionally designed?
- is there a concept beyond layout components?
- does motion support meaning?
- does mobile feel native/mobile-first?
- does desktop use space intentionally?
- is visual hierarchy clear?
- is art direction coherent?
- are screenshots/responsive proofs present?
- is performance budget stated?
- does evidence prove the claim?
- is anything old/stale/rejected rendering?

Book can mark:

```text
State: PASS / PARTIAL / FAIL
Percent:
Top blockers:
Next owner:
Richard needed:
```

Book PASS is required for final product acceptance unless Richard explicitly overrides.

## Commander pre-release report

Before release, Commander must report:

```text
🎨 EXPERIENCE STANDARD
Project:
Concept:
Why not generic:
Motion:
Mobile:
Desktop:
Visual system:
Book QA needed:
```

## Evidence requirements

Evidence drop must include:

- `MANIFEST.md`
- task file
- Experience Plan
- screenshots/mobile
- screenshots/desktop
- logs/build-test
- checksums.md or checksums.sha256
- QA report or Book gate request
- `WHAT-CHANGED-SINCE-PREVIOUS-QA.md`

For visual changes:

- before/after screenshots must visibly differ and hash differently
- dark/light screenshots must visibly differ and hash differently
- rejected-old-art sweep must be documented

## Relationship to other gates

This gate sits after:

- Current Tech Research Gate
- Project Innovation Gate
- Modern Product Standard
- Anti-Generic SaaS Gate

and before:

- Evidence-First QA final status
- Book Red-Team Gate final product acceptance

## Final rule

If it feels like a template, it fails.

If it cannot explain why it feels special, it fails.

If it has no evidence, it is not done.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
