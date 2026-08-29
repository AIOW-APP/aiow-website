# AIOW — Warm Precision

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

## Composition

The hero is a split editorial field whose dominant working object is the calculator—not a screenshot or decorative scene. Sections use solid surfaces, fine rules, measured asymmetry and restrained radii. Solutions and Ventures are visibly separate systems.

## Signature and motion

**Signature:** deterministic live price instrument. It changes model and output in place, keeps the input/output anchors stable, uses tabular numbers, and explains exclusions beside the result. Price changes may settle with a short directional transition; reduced motion snaps immediately. The complete task works without animation.

Navigation may use one translucent layer over content with a solid fallback. The booking dialog is a solid overlay. Body copy never sits on glass. Maximum glass layers: one.

## State design

- Calculator output is always explicit and labelled as an indication.
- Booking errors explain correction; pending state says the request is being checked; success appears only after upstream 2xx and offers a locally generated calendar file.
- Missing booking configuration fails closed and never simulates confirmation.

## Copy law

Direct, calm, specific. No invented clients, reviews, addresses, awards, rankings, outcomes or savings. Hardware/installation and cloud/AI use are excluded. Home physical delivery is partner-dependent.

## Responsive and accessibility law

Designed at 320, 390, 768 and 1440px. Controls are at least 44px, inputs remain 16px on mobile, focus is visible, tabs and dialog are keyboard-operable, there is no horizontal overflow, and `prefers-reduced-motion` removes non-essential transitions.

## Anti-generic gate

The logo-away identity is the warm drafting-paper/graphite/copper instrument language and the calculator as the first useful object. A competitor name cannot be swapped in without contradicting AIOW's exact published tiers, exclusions and Solutions/Ventures split. No centered generic AI hero, neon gradient, robot, fake metric or repeated glass-card grid is allowed.
