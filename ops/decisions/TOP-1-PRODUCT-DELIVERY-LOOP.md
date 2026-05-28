# Top 1% Product Delivery Loop

Status: ACTIVE
Date: 2026-05-17 19:30 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-192914-0a0738

## Purpose

Every project round must move through a disciplined delivery loop before Commander reports final status.

This is the anti-mediocrity operating loop for Team Debbie product work. It applies to websites, apps, native, games/3D, AI tools, trading/automation, internal tools, platforms, and operating interfaces.

## Core rule

No project is "done" because something was built.

A project round is done only when it has:

- clear understanding;
- current research;
- explicit decisions;
- vertical-slice prototype where useful;
- production-shaped build foundation;
- evidence;
- QA;
- blocker iteration;
- one central Commander status.

## Mandatory loop

### 1. Understand

Document:

- project goal;
- target audience;
- platforms;
- business model;
- must-have functions;
- unique experience;
- success criteria;
- constraints and forbidden actions;
- Richard-needed decisions.

Stop condition:

- if the goal/platform/audience is unknowable and materially changes tool choice, ask Richard;
- otherwise make explicit assumptions and continue.

### 2. Research

Use current sources, not memory only.

Research:

- newest stacks;
- motion/UX trends;
- AI tools;
- visual references;
- competitor review;
- primary docs;
- security/performance/observability implications;
- platform-specific constraints.

Required artifact:

```text
ops/decisions/TECH-RESEARCH-<date>.md
```

Exception:

Only Richard can explicitly say `skip research`. If skipped, record the risk and do not claim top-1% until research is restored.

### 3. Decide

Make explicit decisions before building:

- stack decision matrix;
- ADR;
- art direction;
- motion direction;
- platform plan;
- risk plan;
- data/AI/security plan;
- prototype plan;
- Book QA requirement.

Required artifacts where relevant:

```text
ops/decisions/STACK-DECISION-MATRIX.md
ops/decisions/ADR-<project>-stack-choice.md
ops/decisions/EXPERIENCE-PLAN-<project>.md
ops/decisions/MODERN-PRODUCT-STANDARD.md
```

### 4. Prototype

Build one vertical slice.

Rules:

- no throwaway MVP if the project will continue;
- prototype should prove core experience, not just component layout;
- production-shaped basis: repo, structure, types, tests/guards where feasible;
- evidence required even for prototype;
- fake services must be labeled honestly.

Examples:

- first 5 seconds + signature interaction;
- native gesture loop;
- 3D camera/input slice;
- trading data ingestion + risk gate slice;
- AI review-before-save flow.

### 5. Build

Build the actual surface/system:

- code;
- assets;
- data;
- AI;
- motion;
- responsive behavior;
- native features where needed;
- accessibility states;
- error/empty/loading states;
- observability and audit logs where relevant.

Rules:

- do not reuse old junk because it exists;
- do not import stale/rejected art;
- do not ship placeholder UI pretending to be product;
- do not blind-save AI output into user-impacting data;
- trading/live automation remains approval-gated.

### 6. Evidence

Create evidence before claiming readiness.

Required where applicable:

- screenshots;
- video/preview;
- logs;
- before/after;
- checksums;
- performance metrics;
- responsive proofs;
- dark/light proofs;
- generated asset paths;
- route lists;
- build/test output;
- what changed since previous QA.

Evidence drop must satisfy:

```text
ops/evidence/README.md
ops/qa/EVIDENCE-FIRST-QA-PROTOCOL.md
```

No evidence path = no final status.

### 7. QA

Run QA appropriate to the product:

- Book red-team gate;
- mobile;
- desktop;
- dark/light;
- accessibility;
- performance;
- old-art/stale-context guard;
- security and privacy checks;
- state/persistence checks;
- trading risk/data checks where relevant.

Book is leading for product acceptance.

Build PASS is not Product PASS. Visual guard PASS is not Book PASS. Commander claim is not QA.

### 8. Iterate

If QA finds blockers:

- create/fix task from blockers;
- patch product/system;
- upgrade guards where possible;
- regenerate evidence;
- rerun QA;
- report not-final-PASS until Book/product gate passes.

Do not debate evidence. Fix it or mark the state honestly.

### 9. Report

End each project round with one central status to Richard.

Required format:

```text
🧭 COMMANDER CENTRAL STATUS
Project:
State:
Percent:
Stack:
Experience:
Build:
Evidence:
Book QA:
Top blockers:
Next 3 actions:
Richard needed:
```

State must be one of:

```text
PASS
PARTIAL
FAIL
BLOCKED
RESEARCH
PROTOTYPE
BUILDING
READY-FOR-BOOK
```

Only use PASS when evidence and required QA support it.

## Mentality lock

Forbidden mentality:

- geen "goed genoeg";
- geen "oude standaard";
- geen "ik heb iets gemaakt dus klaar";
- geen "Book nog niet nodig" when product acceptance is needed;
- geen "we gebruiken wat er al stond" without review;
- geen oude rommel hergebruiken;
- geen template slop;
- geen fake light mode;
- geen AI blind automation;
- geen final claims without evidence.

Required mentality:

- understand before build;
- research before stack;
- decide before code;
- prototype the core risk;
- build production-shaped foundations;
- prove with evidence;
- let Book red-team product acceptance;
- iterate blockers;
- report one central truth.

## Relationship to existing gates

This loop orchestrates these gates:

```text
Task Contract System
→ Current Tech Research Gate
→ Stack Decision Matrix
→ Project Innovation Gate
→ Modern Product Standard
→ Anti-Generic SaaS Gate
→ Anti-Gare Website Gate
→ Evidence-First QA Protocol
→ Book Red-Team Gate
→ Commander Central Status
```

If any gate conflicts, use this priority:

1. Richard explicit instruction
2. Safety/security/privacy/legal
3. Task contract forbidden actions
4. Evidence-First QA / Book Gate
5. Current Tech Research + ADR
6. Modern Product/Experience gates
7. Commander judgement

## Final rule

Top 1% is a process, not a vibe.

No loop, no top-1% claim.
