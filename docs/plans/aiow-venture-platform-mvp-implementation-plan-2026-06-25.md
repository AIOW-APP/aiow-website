# AIOW Venture Platform MVP Implementation Plan

> For Hermes: Use subagent-driven-development skill to implement this plan task by task after Richard approves the canon direction.

Goal: convert AIOW.ai from a website/chat/service direction into an AI Venture Platform entry system with Deal Intake, Deal Card, human decision rail and proof sprint handoff.

Architecture: keep the current Next.js app and existing AIOW domain libs, but reorganize the product around venture platform entities and workflow. MVP avoids overengineering: no marketplace, no full revenue accounting engine, no autonomous contract negotiation.

Tech stack: Next.js 15, React 19, TypeScript, API routes, Supabase-ready storage, local JSONL preview, Resend optional, Spunky webhook optional.

Source of truth: `docs/aiow-venture-platform-canon-2026-06-25.md`

## Phase 0: stop wrong positioning

### Task 0.1: Replace homepage strategic frame

Objective: make the public page clearly say AIOW is an AI Venture Platform, not a chatbot or generic AI agency.

Files:

- Modify: `components/aiow/AiowNativeMotionPage.tsx`
- Modify: `app/layout.tsx`

Acceptance:

- first viewport mentions AI Venture Platform or digital venture partner
- CTA points to submitting company or idea for assessment
- no copy suggests cheap/free build
- no em dash characters in AIOW public text

Verification:

- `npm run lint -- --max-warnings=0`
- `npm run build`
- live HTML search for old service/chat wording

### Task 0.2: Demote generic chat and define AI Intake Console

Objective: Spunky should become intake and qualification, not a generic chat widget.

Files:

- Modify: `components/aiow/AiowNativeMotionPage.tsx`
- Modify: `components/aiow/AiowNativeMotionPage.module.css`
- Modify: `app/api/spunky/chat/route.ts`

Acceptance:

- desktop UI reads as AI Intake Console
- mobile Chat opens a focused intake sheet or dedicated experience
- starter paths: more leads, automate operations, AI/startup idea
- Spunky asks one sharp follow-up question
- contact capture appears after value

Verification:

- Playwright desktop 1440 x 900
- Playwright mobile 390 x 844
- chat interaction proof with useful answer and visible composer

## Phase 1: structured intake

### Task 1.1: Add structured Spunky response contract

Objective: make Spunky return structured facts and routing advice.

Files:

- Modify: `app/api/spunky/chat/route.ts`
- Create or modify: `lib/aiow-spunky-intake.ts`

Response shape:

```ts
type SpunkyIntakeResponse = {
  ok: true;
  reply: string;
  nextQuestion: string;
  leadGate: boolean;
  extractedFacts: {
    company?: string;
    problem?: string;
    useCase?: string;
    projectType?: "company" | "idea" | "scan" | "unknown";
    budgetSignal?: "none" | "low" | "medium" | "high" | "unknown";
    urgency?: "low" | "medium" | "high" | "unknown";
    systemsMentioned?: string[];
    dataMentioned?: string[];
  };
  recommendedRoute: "continue_intake" | "capture_contact" | "create_deal_room" | "paid_scan" | "not_fit";
  riskFlags: string[];
};
```

Acceptance:

- fallback returns this shape even without external webhook
- frontend can render reply and next question
- risk flags never promise build or deal approval

### Task 1.2: Persist visitor sessions and chat messages

Objective: stop losing context before a visitor gives contact details.

Files:

- Create or modify: `lib/aiow-visitor-sessions.ts`
- Modify: `app/api/spunky/chat/route.ts`
- Add local JSONL fallback path under `.data/` or existing durable store pattern

Acceptance:

- anonymous session id is created or reused
- visitor and assistant messages are stored
- extracted facts are stored with session
- no sensitive data is stored without consent beyond necessary session context

### Task 1.3: Lead capture with explicit consent remains separate

Objective: preserve compliance and trust.

Files:

