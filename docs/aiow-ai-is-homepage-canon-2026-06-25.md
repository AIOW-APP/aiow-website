# AIOW AI Is The Homepage Canon

Status: active rebuild canon
Owner: Team Richard
Date: 2026-06-25

## 1. Core reset

AIOW.ai is no longer a traditional website with an AI feature.

AIOW.ai becomes one central AI experience.

The AI is the homepage.
The AI is the first introduction.
The AI is the account manager.
The AI is the consultant.
The AI is the venture partner interface.

This does not mean the AI makes final business decisions. It means the AI becomes the primary way visitors understand, explore, qualify and enter AIOW.

The site is no longer a brochure. The site is a conversation.

## 2. What this replaces

This canon overrides every AIOW direction that starts from:

- landing page sections
- hero plus CTA
- pricing blocks
- feature grids
- forms as first step
- chat widget on a website
- generic service navigation
- long scroll storytelling as the main route

Supporting information can still exist, but it is secondary. The AI surfaces it when relevant.

## 3. Product feeling

Opening AIOW should feel like walking into the AIOW office and being received by a sharp digital venture partner.

The visitor should feel:

- I do not need to search
- I can just explain what I want to build
- AIOW understands business, AI, software and growth
- AIOW challenges weak ideas
- AIOW does not blindly sell
- AIOW knows when a human decision is needed
- this is not a chatbot, this is a venture intake interface

## 4. First screen

The first screen has one dominant object: the AI conversation surface.

### Required first impression

Within five seconds, the page should communicate:

Welkom bij AIOW.
Vertel wat je wilt bouwen, automatiseren of laten groeien.
Ik help je bepalen of AIOW jouw digitale partner kan worden.

### Required first question

The AI opens with a simple orientation:

Heb je een startup, een bestaand bedrijf of alleen een idee?
Vertel me waar je aan werkt. Dan kijken we samen of AIOW jouw digitale partner kan worden.

### What must not be in the first impression

- no long hero paragraph
- no feature grid
- no pricing table
- no broad service menu
- no fake chatbot widget in a corner
- no form before conversation
- no giant scroll story before the AI interaction

## 5. Navigation philosophy

The user does not navigate the site. The AI navigates the user.

If the user asks what AIOW does, the AI explains.
If the user asks what it costs, the AI explains the commercial model and boundaries.
If the user asks whether AIOW can help, the AI starts qualification.
If the user has a serious opportunity, the AI guides them into Deal Room creation.
If the user is not a fit, the AI says so or routes to paid scan or later follow-up.

Navigation becomes support, not the main path.

### Desktop navigation

Minimal top layer only:

- AIOW logo
- AI status
- dark or light mode
- language
- small menu
- Deal Room login when relevant

### Mobile navigation

Minimal:

- logo
- menu
- fullscreen chat as the main experience

Mobile should not feel like a website with a bottom nav. It should feel like an app-like conversation.

## 6. What makes the AI not a chatbot

A chatbot answers questions. AIOW's AI should structure opportunities.

The AI must:

- think like an entrepreneur
- ask one sharp question at a time
- challenge weak assumptions
- identify missing proof
- name risks clearly
- explain AIOW's boundaries
- build an Opportunity Brief live
- recommend a route
- ask for contact only after delivering value
- prepare a Deal Card for human review

The AI must not:

- produce generic long paragraphs
- blindly agree
- overpromise
- ask for email too early
- pretend a deal is approved
- act like a support bot
- hide behind marketing language

## 7. First five minute experience

### Minute 0 to 1: orientation

The AI welcomes the visitor and asks for context.

The visitor can:

- type freely
- choose startup or idea
- choose existing company
- choose automate or grow
- ask what AIOW does

### Minute 1 to 2: first diagnosis

After the first message, the AI returns a concise diagnostic response:

- what type of opportunity it hears
- where AIOW might create value
- what is currently unknown
- one sharp next question

### Minute 2 to 4: live Opportunity Brief

The AI builds a visible brief:

- type of opportunity
- target customer
- proof or traction
- existing business or idea stage
- systems or data
- growth bottleneck
- desired AIOW role
- budget signal
- risk flags
- missing proof

The brief updates as the user talks.

### Minute 4 to 5: first route

The AI gives a preliminary route:

