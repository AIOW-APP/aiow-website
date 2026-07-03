# AIOW AI-is-homepage technische blueprint

Status: architect-lane MVP blueprint  
Datum: 2026-06-25  
Scope: rebuild van AIOW.ai waarbij de AI-agent de homepage is, zonder overengineering.

## 1. Kernbesluit

AIOW.ai moet niet langer aanvoelen als een marketingwebsite met een chatwidget. De homepage wordt één centrale AI-interface die bezoekers kwalificeert, structureert en naar de juiste AIOW-route brengt.

De AI is niet de dealmaker. De AI is de frontdoor, intake-engine en router. Menselijke review blijft verplicht voor commerciële, juridische en strategische beslissingen.

## 2. MVP-productvorm

### Wat de bezoeker ziet

Een rustige pagina met:

1. Minimalistische topbar:
   - AIOW logo
   - `Hoe werkt het`
   - `Voor wie`
   - `Deal Room`
   - taal/optioneel thema
2. Centrale AI-console boven de fold:
   - groot inputveld
   - drie startknoppen
   - korte uitleg dat AIOW kansen beoordeelt en niet gratis onbeperkt advies geeft
3. Onder de AI-console alleen proof en vertrouwen:
   - proces in 4 stappen
   - selectiecriteria
   - voorbeelden van routes
   - human review statement
4. Geen brede SEO-pagina als hoofdbeleving. SEO-content mag blijven als achtergrondroutes, niet als primaire navigatie.

### Startknoppen in de AI-console

- `Ik heb een AI/startup idee`
- `Ik wil mijn bedrijf automatiseren of laten groeien`
- `Ik wil weten of AIOW kan meebouwen`

Vrij typen moet altijd kunnen.

## 3. Desktopgedrag

Desktop is een `AI Intake Console`, geen floating widget.

Layout:

- Links: positionering en trusttekst.
- Rechts of centraal: grote AI-console met genoeg ruimte voor analysekaarten.
- Na eerste antwoord: console groeit naar intake workspace.
- Chatbubbels worden secundair. De AI toont vooral compacte kaarten:
  - `Waarschijnlijke kans`
  - `Eerste workflow/sprint`
  - `Ontbrekend bewijs`
  - `Risico's`
  - `Aanbevolen route`
  - `Volgende vraag`

Regel: binnen één interactie moet de bezoeker voelen dat AIOW zijn context structureert.

## 4. Mobiel gedrag

Mobiel mag geen lange embedded chatkaart in de hero hebben.

Gedrag:

- Homepage opent met korte hero en prominente knop `Start intake`.
- Tap opent fullscreen/bottom-sheet AI intake.
- Composer staat sticky boven keyboard/safe-area.
- Suggesties blijven compact en sticky.
- Contact capture is een aparte stepperkaart, niet een chatbubble.
- Bottom nav maximaal: `Home`, `Intake`, `Proces`, `Deal Room`.

Mobiele intake moet voelen als een app-scherm, niet als een scrollsectie.

## 5. Conversatie-state-machine

Gebruik expliciete states in plaats van losse UI-flags.

```ts
type IntakeState =
  | 'idle'
  | 'intent_detected'
  | 'clarifying'
  | 'structured_summary'
  | 'consent_requested'
  | 'contact_captured'
  | 'deal_room_ready'
  | 'human_review_pending'
  | 'rejected_or_low_fit';
```

### Flow

1. `idle`
   - toon startknoppen en vrije input.
2. `intent_detected`
   - classificeer: idee, bestaand bedrijf, workflow, growth, partnership, anders.
3. `clarifying`
   - stel maximaal één scherpe vervolgvraag tegelijk.
4. `structured_summary`
   - toon analysekaarten, geen lange alinea.
5. `consent_requested`
   - pas na waarde: naam, e-mail, bedrijf optioneel, expliciete follow-up toestemming.
6. `contact_captured`
   - maak lead/session/account draft aan.
7. `deal_room_ready`
   - geef private Deal Room link of access flow.
