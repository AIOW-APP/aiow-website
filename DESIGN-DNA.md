# AIOW — Human Industrial

## Authority and status

This file governs the public AIOW homepage and the Route Field Cinema candidate on branch `feat/aiow-route-field-cinema-20260907`. Richard rejected the prior Quiet Monolith and editorial architecture directions because they retained the recognisable visual grammar of AI-generated “premium” sites: fashionable serif/sans pairings, beige/black/gold, generic architecture imagery, glass, and mirrored light/dark themes.

Human Industrial and the sitewide pricing/brand closure entered production on 2026-09-08 at merge `68a8407fc6c52e214752f0fad142d1b6465fb4a2`, with exact custom-domain readback and full live route proof. Richard's next direction is commercial authority: AIOW must make work, buildings and private life easier; immediate reachability, real evidence and national discoverability now outrank further decorative expansion.

## Product intent

- Audience: Dutch owners and operators seeking bespoke AI for company processes, a commercial building, or a home/villa.
- Primary task: choose the correct world in 3–5 seconds, then see only relevant examples, boundaries, price context and scan flow.
- Primary worlds: `Werk`, `Pand`, `Wonen` in the expressive hero; full accessible labels remain `Voor mijn bedrijf`, `Voor mijn bedrijfspand`, `Voor mijn woning of villa`.
- Courage: 5/5. AIOW must look authored, not prompt-generated.
- Emotional core: precise control with human presence; less friction, fewer loose tools and more room for life and real work.

## Promise

NL H1:

`AI op maat voor uw bedrijf, bedrijfspand en woning.`

NL support:

`Geen losse tool. AIOW ontwerpt, bouwt, koppelt en beheert één systeem dat uw werk, gebouw of huis makkelijker maakt.`

EN H1:

`Bespoke AI for your company, commercial building and home.`

Human authority remains explicit: `Een mens beslist. Altijd.` / `A person decides. Always.`

## Brand world

Physical sources:

- Dutch wayfinding and civic signage;
- industrial control labels;
- anodised aluminium;
- lacquered emergency-stop red;
- deep green machinery paint;
- chalk markings;
- milled instrument apertures;
- indexed technical binders;
- architectural material boards;
- precisely aligned switchgear.

Insider language: ontworpen, gebouwd, beheerd, gekoppeld, begrensd, scan, scope, mens beslist, één geheel, dagelijks beheer.

Avoid: AI glow, robots, generated architecture heroes, dashboards, glass cards, purple/blue gradients, default SaaS icons, fake metrics, repeated rounded cards, fashionable editorial serif, beige/black/gold luxury, raw stock photography.

## Visual system

### Typography

- Display: narrow industrial/signage grotesk with a deliberately resilient stack: `Avenir Next Condensed`, `Arial Narrow`, `Helvetica Neue`, sans-serif. The production composition is proven against the non-Avenir fallback; a licensed or commissioned AIOW cut is an optional future refinement, not a release dependency.
- Body/UI: humanist sans. Prototype stack: `Avenir Next`, `Segoe UI`, system-ui, sans-serif.
- No serif anywhere on the public homepage.
- Display is uppercase only for short promises, route words and instrument labels; body copy stays sentence case.

### Day palette

- Aluminium `#E4E5E0`
- Instrument black `#11110F`
- Lacquer red `#D94B30`
- Secondary graphite `#686963`
- White `#F5F4EE`

### Evening palette

Evening is independently art-directed, not an inverted day palette:

- Machinery green `#17382E`
- Chalk `#DDEADD`
- Coral control `#F56A4D`
- Muted mineral `#9EB7A9`
- Deep field `#10271F`

System mode selects day/evening by OS preference. Manual Light/Dark remains available but is described visually as Day/Evening where copy allows.

### Shape and surface

- Square or 1–2px corners; no pill navigation or repeated rounded cards.
- Hairline rules establish rhythm.
- Large solid fields, hard crops and typographic scale create depth.
- No body glass. One sticky navigation layer may use a near-solid surface with subtle transparency and solid fallback.
- The outlined `O` is the physical aperture in the A-I-O-W spine and the primary identity motif.

### Distribution surfaces

