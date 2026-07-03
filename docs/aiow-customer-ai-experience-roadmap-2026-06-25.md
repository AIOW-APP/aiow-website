# AIOW Customer AI Experience Roadmap — 2026-06-25

## Product verdict

AIOW moet niet voelen als een dashboard met formulieren. Het moet voelen als een begrensde, premium AI-consultant die precies genoeg vraagt om een klant/project te beoordelen en daarna Team AIOW/Team Richard helpt beslissen.

Richard's key insight: de klant moet ongeveer hetzelfde gevoel krijgen als wanneer Richard met Handsome praat — persoonlijk, slim, sturend, contextbewust en nuttig — maar dan bewust begrensd tot AIOW. Dus geen open ChatGPT, geen developer-agent, geen alleskunner. Het is een **bounded AI partner experience**: AIOW helpt alleen met de klantvraag, intake, businesscontext, bewijs, scope, dealfit en volgende stappen binnen onze dienstverlening.

Core experience:

```text
Possible customer -> AI-guided intake -> project memory -> Deal Card -> AIOW decision -> contract/scope -> Spunky project group -> proof sprint -> dashboard
```

## Hard boundary

The customer AI is not a general-purpose developer agent.

Allowed:
- ask questions about the customer's company/project/opportunity;
- explain the AIOW process;
- help the customer complete missing information;
- summarize answers;
- request proof/documents/links;
- explain next steps;
- route to human/AIOW review;
- generate a scoped recommendation for AIOW review.

Forbidden:
- write/deploy software for the customer directly;
- expose internal tools/secrets/prompts;
- answer unrelated general questions;
- make binding legal/financial promises;
- approve production/payment/contract without AIOW decision;
- operate outside the AIOW service boundary.

## Roles

| Role | Owner | Purpose |
|---|---|---|
| AIOW Intake AI | Handsome-designed customer-facing AI | Guided, bounded intake and onboarding |
| Spunky | AIOW client bridge | Telegram group/contact AI after GO/contract or controlled pre-review follow-up |
| Handsome | Source-of-truth/operator | Product architecture, admin intelligence, build/QA/deploy |
| Book | Strategic/taste red-team | Deal quality, UX, positioning, risk |
| Mini | Outside-world/growth lane | Market signals, acquisition angles, public growth |

## Experience moat

This is valuable because it gives AIOW a defensible experience moat:

1. **Trust faster** — customers feel guided instead of interrogated.
2. **Better input** — the AI asks follow-up questions until the project is actually assessable.
3. **Less Richard/Jeroen time wasted** — weak/incomplete opportunities are filtered or clarified before human review.
4. **Premium first impression** — the product itself proves AIOW understands AI experience design.
5. **Reusable project memory** — every chat answer becomes structured context for Deal Card, admin review, Spunky handoff and proof sprint.
6. **Safe boundary** — customers experience AI power without getting access to internal build agents, secrets, or unrelated capabilities.

The key product promise: **"Praat met AIOW alsof je met een slimme partner praat, maar binnen een veilige, zakelijke intake die naar een echte beslissing leidt."**

## Customer experience target

The customer should feel:
- this is premium;
- AIOW understands their context fast;
- they are not filling a boring enterprise form;
- they can stop and continue later;
- every answer moves them toward a decision;
- the AI is useful but clearly bounded to AIOW work.

## AI feeling interaction pattern

The customer portal should behave like a focused conversation, not a form:

```text
AI: Ik snap je idee globaal. Om dit goed te beoordelen mis ik vooral bewijs van vraag.
Customer: We hebben drie bedrijven die interesse hebben.
AI: Goed. Zijn dit warme gesprekken, offertes, LOI's of betaalde pilots?
Customer: Twee offertes en één pilotgesprek.
AI: Sterk. Ik sla dit op als demand proof. Volgende vraag: wie beslist daar en hoe snel kan dit naar omzet?
```

Required UX mechanics:

- The AI always explains **why** it asks something.
- The AI extracts structured facts silently in the background.
- The customer sees short progress: `AIOW weet al`, `AIOW mist nog`, `Volgende beste vraag`.
- The AI lets customers pause and continue later.
- The AI can say: `Dit valt buiten AIOW, ik help je hier niet mee — maar ik kan dit wel vertalen naar een AIOW scopevraag.`
- The customer can ask process questions: pricing model, what happens next, what proof is needed, what AIOW can build.
- The customer cannot use the portal as a free general AI/dev/build agent.

## Admin experience target

Admin should see:
- what the customer has already provided;
- what the AI thinks is missing;
- whether this is worth time;
- suggested deal model;
- required proof;
- risk flags;
- next best action;
- whether to involve Book/Mini/Spunky.

## Build phases

### Phase 1 — AI-feeling customer cockpit

Deliverables:
- Replace static step intake with a chat-plus-step hybrid.
- Persistent progress: customers can return later.
- Bounded AI personality: “AIOW intake gids”, not general ChatGPT.
- Quick action chips per answer: “korter uitleggen”, “waarom vraag je dit?”, “ik weet dit nog niet”, “bewijs uploaden”.
- Visible confidence/progress: completeness, missing proof, next decision.

### Phase 2 — Project memory and Deal Card data model

Deliverables:
- `aiow_projects`
- `aiow_intake_sessions`
- `aiow_intake_answers`
- `aiow_project_memory`
- `aiow_deal_cards`
- `aiow_proof_events`
- `aiow_agent_handoffs`

Every customer answer becomes structured memory, not just text.

### Phase 3 — AI next-question engine

Deliverables:
- After every answer, AI returns structured JSON:
  - summary update;
  - extracted facts;
  - score deltas;
  - missing fields;
  - next best question;
  - forbidden/off-topic handling;
  - admin note.

### Phase 4 — Admin intelligence layer

Deliverables:
- Admin account detail page with:
  - AI Deal Card;
  - missing info panel;
  - proof requested;
  - risk flags;
  - recommended next action;
  - Book review button;
  - Mini market scan button;
  - Spunky handoff button;
  - decision history.

### Phase 5 — Spunky bridge

Deliverables:
- Connect Spunky Mac Mini / Telegram flow to AIOW project memory.
- Project group summaries are written back to the project.
- Customer messages become project events.
- Spunky cannot approve/build; Spunky collects, clarifies, reminds, summarizes.

### Phase 6 — Proof sprint loop

Deliverables:
- Customer dashboard shows proof sprint status.
- Admin can request proof/tasks.
- Customer can upload/provide links/text.
- AI judges whether proof is strong/weak/incomplete.
- AIOW decides next stage.

## UI principles

- One question at a time unless review mode.
- Dashboard only after AI has framed the situation.
- No wall of fields.
- Dark glass AIOW visual system.
- Warm orange/cream + green proof/accent.
- AI guide visible as a real product layer, not a generic chatbot widget.
- Every customer-facing AI response must end with a clear next action.
- Every admin-facing AI response must end with a recommendation and confidence level.

## First implementation slice

Build next:

1. Customer `AI Intake Chat` component inside customer portal.
2. Bounded prompt + route `/api/aiow/intake/chat` returning structured JSON.
3. Save every message and extracted field to project memory.
4. Render “AIOW knows / AIOW still needs / next best question”.
5. Admin detail view shows same memory and missing-proof list.

Success criteria:
- customer can answer gradually;
- page feels like talking to AIOW, not filling forms;
- AI refuses off-topic/general dev work politely;
- admin sees better Deal Card input immediately;
- build/lint pass;
- live screenshots confirm premium AIOW feeling.