8. `human_review_pending`
   - AI geeft aan dat Richard/Jeroen/AIOW reviewt.
9. `rejected_or_low_fit`
   - nette no-go of betaalde scan als alternatief.

### Guardrails

AI mag wel:

- intake structureren
- kansen en risico's benoemen
- ontbrekend bewijs aanwijzen
- een route aanbevelen
- een Deal Card draft voorbereiden

AI mag niet:

- Go/No-Go definitief maken
- contractvoorwaarden vastleggen
- revenue share/equity beloven
- juridisch/financieel advies geven
- productie, betaling of externe communicatie starten

## 6. Structured intake schema

De AI moet elk gesprek vertalen naar een `IntakeSnapshot`.

```ts
type IntakeSnapshot = {
  sessionId: string;
  locale: 'nl' | 'en';
  source: {
    route: string;
    referrer?: string;
    utm?: Record<string, string>;
    device: 'desktop' | 'mobile' | 'tablet';
  };
  visitor: {
    name?: string;
    email?: string;
    company?: string;
    role?: string;
    hasConsent: boolean;
  };
  intent: {
    type: 'idea' | 'existing_company' | 'workflow' | 'growth' | 'partnership' | 'unknown';
    summary: string;
    urgency?: string;
  };
  opportunity: {
    targetCustomer?: string;
    currentOffer?: string;
    proofOfDemand?: string;
    traction?: string;
    revenue?: string;
    distribution?: string;
    workflows?: string[];
    systems?: string[];
    dataSources?: string[];
    budgetRange?: string;
    desiredAiowRole?: string;
  };
  assessmentDraft: {
    completenessScore: 1 | 2 | 3 | 4 | 5;
    ventureFitScore: 1 | 2 | 3 | 4 | 5;
    aiLeverageScore: 1 | 2 | 3 | 4 | 5;
    complexityScore: 1 | 2 | 3 | 4 | 5;
    riskFlags: string[];
    missingProof: string[];
    recommendedRoute: AiowRoute;
    firstProofSprint?: string;
  };
};

type AiowRoute =
  | 'no_go'
  | 'paid_venture_scan'
  | 'paid_proof_sprint'
  | 'fixed_build'
  | 'growth_partner'
  | 'hybrid_partner_review'
  | 'selective_venture_review';
```

## 7. Dataopslag MVP

Huidige JSONL fallback mag blijven voor local preview. Productie moet Supabase-first zijn met expliciete tabellen.

### Minimale tabellen

1. `visitor_sessions`
   - id, anonymous_id, created_at, updated_at, locale, route, referrer, utm, device, state
2. `chat_messages`
   - id, session_id, role, content, created_at, metadata
3. `intake_snapshots`
   - id, session_id, version, snapshot_json, created_at
4. `leads`
   - id, session_id, email_hash, email, name, company, status, created_at
5. `consent_events`
   - id, lead_id, consent_type, text, version, granted, created_at
6. `deal_rooms`
   - id, lead_id/account_id, status, access_code_hash, created_at
7. `deal_cards`
   - id, deal_room_id, version, scores_json, route, missing_proof_json, risk_flags_json, created_at
8. `human_decisions`
   - id, deal_card_id, reviewer, decision, note, created_at
9. `follow_up_jobs`
   - id, lead_id, status, scheduled_for, template_version, payload_json

### Privacyregels

- Geen contactgegevens opslaan zonder expliciete toestemming.
- Voor anonieme sessies: transcript en extractie kort bewaren of alleen session-bound bewaren.
- E-mail hash naast e-mail opslaan voor dedupe.
- Consent event is append-only.
- Admin acties loggen.

## 8. AI-architectuur

MVP gebruikt één centrale orchestrator in plaats van meerdere autonome agents.

### Services

- `intakeConversationService`
  - bepaalt volgende state en volgende vraag
- `intakeExtractionService`
  - maakt/updated `IntakeSnapshot`
- `routeRecommendationService`
  - kiest aanbevolen AIOW-route
- `dealCardDraftService`
  - maakt Deal Card v1
- `handoffService`
  - maakt Deal Room en human-review taak

