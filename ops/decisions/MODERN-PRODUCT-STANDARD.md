# Modern Product Standard

Status: ACTIVE
Date: 2026-05-17 18:49 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-184821-597ea7

## Purpose

Team Debbie builds modern products, not old boring template websites/apps.

Every new project must start with an explicit product-standard decision record before design/build begins. The record must choose platform(s), stack, art direction, motion posture, backend/AI approach, QA evidence, and safety constraints.

## Applies to

- desktop websites
- mobile websites
- PWAs
- native iOS/Android apps
- desktop apps
- games/3D/interactive experiences
- trading/automation systems
- AI-assisted workflows and user-impacting automations

## Project Innovation Gate comes first

Before this Modern Product Standard is applied to implementation, every new project must pass `ops/decisions/PROJECT-INNOVATION-GATE.md` and create `ops/decisions/ADR-<project>-stack-choice.md`. The gate requires project type classification, current research, a minimum 3-option stack matrix, experience concept, and a pre-build report.

## Non-negotiable intake decision

For every new project, Handsome/Hermes must create or update a project-local decision file, usually:

```text
ops/decisions/PRODUCT-PLATFORM-STACK-DECISION.md
```

It must choose at least one platform category:

```text
Platformen:
- desktop website
- mobile website
- PWA
- native iOS/Android
- desktop app
- game/3D
- trading/automation
```

It must also state:

- primary user/device context;
- core user loop;
- art direction;
- motion plan;
- evidence plan;
- anti-generic-SaaS risks;
- Book QA requirement yes/no and why.

## Default Web/PWA standard

Preferred stack for serious new web/PWA products unless project-specific reasons override:

- SvelteKit
- Cloudflare Pages/Workers
- TypeScript strict
- Zod for input/schema validation
- Playwright for browser flows/screenshots
- visual/runtime guards
- project-local evidence drops
- accessibility and performance checks appropriate to scope

Allowed alternatives require a written reason. Next.js is allowed for existing Next projects or integrations, but not as lazy default if SvelteKit/Workers is a better fit.

## High-end visuals standard

High-end visuals may use:

- Three.js WebGPU enhancement
- WebGL fallback
- GSAP and/or native CSS motion
- shaders/particles only if they add product meaning
- reduced-motion fallback
- responsive/mobile-specific compositions
- explicit asset manifest
- visual guard coverage

Rules:

- 3D/motion must serve the product story or user interaction.
- Decorative effects that hide weak product thinking are rejected.
- Every cinematic layer needs a performance budget and fallback.
- Reduced motion is mandatory where motion is non-trivial.

## Native standard

Preferred native stack when native is chosen:

- Expo / React Native
- Reanimated
- Gesture Handler
- Skia where visual rendering benefits from it
- Camera/Haptics/Sensors when they provide real product value
- native-safe persistence/auth pattern
- device-specific QA evidence

Rules:

- Do not build native just for prestige.
- If native is chosen, use native affordances: gestures, haptics, camera, sensors, offline/push where valuable.
- Mobile-first is not the same as stretched web.

## Backend standard

Default backend choices:

- Supabase/Postgres/RLS where user accounts, relational data, and row-level security matter
- Cloudflare Workers/R2 where edge APIs, static/PWA hosting, media/object storage, proxying, and lightweight APIs fit
- project-specific backend when domain requires it

Rules:

- No exposed service-role keys.
- No client-side secrets.
- RLS or equivalent authorization must be planned before real user data.
- API inputs validated with Zod or equivalent.
- Logs must not leak secrets or sensitive personal data.

## AI standard

AI features require:

- structured outputs where data is saved or acted on
- provider adapters rather than hard-wired one-off API calls
- review-before-save for user-impacting data
- confidence/caveat handling
- audit trail for generated or changed data
- no blind automation on user-impacting data

Rules:

- AI suggestions are drafts unless explicit policy says otherwise.
- Vision/voice/photo/barcode estimates must be review-first unless fully validated.
- AI cannot silently overwrite user data.
- Provider/model choice must be documented for critical flows.

## Visual standard

Reject:

- generic SaaS cards
- old template look
- fake light mode
- random gradients
- cheap AI art
- inconsistent icons
- no motion thinking
- no mobile-first design
- no evidence
- bento grids without product logic
- dashboard/cockpit overload when a simple loop is needed
- placeholder UI pretending to be real product

Require:

- clear art direction
- desktop and mobile designed separately
- motion plan
- dark/light if relevant and genuinely distinct
- approved asset manifest
- QA screenshots
- accessibility and performance posture
- evidence-first QA protocol
- anti-generic-SaaS gate review
- Book QA for product acceptance when product/visual quality matters

## Games/3D standard

Rules:

- no half-baked 3D
- choose engine intentionally
- set performance budget before production
- camera/motion prototype first
- fallback plan required
- controls/input model must be tested early
- do not use heavy 3D if a 2D/product-film interaction is better

Engine choice must consider:

- browser vs native target;
- asset pipeline;
- physics needs;
- target device/GPU;
- interaction model;
- build/deploy complexity;
- fallback strategy.

## Trading/automation standard

Trading systems are separate from product/webapp repos unless explicitly scoped otherwise.

Rules:

- separate repo or clearly separated trading subsystem
- paper trading first
- risk controls
- audit logs
- data-source validation
- reconciliation
- kill switches
- no live orders without Richard approval
- no production secrets in logs/evidence
- no hype return claims
- backtests must include costs/slippage/data provenance

Trading acceptance requires research evidence, not visual/product polish.

## Required project decision template

```text
Project:
Task ID:
Owner:
Platform choice:
Primary user/device:
Core user loop:
Stack choice:
Backend choice:
AI choice:
Art direction:
Motion plan:
Dark/light plan:
Asset manifest path:
Rejected patterns risk:
Accessibility/performance plan:
Evidence plan:
Book QA required:
Trading/live safety if applicable:
Richard decisions needed:
```

## Relationship to QA

This standard does not replace Evidence-First QA.

- Use `ops/qa/EVIDENCE-FIRST-QA-PROTOCOL.md` for proof requirements.
- Use `ops/qa/ANTI-GENERIC-SAAS-GATE.md` to reject stale/generic product output.
- Use `ops/qa/BOOK-RED-TEAM-GATE.md` for independent product acceptance.

## Final rule

If the work looks like a generic SaaS template, an old agency website, fake AI magic, or stretched mobile, it is not done.


## Anti-Gare Website Gate

Product-facing website/app releases must pass `ops/qa/ANTI-GARE-WEBSITE-GATE.md`: Experience Plan, first-5-seconds concept, storytelling, motion, mobile, desktop, visual system, proof, and Book QA where product acceptance is needed.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
