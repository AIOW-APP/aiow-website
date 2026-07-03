# AIOW AI Is The Homepage Rebuild Plan

> For Hermes: Use subagent-driven-development skill to implement this plan task by task after Richard approves the AI-is-homepage canon.

Goal: rebuild AIOW.ai so the AI Venture Partner is the homepage and the first five minutes feel like a strategic conversation, not a website visit.

Source of truth: `docs/aiow-ai-is-homepage-canon-2026-06-25.md`

Architecture: use the current Next.js project, but create a new AI-first homepage shell and demote the existing cinematic homepage to reference or supporting route. Preserve useful domain logic for leads, consent, accounts, analysis and storage.

## Phase 0: Rebuild boundary

### Task 0.1: Freeze old homepage as reference

Objective: prevent incremental patching of the old page from becoming the new direction.

Files:

- Modify: `app/page.tsx`
- Optionally create: `app/legacy-aiow/page.tsx`
- Optionally move current AIOW page import to legacy route

Acceptance:

- old cinematic homepage is not the main entry point
- old Spunky widget is not the primary homepage interface
- existing assets remain available as reference only

### Task 0.2: Create AI homepage product module

Objective: isolate the new homepage from old layout debt.

Files:

- Create: `components/aiow/AiowAiHomepage.tsx`
- Create: `components/aiow/AiowAiHomepage.module.css`
- Modify: `app/page.tsx`

Acceptance:

- main route renders new AI-first shell
- no dependency on old `AiowNativeMotionPage` layout for first viewport
- minimal topbar only
- central AI surface dominates viewport

## Phase 1: AI-first interface

### Task 1.1: Build first screen shell

Objective: make the first screen feel like entering AIOW's office.

UI elements:

- logo
- AI status
- language toggle
- theme toggle
- small menu
- central AI greeting
- large input composer
- three starter prompts
- trust boundary line
- live Opportunity Brief placeholder

Acceptance:

- no feature grid above fold
- no pricing above fold
- no form above fold
- no floating chat widget
- desktop and mobile fit first viewport

### Task 1.2: Mobile fullscreen conversation behavior

Objective: mobile feels app-like, not like a long website page.

Files:

- Modify: `components/aiow/AiowAiHomepage.tsx`
- Modify: `components/aiow/AiowAiHomepage.module.css`

Acceptance:

- mobile shows fullscreen AI conversation
- composer stays above keyboard and safe area
- Opportunity Brief is collapsible
- menu does not compete with conversation

## Phase 2: conversation state machine

### Task 2.1: Add intake state model

Objective: replace loose chat flags with explicit conversation states.

Files:

- Create: `lib/aiow-intake-state.ts`

Types:

```ts
type IntakeState =
  | "idle"
  | "intent_detected"
  | "clarifying"
  | "structured_summary"
  | "consent_requested"
  | "contact_captured"
  | "deal_room_ready"
  | "human_review_pending"
  | "rejected_or_low_fit";
```

Acceptance:

- every UI state maps to a clear intake state
- contact step cannot appear before structured summary
- Deal Room cannot appear before contact and consent

### Task 2.2: Add Opportunity Brief model

Objective: make the AI visibly structure the visitor's opportunity.

Files:

- Create: `lib/aiow-opportunity-brief.ts`

Fields:

- opportunity type
- target customer
- proof or traction
- current stage
- systems or data
- growth bottleneck
- desired AIOW role
- budget signal
- risk flags
- missing proof
- recommended route

Acceptance:

- brief starts empty with unknowns
- brief updates after user messages
- brief is visible in desktop and collapsible on mobile

## Phase 3: structured Spunky API

### Task 3.1: Upgrade Spunky response contract

Objective: API returns structured intake intelligence, not just text.

Files:

- Modify: `app/api/spunky/chat/route.ts`
- Create: `lib/aiow-spunky-homepage.ts`

Response:

```ts
type AiHomepageResponse = {
  ok: true;
  state: IntakeState;
  reply: string;
  diagnosisCards: Array<{ title: string; body: string }>;
  nextQuestion?: string;
  opportunityBriefPatch: Partial<OpportunityBrief>;
  recommendedRoute?: AiowRoute;
  leadGate: boolean;
  riskFlags: string[];
  boundaryReminder?: string;
};
```

Acceptance:

- fallback works without webhook
- answer is concise
- next question is one question only
- no hard Go, deal, price or legal promise