Human Industrial continues beyond the mounted page into every automatically generated brand carrier:

- Open Graph / WhatsApp / LinkedIn / X use one 1200×630 Day master: aluminium field, instrument-black spine, lacquer-red offer block, hairline measurement grid and the three stable buyer routes `BEDRIJF / BEDRIJFSPAND / WONING`.
- The share headline is the product category, never a temporary campaign slogan: `AI op maat voor bedrijf, bedrijfspand en woning.`
- Essential text stays inside a 72px safe area and remains legible at a 320px-wide chat-card rendering. No gradient glow, cyan, Warm Precision label, stock asset, tiny body paragraph or rounded status token.
- Social metadata uses the same current proposition and a localized descriptive alt; WhatsApp, LinkedIn and X may crop but may not lose `AI OP MAAT`, AIOW identity or the three buyer worlds.
- Browser/favicon and Apple touch icon use one square instrument glyph: black field, lacquer aperture and chalk calibration marks. They are glyphs, not miniature collateral.
- Transactional HTML email uses a solid aluminium technical sheet with black type, lacquer rule, square CTA and plain-text parity. No glass, dark hero, remote decorative image or CSS that mail clients commonly strip.
- The generic multi-brand OG helper may remain for other products, but AIOW never routes through its cyan/glow preset.

## Homepage composition

### Mobile 320/375/390

Compact identity/header → short eyebrow → four-line H1 with one lacquer field → concise support → human-authority line → all three route rows → compact active Route Field → one primary `Start de scan` action.

All three routes must remain identifiable in the first useful viewport at 390×844. At 320px the third route may touch the lower edge but must remain visible and tappable without horizontal overflow.

### Desktop 1024/1440/1920

A fixed-width A-I-O-W identity spine anchors the left edge. The promise and route instrument share the left scene without overlap. A solid Route Field occupies the right scene. The active route expands within that field without moving any link target.

The header is a horizontal instrument line, not a floating rounded navigation pill. Its primary labels mirror the customer journey: `Bedrijf`, `Bedrijfspand`, `Woning`, `Kosten` / `Company`, `Building`, `Home`, `Costs`.

## Signature motion — Route Field Cinema

Purpose: make AIOW feel like one precisely commissioned system, then use the same physical grammar to clarify route choice and page progression. This is one signature behaviour at three scales, not three unrelated effects.

State authority:

- One `activeRoute` state controls pointer hover, keyboard focus and visual field.
- Links remain normal semantic links; click/tap navigates directly.
- Visual layers are decorative and `aria-hidden`.
- `aria-current` is not used for a hover preview because no navigation has occurred.
- User input always interrupts and retargets the current visual state; programmed route previews never queue.

Commissioning sequence — one shot after hydration:

- The complete product category and all three buyer environments are readable in the H1 before choreography begins.
- The identity spine energises, the lacquer field opens and a travelling calibration line connects promise, route list and field.
- After the offer headline has had time to register, the field previews `Werk → Pand → Wonen → Werk` once, exposing breadth without moving route links or delaying access.
- Total authored sequence target: 3.1–3.5 seconds, with the first route change no earlier than approximately 1.2 seconds so the offer headline registers first. Any pointer, focus, key or touch intent cancels it immediately and hands authority to the visitor.
- It never loops, never replays on theme change and never gates content or navigation.

Route preview:

- Active solid field reveals with one directional shutter assembled from two compositor-safe panels.
- Large route word follows 55–90ms later with a restrained masked settle; context follows as a quieter delayed layer.
- Route indicator and calibration line move through transforms, never through layout geometry.
- Desktop target transition: 460–560ms, cubic-bezier(.22,1,.36,1).
- Mobile target transition: 320–420ms.

Scroll continuation:

- One fail-open `IntersectionObserver` director marks major sections and their bounded child sequence once.
- The same calibration line and shutter logic reveal section headings, environment rows, authority steps, method steps, calculator and decision memo.
- Desktop uses 20–28px travel with 580–760ms settle; mobile uses 12–16px with 360–480ms settle. Stagger is capped at three levels: 90ms desktop and 55ms mobile.
- Scroll velocity above the calibrated fast-flick threshold compresses pending reveals to 100–140ms with no stagger, so content never trails the visitor.
- Scrolling remains native. There is no scroll-jacking, pinned fake timeline, parallax or progress theatre.

