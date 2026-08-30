# AIOW — Warm Precision 2.0

## Scope and authority

This file governs the public AIOW V1 surface at `aiow.ai`. It preserves the existing portal, scan, venture and admin surfaces. The approved source is `docs/design/aiow-v1-warm-precision-canon.md` and Richard's approved Warm Precision v2 prototype.

## Product intent

- **Audience:** Dutch owners and operators evaluating practical AI for a company, office or home.
- **Primary task:** get a transparent, honest price indication and book a scan.
- **Platform:** responsive public web, mobile-first.
- **Courage:** 3/5 — restrained editorial confidence, with the calculator as the signature object.
- **Emotional core:** calm, exact, materially credible.

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

The hero is a split editorial field whose dominant working object is the calculator—not a screenshot or decorative scene. Warm Precision 2.0 frames that object with an **Operational Field**: an architectural coordinate grid, engraved arcs, measured signal paths and sparse copper nodes. The field is semantic only as a visual signature, remains `aria-hidden`, never competes with content and compresses to a quiet cropped instrument plate on mobile.

Surfaces follow a paper / steel / instrument hierarchy:

- solid drafting-paper or graphite fields carry all body copy;
- steel rails, fine engraved rules and offset section indices create structure;
- the calculator is the one elevated instrument, with layered material shadows and a precise top plate;
- the desktop header is the only glass layer: a floating instrument rail with a deliberate opaque fallback;
- statement sections become dark technical scenes with measured grids, rails and asymmetry rather than empty colour bands;
- solutions use route rails with route-specific line glyphs, not repeated generic icon cards;
- pricing links remain a complete crawlable set but become a dense reference deck: grouped on desktop and horizontally scrollable with snap, overflow affordance and keyboard access on narrow screens;
- approach uses one architectural three-stage rail, horizontal on wide screens and vertical on mobile;
- the final CTA is a contained closing instrument scene, not another blank beige band.

Corners remain restrained and nested rather than pill-heavy. Shadows are broad, warm and material; borders remain hairline and engraved. No body-card glass, blobs, glow, robots, fake evidence, dashboard metrics or repeated glass-card soup.

## Theme grammar

Light, Dark and System are equal design modes. Light uses drafting paper as the dominant field with graphite instruments; Dark uses architectural steel with warm paper text and retains depth through border/value separation rather than glow. Copper remains the sole accent in both. `color-mix()` may refine edges and shadows only behind a safe opaque fallback. Theme changes must not alter hierarchy, target size or content.

## Signature and motion

**Signature:** deterministic live price instrument inside the Operational Field. It changes model and output in place, keeps the input/output anchors stable, uses tabular numbers, and explains exclusions beside the result. Price changes may settle with a short directional transition; reduced motion snaps immediately. The complete task works without animation.

The Operational Field has one calm physical character: a slow deterministic drafting/signal sweep and sparse node pulse. Entrance and hover motion only clarify hierarchy and route affordance; nothing scroll-jacks, chases the pointer or implies backend activity. `prefers-reduced-motion: reduce` disables ambient, entrance and smooth scrolling and preserves the complete static technical composition.

Navigation may use one translucent layer over content with a solid fallback. The booking dialog is a solid overlay. Body copy never sits on glass. Maximum glass layers: one.

## State design

- Calculator output is always explicit and labelled as an indication.
- Booking is a preferred scan request pending human confirmation, not a claim that calendar capacity has already been reserved.
- Booking errors explain correction; pending state says the request is being checked; success appears only after durable lead and transactional-outbox acceptance.
- Missing booking, quote, mail or storage configuration fails closed and never simulates confirmation.
- Commercial follow-up state is server-authoritative. Read mail, browser state and analytics events never mark a lead handled.

## Conversion and evidence law

- The calculator remains the single signature object. Conversion improvements extend its decision clarity; they do not add a second hero, floating sales widget or repeated card system.
- The scan CTA promises a bounded decision artifact: workflow or space, dependencies, human checkpoints, route recommendation and explicit build / prepare / do-not-automate advice.
- Context pages use one context-specific intake prompt while preserving the same booking flow and pricing authority.
- Evidence is labelled as `reference architecture`, `internal demonstration`, `pilot` or `customer case`. A customer case, testimonial, saving or outcome is forbidden without recorded evidence and publication approval.
- Knowledge pages live outside the homepage and use dated sources, visible boundaries and a restrained route back to the scan.
- Experiments may test copy or ordering only. They never alter price, exclusions, availability, privacy, security or provider truth.
- The private operations queue is not part of the public information architecture and must never render customer PII on `aiow.ai`.

## Copy law

Direct, calm, specific. No invented clients, reviews, addresses, awards, rankings, outcomes or savings. Hardware/installation and cloud/AI use are excluded. Home physical delivery is partner-dependent.

## Responsive and accessibility law

Designed at 320, 390, 768 and 1440px. Controls are at least 44px, inputs remain 16px on mobile, focus is visible, tabs and dialog are keyboard-operable, there is no horizontal overflow, and `prefers-reduced-motion` removes non-essential transitions.

## Anti-generic gate

The logo-away identity is the warm drafting-paper/graphite/copper instrument language and the calculator as the first useful object. A competitor name cannot be swapped in without contradicting AIOW's exact published tiers, exclusions and Solutions/Ventures split. No centered generic AI hero, neon gradient, robot, fake metric or repeated glass-card grid is allowed.