### API-routes

Vervang `/api/spunky/chat` door of bouw door naar:

- `POST /api/intake/message`
  - input: sessionId, message, currentSnapshot
  - output: reply, cards, nextState, updatedSnapshot, leadGate
- `POST /api/intake/consent`
  - legt toestemming en contact vast
- `POST /api/deal-room/create`
  - maakt private Deal Room na consent en minimale intake
- `GET /api/deal-room/:id`
  - klant/admin ziet status en ontbrekende vragen
- `POST /api/admin/deal-card/:id/decision`
  - menselijke beslissing

Belangrijk: de AI-response moet JSON-gestructureerd zijn, niet alleen tekst.

```ts
type IntakeAIResponse = {
  reply: string;
  cards: Array<{ label: string; value: string; confidence?: 'low' | 'medium' | 'high' }>;
  nextQuestion?: string;
  nextState: IntakeState;
  snapshotPatch: Partial<IntakeSnapshot>;
  leadGate: boolean;
  guardrailNotice?: string;
};
```

## 9. AI-routegeneratie

De AI mag een route aanbevelen, maar altijd als `draft`.

### Routecriteria MVP

- `paid_venture_scan`
  - interessant maar weinig bewijs/data/scope
- `paid_proof_sprint`
  - duidelijke kans, één meetbaar experiment mogelijk
- `fixed_build`
  - klant heeft budget en wil delivery zonder upside-complexiteit
- `growth_partner`
  - bestaand bedrijf, distributie/omzet aanwezig, doorlopende optimalisatie zinvol
- `hybrid_partner_review`
  - upside mogelijk maar alleen bij budget, reporting en control
- `selective_venture_review`
  - zeldzaam: sterke founder, markttoegang, proof, data/distributie voordeel
- `no_go`
  - geen duidelijke beslisser, geen budget, geen proof, onrealistische verwachting of free-build framing

### Output naar bezoeker

Noem de route voorzichtig:

> Mijn voorlopige route is: betaalde proof sprint. AIOW moet dit nog menselijk beoordelen voordat er scope of dealvoorwaarden ontstaan.

## 10. Deal Room handoff

Na contact + consent + minimale intake:

1. Maak lead/account.
2. Maak Deal Room met status `human_review_pending`.
3. Maak Deal Card draft.
4. Toon de bezoeker:
   - link/toegangscode
   - wat AIOW al weet
   - welke 3 ontbrekende stukken nodig zijn
   - verwachting: menselijke review, geen automatische deal
5. Admin ziet review queue met scores, transcript, missing proof en routeadvies.

Deal Room is pre-deal. Customer portal komt pas na acceptatie/scope.

## 11. Human review gates

Verplicht menselijke goedkeuring voor:

- Deal Card finaliseren
- Go/No-Go
- Dealmodel
- revenue share/profit share/equity
- contract/scope
- toegang tot klantdata/systemen
- productie/deployment
- externe claims/campagnes
- projectstart

MVP admin-beslissingen:

```ts
type HumanDecision =
  | 'no_go'
  | 'request_more_info'
  | 'offer_paid_scan'
  | 'offer_proof_sprint'
  | 'prepare_fixed_scope'
  | 'prepare_growth_partner_review'
  | 'escalate_to_richard';
```

## 12. Wat bewaren uit huidige repo

Bewaren en versimpeld hergebruiken:

- Next.js 15 + React + TypeScript basis.
- `app/page.tsx` entry, maar nieuwe homepagecomponent maken.
- `/api/spunky/chat` logica als tijdelijke fallback/bron voor guardrails.
- `lib/aiow-lead-capture.ts` voor consent/follow-up principes.
- `lib/aiow-customer-accounts.ts` voor account/access-code concept, maar hernoemen/framen als Deal Room.
- `lib/aiow-customer-analysis.ts` als basis voor score/draftanalyse.
- `lib/aiow-durable-store.ts` als tijdelijke Supabase/JSONL adapter.
- Admin/customer portal code als prototype, niet als leidende UX.
- Canon docs en Spunky rebuild brief als strategische bron.
- Bestaande brand assets/logo/selecte motion assets, alleen als ze de AI-console niet vertragen.