- Not enough fit
- Paid Venture Scan
- Paid Proof Sprint
- Fixed Build
- Growth Partner
- Hybrid Partner Review
- Selective Venture Review

Then it asks whether the visitor wants to save the intake and move to a private Deal Room.

## 8. Contact and consent

Contact capture happens only after value.

Correct wording:

Ik kan hiervan een private intake maken voor menselijke review door AIOW. Daarvoor heb ik je naam, zakelijke email en expliciete toestemming nodig om deze samenvatting op te slaan en je gericht te benaderen.

Required fields:

- name
- business email
- company optional at first, required later when relevant
- explicit permission to store and follow up

The user may continue anonymously for a short time, but Deal Room creation requires consent.

## 9. Deal Room handoff

The AI homepage does not end with a form submission. It creates a route.

Possible outcomes:

1. continue anonymous conversation
2. create private intake
3. create or attach Deal Room
4. ask for missing proof
5. recommend Paid Venture Scan
6. recommend Proof Sprint
7. route to human review
8. no fit with explanation

The Deal Room is not a generic customer portal. It is the private place where the opportunity becomes assessable.

## 10. Human review gates

AI may guide and prepare. Humans decide.

Human review is required for:

- Go or No-Go
- collaboration model
- revenue share
- profit share
- equity
- contract terms
- data access approval
- production start
- external communication with legal or commercial weight
- final proposal

The AI should state this clearly when relevant.

## 11. Interface architecture

### Desktop

Desktop is a calm AI command room.

Core elements:

- large central AI conversation surface
- large composer
- starter prompts
- live Opportunity Brief panel
- route panel after enough context
- minimal top navigation
- supporting proof cards only when opened by the AI or menu

### Mobile

Mobile is fullscreen conversation.

Core elements:

- minimal header with logo and menu
- fullscreen AI conversation
- sticky composer above keyboard
- compact starter prompts
- live brief as collapsible sheet
- contact stepper after value
- no long embedded chat card in a page

## 12. Supporting content model

Traditional content becomes AI-callable knowledge.

The AI can show cards for:

- what AIOW is
- who AIOW works with
- collaboration models
- proof sprint examples
- privacy and data boundaries
- human review process
- Deal Room explanation
- examples of digital growth layers

These are not homepage blocks by default.

## 13. Technical product model

The first rebuild must center on these domain concepts:

- conversation session
- message
- intake state
- opportunity brief
- extracted fact
- consent event
- lead profile
- Deal Room
- Deal Card draft
- human decision
- follow-up job
- proof event

The current repo can preserve:

- lead capture logic
- consent capture patterns
- customer account foundations
- analysis and scoring logic
- durable store abstraction
- Spunky API guardrails
- admin dashboard ideas

The current repo must demote or remove from the primary homepage:

- cinematic homepage as the first route
- floating Spunky widget
- broad pricing section
- conventional form-first intake
- service-grid framing
- scroll-story as mandatory education

## 14. MVP rebuild

The first MVP should not rebuild every page. It should prove the new interaction model.

### MVP scope

1. New AI-first homepage shell
2. Central AI Venture Partner conversation
3. Structured intake state machine
4. Live Opportunity Brief panel
5. Starter prompts
6. Structured Spunky response API
7. Contact and consent step after value
8. Deal Room draft creation
9. Deal Card draft creation or handoff to admin
10. Human review pending state

### MVP success criteria

- user opens AIOW and immediately knows they can talk
- user does not need to scroll or search
- AI gives useful diagnosis within one exchange
- AI asks one sharp question at a time
- AI builds a visible Opportunity Brief
- contact request appears only after value
- Deal Room creation is the natural next step
- no one mistakes AIOW for a chatbot company
- no one expects free building

## 15. Anti-regression rules

Any future AIOW homepage change fails if:

- AI becomes a secondary widget
- first viewport is mainly marketing copy
- user must scroll to understand what to do
- form appears before conversation
- pricing blocks dominate the public flow
- generic agency/service framing returns
- AI gives generic long answers
- AI asks for email before meaningful value
- AI implies human approval when there is none

## 16. Final principle

Do not design a homepage.

Design the best first meeting an entrepreneur can have with AIOW.

The AI is not a feature on the page.

The AI is the page.
