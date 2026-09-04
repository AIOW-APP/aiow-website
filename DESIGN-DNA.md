# AIOW — Living Blueprint

## Scope and authority

This file governs the public AIOW V1 surface at `aiow.ai`. It preserves the existing portal, scan, venture and admin surfaces. The approved source is `docs/design/aiow-v1-warm-precision-canon.md` and Richard's approved Warm Precision v2 prototype.

## Product intent

- **Audience:** Dutch owners and operators evaluating practical AI for a company, office or home.
- **Primary task:** understand what AIOW can build for work, property or private life and request one bounded system scan. The transparent indication supports that decision later; it does not lead the first viewport.
- **Platform:** responsive public web, mobile-first.
- **Courage:** 4/5 — restrained editorial confidence with one unmistakable causal system in motion; never decorative spectacle.
- **Emotional core:** “this is where I have my AI built” — calm, exact, materially credible and visibly capable.

## Promise and plain-language law

**Promise:** “U hoeft AI niet te begrijpen. Wij zorgen dat het voor u werkt.”
**Proposition:** “AIOW ontwerpt, installeert en beheert AI voor uw bedrijf, pand of woning. U bepaalt wat het mag doen; wij zorgen dat het werkt.”

Every public surface leads with what becomes easier for the person, then explains technology and boundaries. Truth remains exact; words remain human. Public NL uses `u/uw` consistently. Customer-facing UI, PDF and mail never expose implementation vocabulary such as outbox, adapter, canonical snapshot, durable receipt, frozen request, mail task or lead. Prefer `aanvraag ontvangen`, `vastgelegd`, `uw indicatie`, `voorbeeld` and `beperkte toegang`.

## Brand world

Objects/materials: dark architectural steel, graphite drawing, copper busbar, warm drafting paper, precision ruler, engraved instrument plate, linen proposal, survey notebook, electrical cabinet, architectural section.

Language: indication, scan, scope, implementation, local, private, workflow, square metres, monthly management, partner-dependent.

Avoid: purple/blue AI glow, robots, generic AI-agency claims, fake social proof, dashboard KPI cards, speculative savings claims, over-glass body copy.

## Tokens

- Background `#14161A` — architectural steel.
- Soft background `#1B1E24` — graphite.
- Card `#20242B` — instrument panel.
- Line `#2E333C` — engraved rule.
- Ink `#F4EFE6` — warm drafting paper.
- Muted ink `#A7A297` — aged technical note.
- Only accent `#D9A441` — copper conductor.
- Light theme reverses surface/ink roles while retaining copper and AA contrast.
- Headlines: Fraunces. UI/body: Inter. No third family.

## Composition and visual grammar

The hero is one editorial campaign image: `Wij bouwen AI die uw werk, pand en leven eenvoudiger maakt.` beside **Three Worlds, One Blueprint**. A bespoke isometric drawing makes Process, Property and Home & private life visible simultaneously at rest. One central copper control spine links all three and resolves through a fixed Human Authority node into managed action. Interaction may emphasize one world but may never hide the other two. The calculator moves below understanding, authority and delivery.

Surfaces follow a paper / steel / instrument hierarchy:

- solid drafting-paper or graphite fields carry all body copy;
- steel rails, fine engraved rules and offset section indices create structure;
- the Living Blueprint is the one elevated hero instrument; the deterministic calculator remains the elevated commercial instrument later in the journey;
- the desktop header is the only glass layer: a floating instrument rail with a deliberate opaque fallback;
- statement sections become dark technical scenes with measured grids, rails and asymmetry rather than empty colour bands;
- Process, Property and Home & private life are three joined quarters of one isometric world, not tabs, repeated cards or alternating stock-image rows;
- the homepage shows three representative pricing routes and one route to the complete crawlable tariff index; the 15-route reference deck lives on `/tarieven` rather than lengthening the homepage;
- approach uses one architectural three-stage rail, horizontal on wide screens and vertical on mobile;
- the final CTA is a contained closing instrument scene, not another blank beige band.

Corners remain restrained and nested rather than pill-heavy. Shadows are broad, warm and material; borders remain hairline and engraved. No body-card glass, blobs, glow, robots, fake evidence, dashboard metrics or repeated glass-card soup.