Invariant anchors: H1, route links, header, scan contract, calculator controls and focus targets never move.

Reduced motion / weak device / no-JS:

- `prefers-reduced-motion: reduce`, `update: slow` and Save-Data skip commissioning and remove travel/transition.
- The reveal system is strictly fail-open: content is visible by default; a root readiness class may hide only not-yet-seen items after observers are registered.
- Default route content is rendered in settled state in HTML.
- Without JavaScript all links, content, calculator and the first visual field remain legible and usable.
- No feature, claim or selected state exists only in motion.
- No idle loop, particles, cursor following, heavy video, WebGL, animated blur or decorative continuous motion.

## Theme behavior

Day and Evening share information architecture and semantics but not merely colours:

- Day uses the black identity spine and lacquer route field.
- Evening uses the green field, chalk type and coral aperture; background field geometry shifts independently.
- Theme switching may crossfade surfaces but may not replay the full entrance choreography.
- Both themes retain AA contrast, visible focus and identical authority text.

## Conversion

The hero presents one primary commercial action only after all three worlds remain readable. It never becomes a generic two-button landing template: route selection remains the orientation instrument, `Start de scan` is the sole button, and pricing stays out of the hero.

Visitors can still choose a world first:

- Werk → `/ai-automatisering`
- Pand → `/smart-office`
- Wonen → `/home`

Those routes preserve context in both scan surfaces:

- Werk → modal subject `bedrijf` and `/scan?intent=proces&returnTo=/ai-automatisering`
- Pand → modal subject `pand` and `/scan?intent=pand&returnTo=/smart-office`
- Wonen → modal subject `woning` and `/scan?intent=woning&returnTo=/home`
- The URL encoding may escape `/`; the semantic return path stays identical.
- Only the closed known NL/EN pillar-route set may be used as `returnTo`; direct or invalid scan entries use the capabilities fallback.

Route-page first-viewport contract:

- At widths where the header scan action is visible, it remains the only dominant first-viewport commercial action.
- At mobile/tablet widths where that header action moves behind Menu, one inline scan action appears immediately after the route H1.
- That action opens the canonical modal directly; it never scrolls to an intermediate CTA.
- Its adjacent microcopy states free, approximately max. 30 minutes, decision memo and human date/time confirmation.
- The longer route explanation remains fully available below; mobile conversion closure may not delete product truth.
- The three route pages inherit the Human Industrial shell: square geometry, condensed uppercase display type, aluminium/red Day, green/coral Evening and the same header IA. Falling back to the legacy beige/serif shell is a visual-continuity failure.

The scan contract remains: free, approximately max. 30 minutes, human confirmation, decision memo, separate scoping for hardware/installation/external qualified partners.

The primary homepage action may promise a first human contact by Jeroen and a response window only after phone/mail routing and that service level have passed real operational proof. Before then it uses claim-safe scan microcopy without an unproven response-time promise.

The public pricing journey uses one canonical quote transaction. Before opening the form, the page explicitly states both release channels: `directe PDF-download plus dezelfde PDF per transactionele e-mail` / `direct PDF download plus the same PDF by transactional email`. The server recalculates and durably records the indication before either channel is released; there is no second, weaker mail-only or download-only path. The result remains an indication rather than a final offer, and one dominant action owns both channels.

## Sitewide Human Industrial composition system

Human Industrial is the public-site shell, not a homepage skin. Every mounted public NL/EN route inherits the same aluminium / signal-red Day world, deep-green / coral Evening world, condensed industrial typography, square geometry, thin measurement rules, stable header and semantic focus language.

Page families deliberately use different working instruments:

- Homepage: one-shot Route Field Cinema commissioning and three-environment selection.
- Pillar routes: route declaration, boundary, applications and implementation sequence.
- Capabilities: one selected causal trace from signal to human decision; never a feature-card catalogue.
- Tariffs index: measured tables and commercial boundaries, composed as a technical price sheet.
- Tariff context: one practical workflow, transparent calculation and bounded next decision.
- Knowledge / privacy / company: editorial evidence dossiers with numbered sections, rules and verified facts; no cream-serif article template or rounded cards.
- Scan: one bounded intake surface inside the same shell, with preserved intent and a safe return route.
- Ventures: an explicit separate-agreement dossier within AIOW identity; never visually mistaken for the Solutions offer.

