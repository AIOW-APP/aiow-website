# Stack Decision Matrix

Status: ACTIVE
Date: 2026-05-17 19:15 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-191426-bf3016

## Purpose

Do not choose the same stack automatically. Choose the stack based on project type, current research, user experience needs, performance, risk, cost, and Team Debbie fit.

This matrix is used after `TECH-RESEARCH-<date>.md` and before any build.

## Required pre-build report

Every project stack decision must report:

```text
🧠 STACK DECISION
Project:
Type:
Options scored:
Winner:
Runner-up:
Why:
Prototype:
Risks:
Richard needed:
```

## Required scoring rubric

Score every viable option from 1-10:

- Performance
- Dev speed
- Future-proof
- Risk
- Cost
- Wow-factor

For `Risk` and `Cost`, 10 means favorable/low-risk/low-cost for this project; 1 means dangerous/high-cost.

Minimum viable matrix:

```text
Option:
Performance: /10
Dev speed: /10
Future-proof: /10
Risk: /10
Cost: /10
Wow-factor: /10
Total /60:
Why use it:
Why not:
Proof/prototype needed:
```

Winner is not always highest total. Commander may choose a lower-total option if strategic fit is better, but must explain why.

## Project type: marketing/landing with high-end visuals

Research at minimum where relevant:

- SvelteKit + Cloudflare
- Astro + islands
- Next.js
- Framer/Webflow only if speed is more important than custom code
- Three.js/WebGPU enhancement
- GSAP/CSS motion

Decision bias:

- Prefer SvelteKit + Cloudflare when custom interaction/performance/future ownership matters.
- Prefer Astro + islands when content/SEO/static speed is dominant and interactivity is modular.
- Prefer Next.js when React ecosystem, Vercel integration, or existing React team/codebase matters.
- Use Framer/Webflow only when speed-to-market beats code ownership/custom interaction.
- Use Three/WebGPU only when visual depth adds meaning; otherwise avoid 3D tax.
- Use GSAP/CSS motion when narrative/motion grammar matters.

Prototype plan examples:

- first viewport motion prototype;
- scroll narrative prototype;
- WebGL/WebGPU performance spike;
- mobile hero recomposition proof;
- reduced-motion fallback proof.

## Project type: webapp / SaaS

Research at minimum where relevant:

- SvelteKit
- Next.js
- Solid/Qwik when performance is unusually important
- Supabase / Convex / Firebase / custom backend
- Cloudflare Workers
- auth / RLS / data security

Decision bias:

- Prefer SvelteKit when app needs lightweight UX, Cloudflare deployment, strong performance, and custom interaction without React gravity.
- Prefer Next.js when React ecosystem, server components, Vercel, enterprise integrations, or existing React libraries dominate.
- Consider Solid/Qwik when interaction/performance constraints justify a less-common ecosystem.
- Prefer Supabase/Postgres/RLS for relational data, auth, auditability, and ownership.
- Prefer Convex for reactive app state and speed if vendor fit is acceptable.
- Prefer Firebase for mobile/offline/realtime speed only when data model/security fits.
- Prefer custom backend when domain/risk/compliance/audit needs outgrow BaaS.
- Use Cloudflare Workers for edge APIs, safe proxies, performance, and simple serverless ops.

Prototype plan examples:

- auth/RLS spike;
- first core user loop;
- realtime/state sync spike;
- API latency budget proof;
- security/audit-log proof.

## Project type: native app

Research at minimum where relevant:

- Expo / React Native
- Swift / Kotlin
- Flutter
- Capacitor only if wrapper is acceptable
- Skia / Reanimated / Gesture Handler

Decision bias:

- Prefer Expo/RN when speed, cross-platform, OTA updates, Team Debbie JS/TS fit, and native-feel are achievable.
- Prefer Swift/Kotlin when platform-specific UX/performance/camera/sensor/native integration is the product.
- Prefer Flutter when custom UI consistency and performance matter more than native platform conventions and team fit is acceptable.
- Use Capacitor only when web-first wrapper is explicitly acceptable; do not choose it for premium native UX by default.
- Choose native-feel over convenience if UX requires it.

Prototype plan examples:

- gesture/navigation prototype;
- haptics/camera/sensor spike;
- native animation performance proof;
- offline/persistence proof;
- App Store feasibility notes.

## Project type: 3D / game

Research at minimum where relevant:

- Three.js/WebGPU
- Babylon.js
- Unity
- Godot
- Unreal only for extreme requirements
- physics/rendering/performance
- controller/input/camera
- assets pipeline

Decision bias:

- Prefer Three.js/WebGPU for web-native 3D experiences, product pages, interactive scenes, and sharable browser-first work.
- Prefer Babylon.js for heavier browser 3D/game structure, tooling, physics, and engine-level features.
- Prefer Unity for cross-platform 3D games/apps where mature engine workflows and asset pipeline matter.
- Prefer Godot for lighter/open-source game work, fast iteration, and indie-style control.
- Use Unreal only when cinematic/AAA/extreme rendering requirements justify complexity.
- No half-baked 3D. If camera/input/performance/assets are not prototyped, the 3D plan is not approved.

Prototype plan examples:

- camera/input prototype first;
- performance budget with target devices;
- asset pipeline proof from Blender/source to runtime;
- physics/collision proof;
- fallback plan for low-end devices.

## Project type: trading / AI automation

Research at minimum where relevant:

- data sources
- broker APIs
- paper trading infra
- risk engine
- audit logs
- backtesting
- news sentiment
- realtime alerts
- no live orders without Richard approval

Decision bias:

- Prefer boring/reliable infrastructure over flashy AI.
- Paper trading first.
- Broker APIs require explicit permission and read/write scope separation.
- Risk engine and audit logs are MVP, not later polish.
- News/sentiment is advisory until validated against forward returns and false positives.
- Live money requires Richard approval plus safety gates.

Prototype plan examples:

- data-source validation spike;
- broker sandbox/paper connection proof;
- backtest baseline with fees/slippage;
- risk engine unit tests;
- audit-log/reconciliation proof;
- alert latency proof.

## Required decision output

Stack decision documents should include:

```text
Project:
Type:
Research doc:
Options scored:
Winner:
Runner-up:
Why winner:
Why runner-up lost:
Prototype plan:
Risks:
Cost notes:
Performance implications:
Future-proofness notes:
Richard needed: yes/no
Evidence path:
```

## Relationship to other gates

Flow:

```text
TECH-RESEARCH-<date>.md
→ STACK-DECISION-MATRIX.md scoring
→ 🧠 STACK DECISION report
→ ADR-<project>-stack-choice.md
→ PROJECT INNOVATION GATE report
→ build/prototype
```

## Final rule

Best stack for this project beats favorite stack.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
