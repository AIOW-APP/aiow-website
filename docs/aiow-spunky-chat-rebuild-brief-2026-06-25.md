# AIOW Spunky chat rebuild brief

## Verdict

The current Spunky chat is technically working but product-wise weak. It feels like a pasted-on widget, not like proof of AIOW's AI capability. It does not deserve prominent hero space in the current form.

## Current blockers

### Desktop

- Chat is positioned as a small overlay on the hero image, competing with the video instead of owning a clear product surface.
- The card is too cramped for the amount of text it produces.
- Long AI answers turn the UI into a dense bubble wall.
- The visual language differs from the page: dark chat box on light hero with low integration.
- The first message promises value, but the actual conversation feels scripted and limited.
- It does not show AIOW's real advantage: intake, scoring, opportunity routing, follow-up, and Team Richard handoff.

### Mobile

- Chat becomes a long embedded block inside the hero, creating a page-within-page feeling.
- The bottom nav and chat composer compete for the same vertical space.
- The chat asks for contact data inside a cramped card, making the page feel like a form again.
- The mode chips and Account/opvolging section add visual noise after the conversation.
- It does not feel like a native mobile chat sheet.

## Product direction

Spunky should become a conversion-grade AI intake experience, not a generic chatbot.

### Desktop direction

Replace the small hero overlay with a premium `AI Intake Console`:

- Right side of hero becomes a calm product console, not a floating chat widget.
- Initial state shows 3 starter paths:
  - I want more leads
  - I want to automate operations
  - I have an AI/startup idea
- User can type freely, but the interface guides them toward business intent.
- AI answer appears as concise analysis blocks, not only chat bubbles:
  - likely opportunity
  - first AI workflow
  - missing proof/data
  - recommended next step
- Contact capture appears as a separate consent step after value, not as another chat bubble.
- If conversation continues, open a larger side panel or inline expanded console.

### Mobile direction

Mobile Chat should open a dedicated bottom-sheet/fullscreen chat experience:

- Bottom-nav Chat opens a smooth sheet over the page.
- Header: Spunky + AIOW context + close.
- Body: concise message flow with sticky suggestions.
- Composer fixed above keyboard/bottom safe area.
- Contact capture is a clean stepper card:
  - name
  - email
  - company optional
  - permission to email
- No duplicate account chips or extra controls inside the composer area.
- The sheet should feel like a focused app experience, not another section in the long homepage.

## AI behavior direction

Spunky should stop giving generic paragraphs. It should use a structured lead-intelligence response:

1. Understand the visitor's business intent.
2. Ask one sharp follow-up question.
3. Extract facts silently.
4. After value, request contact + explicit follow-up consent.
5. Store session context.
6. Prepare a next-day personal follow-up draft.
7. Gate further work behind AIOW review, scope, budget and contract.

## Data direction

Store:

- anonymous session id
- page/UTM/referrer
- device type
- message transcript
- extracted company/problem/budget/urgency/use case
- lead score
- consent event
- next follow-up status
- recommended AIOW route

## Team ownership

- Handsome: product direction, implementation lead, QA and deployment.
- Spunky: live chat/backend agent, context capture, follow-up preparation.
- Book: taste/UX gate for whether the experience feels premium and useful.
- Mini: growth/lead angle, follow-up copy, conversion hypotheses.

## Implementation phases

### Phase 1: Remove widget feeling

- Desktop: convert current overlay into integrated `AI Intake Console`.
- Mobile: replace embedded hero chat with a bottom-sheet/fullscreen chat opened by bottom-nav Chat.
- Simplify controls: starter chips + composer + send only.

### Phase 2: Make Spunky useful

- Rewrite fallback chat logic into structured lead-intelligence responses.
- Add concise answer cards instead of long bubbles.
- Add consent/contact gate after useful interaction.

### Phase 3: Store and learn

- Persist anonymous sessions and lead facts.
- Persist consent and email permission.
- Create next-day follow-up draft pipeline.

### Phase 4: QA and deploy

- Playwright desktop 1440 x 900.
- Playwright laptop 1280 x 800.
- Playwright mobile 390 x 844 and 430 x 932.
- Keyboard-safe mobile QA.
- Verify no em dash on public AIOW page.
- Verify chat answers, stores, gates, and does not overpromise.

## Acceptance criteria

- Desktop chat no longer looks like a pasted-on widget.
- Mobile chat no longer lives as a long embedded card in the page.
- Chat gives a visitor a useful business answer within one exchange.
- Contact request appears only after value.
- Email consent is explicit.
- Data is stored in a way AIOW can use for learning and follow-up.
- Richard can look at it and immediately see: this is what AIOW does with AI.
