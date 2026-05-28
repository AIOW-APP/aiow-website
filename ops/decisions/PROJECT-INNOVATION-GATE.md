# Project Innovation Gate

Status: ACTIVE
Date: 2026-05-17 19:00 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-185945-ce2987

## Purpose

No new project, website, webapp, native app, game, AI-tool, trading-bot, platform, internal tool, or operating-system/interface may go directly from idea to build.

Team Debbie builds top-1% product experiences: development, UI/UX, motion, art direction, interaction design, native/mobile experience, performance, AI integration, and future-proof architecture.

Top 1% does **not** mean the heaviest stack. It means the best stack for the specific project.

## Current Tech Research Gate comes first

Before this Project Innovation Gate can pass, Commander must create `ops/decisions/TECH-RESEARCH-<date>.md` using current official/primary sources for relevant Web/PWA, motion, 3D/visual, native, AI, assets/motion, backend/deployment, and trading topics. No memory-only stack decisions. Only Richard can explicitly say `skip research`.

## Hard rule

Before build starts, Commander must produce a Project Innovation Gate report and a stack ADR:

```text
ops/decisions/ADR-<project>-stack-choice.md
```

No ADR = no build.
No research = no build.
No 3-option stack matrix = no build.
No experience concept = no build.
No evidence plan = no build.

## Anti-default rules

Reject automatic defaults:

- no simple HTML site if an interactive experience is needed
- no heavy 3D engine if fast scrollytelling is better
- no standard dashboard if the product needs a custom interface
- no old template-look
- no generic cards-grid unless deliberately proven best
- no “Tailwind cards because it is fast” as default rationale
- no old art, old UI, old motion
- no fake AI magic
- no platform choice without user/device context

## Step 1 — Determine project type

Choose one or more:

- marketing website
- landing page
- webapp
- SaaS dashboard
- native app
- game
- 3D experience
- AI assistant
- trading/automation system
- internal tool
- operating system/interface
- hybrid platform

Record why this type is correct and what it is **not**.

## Step 2 — Research sprint

Before stack selection, check current/best techniques for the project class:

- frontend framework
- backend/deployment
- UI/UX patterns
- motion/animation
- 3D/WebGPU/WebGL
- native mobile
- AI tooling
- asset generation
- performance
- security
- observability

Research must be current enough for the decision. For fast-changing areas — AI models, frameworks, deployment, native tooling, WebGPU, security, prices — use live/current sources where available.

Minimum output:

```text
Research sources:
- source/date/link or local project evidence
Findings:
- what changed recently
- what is stable
- what is risky
- what is overkill
- what is best-in-class for this exact project
```

## Step 3 — Stack decision matrix

Compare at least 3 viable options.

For each option include:

- why use it
- why not
- future-proofness
- complexity
- performance
- risk
- cost
- team fit
- proof needed

Matrix template:

```text
Option A:
Why use it:
Why not:
Future-proofness:
Complexity:
Performance:
Risk:
Cost:
Team fit:
Proof needed:

Option B:
...

Option C:
...
```

## Step 4 — Experience concept

Before build, describe:

- what does the user feel?
- what does the user see first?
- what is the wow-factor?
- how does the interface move?
- what is mobile-first?
- what is desktop-first?
- where is 3D/motion valuable?
- what must stay simple?
- what should be deliberately absent?

This prevents “nice UI” without product soul.

## Step 5 — Architecture Decision Record

Create:

```text
ops/decisions/ADR-<project>-stack-choice.md
```

The ADR must include:

```text
# ADR-<project>-stack-choice

Status:
Date:
Task ID:
Project:
Owner:
Decision:

## Project type

## User/device context

## Current research

## Stack options compared

## Recommended stack

## Why this stack

## Why not the other options

## Experience concept

## Motion/visual approach

## AI/tooling approach

## Architecture overview

## Security/privacy/observability

## Performance budget

## Prototype needed

## Proof needed before production

## Risks

## Richard decision needed

## Evidence paths
```

## Required report before build

Before building, Commander reports to Richard or records in project ops:

```text
🚀 PROJECT INNOVATION GATE
Project:
Type:
Research done:
Stack options:
Recommended stack:
Why:
Risks:
Motion/visual approach:
AI/tooling approach:
Prototype needed:
Richard decision needed: yes/no
```

## Integration with existing standards

This gate comes **before** implementation and works with:

- `ops/decisions/MODERN-PRODUCT-STANDARD.md`
- `ops/qa/ANTI-GENERIC-SAAS-GATE.md`
- `ops/qa/EVIDENCE-FIRST-QA-PROTOCOL.md`
- `ops/qa/BOOK-RED-TEAM-GATE.md`
- task contracts in `ops/tasks/active/`

## When Richard can override

Richard may explicitly say to skip/shortcut the gate for a disposable throwaway experiment. In that case record:

```text
Richard override:
Scope limit:
No-production claim:
No-final-quality claim:
```

Without explicit override, the gate is mandatory.

## Final rule

A build that skipped this gate is not a Team Debbie top-1% product build. It is an unapproved shortcut.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