### Task 3.2: Frontend renders cards instead of bubble wall

Objective: make the interaction feel like venture intelligence, not chatbot text.

Files:

- Modify: `components/aiow/AiowAiHomepage.tsx`
- Modify: `components/aiow/AiowAiHomepage.module.css`

Acceptance:

- AI response can show diagnosis cards
- message history remains available but not visually dominant
- Opportunity Brief updates after response

## Phase 4: contact and consent after value

### Task 4.1: Contact stepper component

Objective: ask for identity only after a useful preliminary diagnosis.

Files:

- Create: `components/aiow/AiowContactConsentStep.tsx`
- Create or reuse styles in AI homepage module

Fields:

- name
- business email
- company optional
- explicit consent checkbox

Acceptance:

- step appears only when state is `consent_requested`
- consent text is clear
- visitor understands human review is next

### Task 4.2: Connect to lead capture and account creation

Objective: use existing lead/account logic without returning to form-first flow.

Files:

- Modify: `components/aiow/AiowAiHomepage.tsx`
- Use: `/api/leads`
- Use or extend: `/api/customer-accounts`

Acceptance:

- lead is saved with transcript/brief context
- consent event is stored
- Deal Room draft or account draft is created when appropriate
- UI shows human review pending or Deal Room ready

## Phase 5: Deal Room handoff

### Task 5.1: Create Deal Room draft from conversation

Objective: turn the first conversation into a private assessable opportunity.

Files:

- Create or modify: `lib/aiow-deal-room.ts`
- Modify relevant API route or create `/api/deal-room/draft`

Acceptance:

- stores opportunity brief
- links lead/person to draft room
- creates proof event
- route can be inspected in admin later

### Task 5.2: Admin receives AI homepage opportunities

Objective: make AI homepage conversations visible to AIOW operators.

Files:

- Modify: `app/portal/admin/accounts/AdminAccountsDashboard.tsx` or create separate intake queue
- Modify storage functions as needed

Acceptance:

- new opportunities appear in admin queue
- source says AI homepage
- shows brief, missing proof, recommended route and risk flags

## Phase 6: supporting knowledge cards

### Task 6.1: Add AI-callable support cards

Objective: replace static homepage blocks with structured content the AI can show.

Files:

- Create: `lib/aiow-support-cards.ts`

Cards:

- what AIOW is
- who AIOW is for
- collaboration models
- paid assessment boundary
- proof sprint explanation
- Deal Room explanation
- human review statement
- privacy and data boundary

Acceptance:

- AI can show a card when user asks what, cost, process, trust or privacy
- cards do not dominate first viewport

## Phase 7: verification and anti-regression

### Task 7.1: Add AI homepage guard script

Objective: prevent return to old website thinking.

Files:

- Create: `scripts/aiow_ai_homepage_guard.py`

Guard checks:

- main homepage includes AI homepage marker
- no old hero-only marker as primary route
- no em dash in public AIOW source files
- no first viewport pricing marker in AI homepage component
- no floating widget marker in AI homepage

Acceptance:

- script fails on old direction markers
- script passes on new AI homepage shell

### Task 7.2: Playwright first five minute smoke

Objective: prove the new first experience works.

Files:

- Create: `tmp/aiow-ai-homepage-qa.cjs` or test file

Checks:

- desktop 1440 x 900 opens AI homepage
- mobile 390 x 844 opens fullscreen conversation
- user types business idea
- AI returns concise diagnosis
- Opportunity Brief updates
- AI asks one next question
- contact step appears only after value
- no horizontal overflow
- composer visible

Acceptance:

- saves desktop and mobile screenshots under `evidence/`
- JSON result prints pass or clear failure

## Do not build in this rebuild yet

- full old cinematic scroll page replacement
- marketplace
- autonomous contract negotiation
- automatic equity/revenue share decision
- full billing engine
- broad SEO page redesign
- AI that sends external emails without approval
- production data upload without privacy boundaries

## Final acceptance criteria

- The main homepage is the AI experience
- Visitor does not need to scroll to know what to do
- Visitor can start by typing naturally
- AI feels like venture partner, not support bot
- AI gives value before asking contact
- Opportunity Brief builds live
- Deal Room handoff exists
- human review boundary is visible
- old website sections are supporting, not primary
- desktop and mobile QA screenshots pass
- build and lint pass