Motion hierarchy:

- Route Field Cinema remains the only automatic signature moment.
- Secondary pages use no idle loop and no second cinematic metaphor.
- Family-level entrances may use the existing fail-open reveal grammar only when content is visible by default, interrupted by input, and snapped for Reduced Motion / Save-Data / no-JS.
- Navigation, CTA, table and form hit geometry never moves.

Responsive hierarchy:

- 320 / 375 / 390: one recognisable route or document purpose, one first-viewport commercial action where commercial action is appropriate, full-width square controls and no clipped long compound words.
- 768 / 1024: family composition may split into label rail + content field; never inherit desktop whitespace blindly.
- 1440+: use asymmetric measurement fields and deliberate empty space, not centred generic landing-page stacks.

The homepage shell is token authority. Family CSS may change layout and density, but may not redefine palette, display family, corner language, focus style or header variant.

## Knowledge architecture

SEO/GEO/GAO depth lives in the knowledge layer and contextual route pages. The primary homepage journey contains only what is needed to choose a route, understand the delivery model and take the next action.

Priority context pages preserve one optional plain-language journey before feature examples: `Nu vaak → Met AIOW → menselijke beslissing` / `Current situation → With AIOW → human decision`.

National authority is built as an entity-and-answer system, never as a thin page farm:

- one canonical `/over-aiow` / `/en/about-aiow` entity page with legal identity, real people/roles, address, verified contact channels, service definition, boundaries and consistent `Organization`/`LocalBusiness` facts;
- the three world routes are canonical explanations with direct answers, inclusions/exclusions, process, pricing context, FAQ and human authority;
- knowledge starts with 6–8 evidence-led Dutch answer pages based on real buyer questions, each with a direct 40–60-word answer, named review/provenance, source dates and an owned next action;
- `/business.json`, sitemap, internal links, `llms.txt`, IndexNow and crawler policy are machine-readable support layers, not substitutes for useful visible content;
- Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot and user-directed retrieval are allowed on public canonicals while private, admin and legacy surfaces remain excluded;
- no guaranteed ranking or LLM citation, fake mention, generated testimonial, city doorway page, copied answer page or bulk commodity content.

### Homepage proof order

After the three worlds, the homepage proves AIOW with real owned evidence: a real or clearly labelled reference scan artifact, an operational `AI proposes / human approves / human decides` boundary, the legal entity and real people. Synthetic workflows may demonstrate capability but never masquerade as customer adoption. Real cases, outcomes, logos and testimonials appear only with evidence and permission.

## Accessibility and performance

- Exactly one H1.
- Semantic links and landmarks.
- Touch targets at least 44×44px.
- Visible keyboard focus; hover and focus parity.
- NL/EN; Day/Evening/System.
- Reduced Motion; no-JS; 200% text; 400% reflow.
- Width proof: 320, 375, 390, 768, 1024, 1440, 1920.
- No horizontal overflow.
- LCP <2.0s, CLS <0.05, INP <200ms.
- Marketing JS <100KB gzip where measurable.
- No hero image or video dependency; core visual is CSS and text.

## Anti-generic gate

- Swap test: generic AI agencies do not own the A-I-O-W spine, outlined aperture, lacquer route field, three-world wording and independently composed Evening state.
- Logo-away test: route field, typography, red/green physical palette and human authority remain recognisable without the wordmark.
- Exactly one signature moment: Route Field.
- Chanel rule: remove every effect that does not improve route choice.

## Commercial truth

No invented clients, cases, certifications, savings, rankings, outcomes or autonomous authority. Calculator output remains an indication. Dates and times are confirmed by a person. Hardware, delivery, installation and qualified partner work are separately scoped.

