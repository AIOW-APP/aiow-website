# AIOW MVP and Roadmap v5

## Verdict

The best next build is not a full dashboard suite. The best next build is an AI-first Venture OS shell that proves the core loop: conversation creates memory, memory creates a Deal Card, humans decide the next partnership step.

## Concept comparison

### Concept A, radical minimalism

Only the AI meeting, composer and a small memory object. Highest trust, lowest complexity. Risk: may not prove OS depth enough.

### Concept B, AI first

AI conversation is central. Desktop has a living canvas. Mobile has an app shell with Chat as the primary action. Best MVP direction.

### Concept C, full futuristic OS

All screens visible: home, workspace, team, insights, docs, timeline, account. Strong future, too much for MVP. Risk: SaaS/dashboard drift.

## Chosen direction

Concept B with the restraint of Concept A and selected future modules from Concept C.

## MVP acceptance criteria

### Desktop

- Left rail is identity, not dashboard.
- Center conversation and composer are visible in first viewport.
- Right canvas shows only known or inferred information.
- AI status changes with user action.
- No public em dash characters.

### Mobile

- Mobile is not the desktop layout.
- Bottom nav is fixed: Home, Workspace, Chat, Team, Account.
- Chat is the larger center action.
- Home is a calm AI briefing, not KPI dashboard overload.
- Chat is fullscreen inside the app shell with compact composer.
- Workspace shows focused venture cards, not dense grids.

### Venture Memory

- First message starts a stable session.
- Live facts and assumptions appear in the interface.
- Contact and consent are requested only after value.
- Deal Card language appears before proposal or workspace claims.

### Commercial safety

- AIOW does not imply free building.
- AI may recommend a route but humans decide deal terms.
- Selectivity is visible.

## Build sequence

### Step 1, Canon and guards

Save canonical product direction, no em dash scan, define MVP acceptance criteria.

### Step 2, Public AI-first shell

Refactor homepage into:

- desktop 3-zone AI Venture Partner
- mobile standalone app shell
- center Chat primary action
- progressive Venture Memory

### Step 3, Deal Card MVP

Create persistent Deal Card schema and UI object:

- opportunity
- founder
- market
- AI leverage
- risks
- missing proof
- recommended route
- human review status

### Step 4, Supabase persistence

Replace JSONL/serverless fallback as production source of truth:

- ventures
- conversations
- messages
- venture_memory
- deal_cards
- decisions
- proof_events
- follow_up_drafts

### Step 5, Magic Link and Resend

Real e-mail authentication and consent-first follow-up.

### Step 6, Admin decision rail

Admin queue with human decisions:

- needs more info
- paid diagnostic
- proof sprint
- strategic partnership review
- reject politely

### Step 7, Offline AI digest

Event-backed offline work only:

- no fake busy states
- activity log
- next-day memo draft

## One year roadmap

- Production Supabase and Auth.
- Real Deal Card and decision rail.
- Venture Memory viewer and correction flow.
- Resend follow-up and admin alerts.
- Evidence-backed scoring.
- Private Deal Room after magic link.
- Proposal readiness flow.
- Telegram project handoff after agreement.
- Analytics on visitor to conversation, conversation to magic link, magic link to review, review to proposal.

## Three year roadmap

- Multi-agent diligence engine.
- Portfolio intelligence across ventures.
- Deal committee workflows.
- AI-generated but human-approved contracts.
- Investor and partner network layer.
- Reusable venture playbooks.
- Industry-specific intake and scoring models.
- Evidence graph and benchmark data.
- AI operating layer for active clients.

## Ten year roadmap

- Category-defining AI Venture OS.
- Persistent venture cofounder across company lifecycle.
- AI-native venture studio operations.
- Deal sourcing, diligence, execution and growth in one memory system.
- Standard used to evaluate AI venture platforms.

## Immediate execution decision

Start with Step 1 and Step 2 now. Do not wait for full Supabase or full proposal flow to make the product feel right. The first visible shift must be mobile app-shell plus desktop AI-first shell.