## Theme grammar

Light, Dark and System are equal design modes. Light uses drafting paper as the dominant field with graphite instruments; Dark uses architectural steel with warm paper text and retains depth through border/value separation rather than glow. Copper remains the sole accent in both. `color-mix()` may refine edges and shadows only behind a safe opaque fallback. Theme changes must not alter hierarchy, target size or content.

## Signature and motion

**Signature:** Three Worlds, One Blueprint. On first entry, one finite copper signal draws through the complete Process–Property–Private world, pauses at `Human Authority`, then settles with zero idle animation. Hover, focus or tap emphasizes a quarter and exposes one concise DOM explanation while all three worlds remain visible. Reduced motion shows the complete lit route immediately. The deterministic price instrument remains intact below the capability story.

The blueprint has one calm physical character: construction-line reveal, copper routing and a measured stop at human authority. No video or WebGL is required for comprehension. Nothing scroll-jacks, chases the pointer or implies backend activity. `prefers-reduced-motion: reduce` disables drawing and transitions while preserving the complete static composition.

Motion has five bounded bands: ambient field; fail-open section reveal; short control response; one signal-to-decision signature sequence; and one user-initiated section-level film. Public routes use CSS plus one small IntersectionObserver, not Framer Motion. No scroll-linked parallax or pointer-following. Reveal is visible by default and may enter a pre-state only after JS and motion preference are known. Target budgets: motion JS ≤3 KB gzip added, public JS growth ≤5 KB gzip for the motion sprint, LCP ≤2.0 s on emulated mobile 4G, CLS <0.05, INP <200 ms and Lighthouse mobile performance ≥90.

The homepage remains document-scroll. A film never replaces the hero or calculator. The film belongs once in the `Zo voelt het` section, starts only after a user gesture, reserves 16:9 geometry, uses `preload="none"`, captions on, transcript in HTML, pause/mute controls, Save-Data denial and poster-only reduced-motion behavior.

Navigation may use one translucent layer over content with a solid fallback. The booking dialog is a solid overlay. Body copy never sits on glass. Maximum glass layers: one.

## State design

- Calculator output is always explicit and labelled as an indication.
- Booking is a preferred scan request pending human confirmation, not a claim that calendar capacity has already been reserved.
- Booking errors explain correction; pending state says the request is being checked; success appears only after durable lead and transactional-outbox acceptance.
- Missing booking, quote, mail or storage configuration fails closed and never simulates confirmation.
- Commercial follow-up state is server-authoritative. Read mail, browser state and analytics events never mark a lead handled.

## Conversion and evidence law

- Three Worlds, One Blueprint is the single hero signature. The calculator remains the canonical pricing authority later in the page; conversion improvements may not duplicate either object or add a floating sales widget.
- The scan CTA promises a bounded decision artifact: workflow or space, dependencies, human checkpoints, route recommendation and explicit build / prepare / do-not-automate advice.
- Context pages use one context-specific intake prompt while preserving the same booking flow and pricing authority.
- The six priority contexts—accountants, legal practices, estate agents, office buildings, homes and Signature villas—show one plain-language `Nu vaak → Met AIOW → menselijke beslissing` journey before feature examples. It is a labelled reference workflow, never a customer result or ROI claim.
- Evidence is labelled as `reference architecture`, `internal demonstration`, `pilot` or `customer case`. A customer case, testimonial, saving or outcome is forbidden without recorded evidence and publication approval.
- Knowledge pages live outside the homepage and use dated sources, visible boundaries and a restrained route back to the scan.
- Experiments may test copy or ordering only. They never alter price, exclusions, availability, privacy, security or provider truth.
- The private operations queue is not part of the public information architecture and must never render customer PII on `aiow.ai`.
- The customer journey is one line: indication → PDF indication → free human scan → scan memo/decision → written proposal → connection → management. The website never collapses an indication into a final proposal.
- The homepage and header lead with one commercial action: `Laat één proces of ruimte scannen`. Its adjacent contract states what the visitor receives: what can be built, which boundaries are needed and where a human remains authorised. The later calculator action remains `Ontvang uw indicatie als PDF` and supports—not competes with—the scan.

