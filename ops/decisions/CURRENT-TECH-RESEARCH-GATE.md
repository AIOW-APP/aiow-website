# Current Tech Research Gate

Status: ACTIVE
Date: 2026-05-17 19:05 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-190412-310332

## Purpose

Every project starts with **current technical research** using official sources and primary docs where possible. Memory-only stack decisions are forbidden.

No build starts without:

```text
ops/decisions/TECH-RESEARCH-<date>.md
```

unless Richard explicitly says: **skip research**.

## Hard rule

Before any new project, website, webapp, native app, game, AI-tool, trading-bot, automation system, internal tool, or platform build:

1. create `ops/decisions/TECH-RESEARCH-<date>.md`;
2. check current official/primary docs for relevant categories;
3. compare relevant stack/tool options;
4. choose the best stack for this project;
5. document why the alternatives are not chosen;
6. document risks, performance implications, costs, and prototype requirements;
7. feed the result into `ops/decisions/ADR-<project>-stack-choice.md`.

## Source discipline

Use current/official/primary sources where available:

- official docs
- release notes/changelogs
- pricing pages
- platform capability docs
- browser/platform compatibility data
- security/auth docs
- provider API docs
- repo docs only when official docs are insufficient

Secondary blog posts are useful only as support, not authority.

## Relevant categories to check

### Web / PWA

Check where relevant:

- SvelteKit
- Next.js
- Astro
- SolidStart
- Qwik
- Remix / React Router framework
- Cloudflare Workers/Pages
- Vercel
- Netlify
- Supabase
- Convex
- Firebase
- custom backend

### Interaction / Motion

Check where relevant:

- GSAP
- View Transitions API
- CSS Scroll-driven Animations
- Web Animations API
- Framer Motion when React is relevant
- Rive
- Lottie
- native CSS motion
- scroll/timeline techniques

### 3D / Visual

Check where relevant:

- Three.js
- Three.js WebGPURenderer
- WebGL fallback
- WebGPU readiness
- Babylon.js
- React Three Fiber only when React-stack is logical
- shaders
- particles
- Gaussian splats
- Blender pipeline
- performance budget

### Native

Check where relevant:

- Expo
- React Native New Architecture
- Skia
- Reanimated
- Gesture Handler
- Camera
- Haptics
- Sensors
- Swift/Kotlin if native-only is more logical

### AI

Check where relevant:

- OpenAI
- Claude
- Gemini
- local LLMs
- vision
- voice
- structured outputs
- agents
- tool use
- evals
- RAG/vector
- image generation
- video generation

### Assets / Motion

Check where relevant:

- GPT Image 2 or better current image tool
- Kling.ai or better current video tool
- Runway/Pika/Luma when better for the project
- Figma/Framer/Rive/Blender where useful

### Trading

Mandatory for trading/automation:

- paper trading first
- broker APIs only with permission
- risk controls
- audit logs
- news/data validation
- no live money without Richard approval

## Required output file

Create:

```text
ops/decisions/TECH-RESEARCH-<date>.md
```

Minimum content:

```text
# Tech Research — <project> — <date>

Status:
Task ID:
Project:
Owner:
Research date:
Richard skip-research override: yes/no

## Project context

## Sources checked

## Relevant categories

## Stack/tool options

## Recommended choice

## Why this choice

## Why not the alternatives

## Risks

## Performance implications

## Costs

## Security/privacy/observability

## What we must prototype first

## Impact on ADR

## Evidence paths
```

## Decision quality bar

A good tech research doc says:

- what is current now;
- what is stable enough;
- what is powerful but overkill;
- what is risky or immature;
- what best fits Team Debbie's actual capabilities;
- what needs a spike/prototype before full build;
- what must be avoided.

## Project Innovation Gate integration

This gate is a prerequisite for:

- `ops/decisions/PROJECT-INNOVATION-GATE.md`
- `ops/decisions/ADR-<project>-stack-choice.md`
- `ops/decisions/MODERN-PRODUCT-STANDARD.md`
- `ops/qa/ANTI-GENERIC-SAAS-GATE.md`

Flow:

```text
Richard idea/request
→ task contract
→ TECH-RESEARCH-<date>.md
→ PROJECT INNOVATION GATE report
→ ADR-<project>-stack-choice.md
→ prototype/build task
→ evidence-first QA
→ Book gate if product acceptance needed
```

## Skip research override

Only Richard can skip.

If skipped, record in the ADR/task:

```text
Richard explicitly said: skip research
Scope limit:
Risk accepted:
No top-1% claim until research is restored: yes
```

## Final rule

No build starts from memory alone.


## Stack Decision Matrix

After current tech research, use `ops/decisions/STACK-DECISION-MATRIX.md` to score project-type options 1-10 on performance, dev speed, future-proof, risk, cost, and wow-factor. Record winner, runner-up, why, prototype plan, risks, and Richard-needed status before ADR/build.


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