Company facts remain canonical: AIOW B.V. · Bijlmermeerstraat 30 · 2131 HC Hoofddorp · KvK 71887466. Active public contact and transactional sender remain `info@aiow.io`. The target public channel is `info@aiow.ai`; publication requires real external incoming delivery and human mailbox access proof. Transactional sender cutover additionally requires real outbound delivery, SPF/DKIM/DMARC authentication and provider authorization proof. The target is not an active contact; real delivery remains unverified. The requested mailbox model is licensed primary `richard@aiow.ai` and `jeroen@aiow.ai`, with shared `info@aiow.ai`; this publication correction changes no personal identity, license assignment or Raj/Darshan access. The 023 number is published only after activation and call-routing proof. Inbound implementation interest routes to Jeroen first, with Richard as the documented fallback. Private mobile numbers never become public.

## Release proof

Before preview or production:

1. tests, lint and production build;
2. exact responsive screenshots in NL/EN and Day/Evening, with every visible top-level page region inventoried and checked for the Human Industrial font, palette, square geometry and overflow contract;
3. runtime motion-state probe for pointer, focus and direct navigation;
4. reduced-motion and no-JS proof;
5. no-overflow, target size and exactly-one-H1 assertions;
6. 390px mobile and 1440px desktop visual review;
7. independent product-art and accessibility review on immutable SHA;
8. protected PR, exact-SHA deployment proof and explicit production cutover decision.

`TECHNICAL_PASS`, `MOTION_PASS`, `PRODUCT_ART_PASS`, `ACCESSIBILITY_PASS`, `PREVIEW_READY` and `LIVE_PROVEN` remain separate verdicts.

### 2026-09-06 candidate evidence

- `TECHNICAL_PASS`: 216/216 AIOW tests, lint and 89-route Next production build.
- `MOTION_PASS`: pointer and keyboard route-state parity; settled Route Field states; non-zero standard transition and zero reduced-motion transition.
- `ACCESSIBILITY_PASS`: one H1, semantic route links, minimum 44px targets, no-JS links, NL/EN and no horizontal overflow.
- `PRODUCT_ART_PASS`: reviewed at 320 light, 390 Evening, 768 light, 1440 light and settled 1440 `Wonen`; desktop auto-placement, fallback clipping and trust/route overlap blockers were fixed and re-reviewed.
- Browser receipt: `.team-handsome/AIOW-HI-MOTION-20260906/50-proof/browser-proof.json` — `views=28`, `motion=6`, `no_js=4`.
- `PREVIEW_READY`: PASS.
- `LIVE_PROVEN`: pending protected PR, production deployment and custom-domain readback.

### 2026-09-07 Route Field Cinema candidate evidence

- `TECHNICAL_PASS`: 217/217 AIOW tests, lint, whitespace gate and 89-route Next production build.
- `MOTION_PASS`: two real recorded viewport classes prove the one-shot `Werk → Pand → Wonen → Werk` commissioning sequence, pointer/keyboard/touch/wheel interruption, native-scroll continuation and settled end state.
- `MOTION_FLOOR_PASS`: route targets remain invariant; new intent retargets immediately; no timer queues or loops; fast-scroll velocity compresses pending reveals to 100–140ms.
- `ACCESSIBILITY_PASS`: original 28-view NL/EN Day/Evening matrix, six route-input states and four no-JS renders still pass; reduced motion and Save-Data skip cinema without capability loss.
- `PRODUCT_ART_PASS`: real 1440px motion recording, 390px intro strip and corrected 390px fast-scroll strip reviewed; no blank frames, clipping, overlap, opacity lag or generic AI effects remain.
- Fast-scroll receipt: 18/18 reveal targets settle on both viewport classes; 17/18 exercise velocity degradation; maximum recorded trigger position is 0.79 viewport on mobile and 0.82 on desktop.
- Candidate receipts: `.team-handsome/AIOW-ROUTE-FIELD-CINEMA-20260907/70-candidate-responsive/browser-proof.json` and `.team-handsome/AIOW-ROUTE-FIELD-CINEMA-20260907/70-candidate-motion/route-field-cinema-proof.json`.
- Candidate lab performance: LCP 128ms at 390px and 72ms at 1440px; CLS 0; zero long tasks during the 3.4-second commissioning window.
- `PREVIEW_READY`: PASS.
- `LIVE_PROVEN`: pending protected PR, production deployment and custom-domain readback.