## Navigation, identity and communication law

- Primary navigation contains four destinations plus one CTA: Oplossingen, Mogelijkheden, Tarieven, Bedrijf, Vraag een scan aan. Ventures remains available from the footer, not as homepage real estate.
- The approach has four stages: Scan, Scope, Bouw, Beheer. Beheer may never disappear from the visible journey because ongoing management is a core differentiator.
- Canonical company facts come from one shared source and render identically in site, schema, PDF and mail: AIOW B.V. · Bijlmermeerstraat 30 · 2131 HC Hoofddorp · KvK 71887466. `info@aiow.ai` and a public 023 number may join this block only after provider activation and readback proof.
- Exactly one public e-mail address appears on public surfaces. Automated customer mail has a monitored reply-to and a plain-text alternative; no `noreply@` identity is used for AIOW sales or scan communication.
- Telephone recording is off by default. A private 06 is never public. Any future AI receptionist identifies itself as AI and offers a direct human route.

## Film, photography and voice law

- Visual storytelling uses Warm Precision documentary scenes: recognizable Dutch work, building and home environments; natural light; graphite/drafting overlays; restrained copper signal lines; real product screens. No institutional chambers, generic luxury stock, robots, neon glow or fake dashboards.
- Every synthetic scenario is labelled as an example, not a customer case. AI-generated imagery and synthetic narration are disclosed.
- Narration uses one original, commercially licensed synthetic voice: Dutch, warm-low, unhurried, slightly dry, neutral Randstad register, never a clone or celebrity imitation. Audio never autoplays. Script, voice/model version, licence, provenance and checksums are registered before release.

## Public capabilities experience

The paired `/mogelijkheden` and `/en/capabilities` route explains in one direct interaction why AIOW is more than a chat window. It does not compete with the calculator signature and does not add a second cinematic hero.

- **Primary task:** choose one real environment—process, building or home—and inspect one complete reference workflow.
- **Canonical trace:** signal/input → bounded AI interpretation → connected system action → explicit human checkpoint.
- **Evidence boundary:** every trace is labelled `public/synthetic reference workflow`; it demonstrates system structure, not a customer result, live backend run, saving, accuracy or autonomous authority.
- **Visual grammar:** one solid instrument field with a fixed four-stage rail; no repeated feature-card grid, dashboard KPIs, robot art, chatbot mockup, purple glow or body-copy glass.
- **Interaction law:** honest AI state + intent-to-inspectable record. The user-stated/sensed input, derived interpretation, proposed action and human decision remain visually and semantically distinct.
- **Motion:** none required for comprehension. Mode changes replace trace content in place with stable controls and geometry; reduced motion uses the same immediate state change.
- **Scan output:** a compact ordered decision artifact showing current situation, selected workflow/space, verified inputs, dependencies, checkpoints, exceptions, recommended pilot, exclusions, published price basis and next decision.
- **Mobile:** the four trace stages become one chronological vertical rail; the complete causal chain and CTA remain visible without horizontal scrolling.

## Copy law

Direct, calm, specific. No invented clients, reviews, addresses, awards, rankings, outcomes or savings. Hardware/installation and cloud/AI use are excluded. Home physical delivery is partner-dependent.

## Responsive and accessibility law

Designed and separately composed at 320, 375, 390, 768, 1024, 1440 and 1920px. Controls are at least 44px, inputs remain 16px on mobile, focus is visible, there is no horizontal overflow, and `prefers-reduced-motion` removes non-essential transitions. Mobile uses its own portrait isometric composition around one vertical authority spine; it never shrinks the desktop world or hides a domain behind a tab. Display type is fluid but the hero and final decision are the only maximum-scale moments.

## Anti-generic gate

The logo-away identity is the warm drafting-paper/graphite/copper material language plus the causal Living Blueprint that visibly anchors AI work at human authority. A competitor name cannot be swapped in without contradicting AIOW's three-world system, management promise, published pricing and explicit authority model. No centered generic AI hero, neon gradient, robot, fake metric or repeated glass-card grid is allowed.