## 13. Wat discarderen of degraderen

Niet meenemen in MVP-kern:

- Grote cinematic homepage als primaire ervaring.
- Complexe scroll-story/video-layers boven de intake.
- Floating chatwidget gevoel.
- Brede SEO sector/regio/vergelijkingsroutes als hoofdnav.
- Pricing/budget calculators die verkeerde verwachtingen scheppen.
- Customer portal framing vóór dealacceptatie.
- Automatische contractonderhandeling.
- Multi-agent platform UI.
- Revenue-share accounting engine.
- Alles wat visitor attention weghaalt van centrale intake.

SEO-routes kunnen blijven bestaan voor indexatie, maar moeten naar de AI-intake leiden.

## 14. Implementatieplan MVP

### Stap 1: Nieuwe homepage-shell

- Maak `components/aiow/AiowIntakeHomepage.tsx`.
- Laat `app/page.tsx` daarnaar wijzen.
- Minimalistische nav + centrale console.
- Bestaande motion page bewaren als archived route indien nodig, niet homepage.

### Stap 2: Intake state en UI

- Maak `lib/aiow-intake-types.ts`.
- Maak centrale reducer/state-machine.
- Desktop console + mobile fullscreen sheet.
- Cards-renderer voor AI-response.

### Stap 3: API message endpoint

- Bouw `POST /api/intake/message`.
- Eerste versie mag deterministic fallback gebruiken plus optionele webhook/model.
- Response altijd `IntakeAIResponse`.
- Persist session/message/snapshot via durable store.

### Stap 4: Consent + lead capture

- Bouw `POST /api/intake/consent` of hergebruik lead capture via nieuw endpoint.
- Leg consent event vast.
- Maak lead aan.

### Stap 5: Deal Room v1

- Hernoem/framing: `/portal/customer/[accountId]` wordt in copy `Deal Room`.
- Maak status, missing proof, Deal Card draft zichtbaar.
- Access-code flow mag blijven voor MVP.

### Stap 6: Admin review queue

- Admin ziet lijst van Deal Rooms met:
  - score
  - routeadvies
  - missing proof
  - transcript/snapshot
  - decision buttons
- Iedere beslissing wordt opgeslagen als `human_decision`.

### Stap 7: QA

- Desktop 1440x900 en 1280x800.
- Mobile 390x844 en 430x932.
- Keyboard-safe mobile composer.
- Rate limits werken.
- Consent verplicht voor contactopslag.
- Geen productie/deal belofte zonder human review.
- Eerste AI-antwoord is nuttig en kort.

## 15. MVP-acceptatiecriteria

MVP is klaar als:

- De homepage primair één AI-intake interface is.
- Een bezoeker binnen één bericht een gestructureerde analyse krijgt.
- De AI vraagt maximaal één vervolgvraag tegelijk.
- Contact capture pas na waarde komt.
- Consent expliciet wordt opgeslagen.
- Een Deal Room/Deal Card draft ontstaat uit de intake.
- Admin kan menselijk beslissen.
- De bezoeker nergens denkt dat AIOW gratis bouwt of automatisch een deal sluit.

## 16. Niet bouwen in deze rebuild

- Geen volledige autonome venture OS.
- Geen echte contractgeneratie zonder review.
- Geen complexe agent marketplace.
- Geen volledige CRM.
- Geen zware personalisatie-engine.
- Geen extra animatielaag tenzij performance en focus intact blijven.

## 17. Architect-oordeel

De snelste juiste rebuild is geen visuele iteratie op de bestaande motion homepage, maar een product-reframe: `AIOW Intake Console + Deal Room handoff`.

Gebruik de huidige repo als voorraadkast voor lead capture, account creation, scoring en guardrails. Gooi de homepage-complexiteit weg als primaire ervaring. Bouw één smalle, sterke route: gesprek naar snapshot, snapshot naar Deal Card, Deal Card naar menselijke beslissing.