- Modify: `app/api/leads/route.ts`
- Modify: frontend contact gate component

Acceptance:

- asks for name, email, optional company
- asks explicit permission to email/follow up
- stores consent text/version/source
- returning email can be linked to existing lead/account later

## Phase 2: Deal Card MVP

### Task 2.1: Create versioned Deal Card entity

Objective: separate assessment/Deal Card from account so AI and humans can version decisions.

Files:

- Create: `lib/aiow-deal-cards.ts`
- Modify: `lib/aiow-customer-analysis.ts`
- Modify: admin dashboard data loading

Fields:

- id
- accountId
- version
- source: rule_based, ai_assisted, human_final
- scores
- strengths
- gaps
- riskFlags
- missingProof
- firstSprintRecommendation
- recommendedCollaborationModel
- humanVerdict
- createdAt

Acceptance:

- Deal Card can be generated from account/intake data
- previous versions are not overwritten
- admin can see latest and source

### Task 2.2: Admin decision rail around Deal Card

Objective: make human decision the center of internal workflow.

Files:

- Modify: `app/portal/admin/accounts/AdminAccountsDashboard.tsx`
- Modify: `app/api/admin/decisions/route.ts`

Acceptance:

- decisions: GO, CONDITIONAL_GO, ADJUST_DEAL, NO_GO
- note required for NO_GO and ADJUST_DEAL
- proof event logged
- Spunky handoff only after approved decision state

## Phase 3: Deal Room and contract readiness

### Task 3.1: Rename pre-deal customer portal language to Deal Room

Objective: prevent service portal framing before agreement.

Files:

- Modify: `app/portal/customer/[accountId]/CustomerPortalView.tsx`
- Modify: `app/portal/account/new/CustomerAccountCreateForm.tsx`

Acceptance:

- pre-contract UI says Deal Room or AIOW assessment room
- shows missing proof and next step
- does not imply production build has started

### Task 3.2: Contract readiness check

Objective: prevent premature contract generation.

Files:

- Create or modify: `lib/aiow-contract-readiness.ts`
- Modify: `app/api/admin/contracts/route.ts`

Acceptance:

- requires human decision
- requires legal/contact basics
- requires scope summary
- requires collaboration model
- blocks if missing critical info

## Phase 4: Proof Sprint OS

### Task 4.1: Project and task workspace after signing

Objective: make Spunky handoff operational, not just a message.

Files:

- Create: `lib/aiow-projects.ts`
- Modify: `app/api/contracts/sign/route.ts`
- Modify: admin dashboard

Acceptance:

- signed contract can create project shell
- project includes first proof sprint template
- Spunky context package stored
- proof events logged

### Task 4.2: Value receipt template

Objective: make AIOW value measurable.

Files:

- Create: `lib/aiow-value-receipts.ts`
- Add UI in admin or customer portal where appropriate

Acceptance:

- every proof sprint can record baseline, intervention, result and next decision
- supports stop, adjust or scale

## Phase 5: production hardening

### Task 5.1: Supabase migrations

Objective: move from implicit table names to explicit schema.

Files:

- Create: `supabase/migrations/...`
- Document required env vars

Acceptance:

- tables for visitor sessions, messages, leads, consents, accounts, deal cards, decisions, contracts, projects, tasks, proof events, follow-up jobs
- local preview still works with JSONL fallback

### Task 5.2: Auth and RBAC

Objective: admin/customer data is protected.

Files:

- app auth routes and middleware as selected
- admin/customer pages

Acceptance:

- owner, admin, operator, client roles
- admin token preview removed or hidden behind development-only mode
- audit events for sensitive actions

## Verification checklist

- No AIOW public page em dash characters
- No public copy frames AIOW as cheap/free builder
- Spunky is intake, not generic chatbot
- Deal Card can be generated from real intake data
- Human decision is required before contract or project handoff
- Contact capture requires explicit email/follow-up consent
- Mobile Chat is keyboard safe
- Desktop first viewport communicates AI Venture Platform
- Build, lint and Playwright smoke pass
