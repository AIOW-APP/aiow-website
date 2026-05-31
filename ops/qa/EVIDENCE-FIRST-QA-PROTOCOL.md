# Evidence-First QA Protocol

Status: ACTIVE
Date: 2026-05-17 18:43 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-184147-52fabb

## Goal

Nooit meer “het is klaar” zonder bewijs.

A build, visual guard, or Commander statement may prove progress, but it does not prove product acceptance. Product acceptance requires an evidence path and, where product/visual/UX acceptance matters, Book QA.

## Hard rules

1. **Build PASS is geen Product PASS.** A passing build only means the code compiled or tests passed for the tested scope.
2. **Visual guard PASS is geen Book PASS.** Automated visual guards are evidence, not acceptance.
3. **Commander claim is geen QA.** Handsome/Hermes can summarize and decide next owner, but cannot pretend that claim is independent QA.
4. **Book QA is leidend voor product acceptance.** For product, visual, UX, app, website, motion, and asset acceptance, Book's official QA gate is the leading acceptance input unless Richard explicitly overrides.
5. **Screenshots/logs/checksums zijn verplicht.** Every evidence drop needs screenshots when visual/UI changes exist, logs for checks/builds/tests, and checksums for evidence integrity.
6. **Before/after moet zichtbaar én via MD5/SHA verschillen.** If a task claims a before/after visual change, both human-visible difference and file hash difference must be proven.
7. **Dark/light screenshots mogen nooit byte-identiek zijn.** If dark and light modes are claimed, their screenshots must differ by hash.
8. **Light mode moet visueel lichter zijn, niet alleen label.** A light-mode label without visible lighter luminance is a fail.
9. **Old/rejected art mag nooit renderen.** Previously rejected assets/art direction must be quarantined and excluded from rendered routes/builds.
10. **Geen final status zonder evidence path.** Final status must include at least one path under `ops/evidence/`, `ops/qa/`, build/test log path, or explicit Richard approval reference.

## Definitions

- **Build PASS:** tests/build/lint/typecheck/compile succeeded for a specific command and environment.
- **Visual guard PASS:** automated visual/runtime checks did not find known blocker classes.
- **Book PASS:** Book reviewed the specified evidence and issued a QA report with `State: PASS`.
- **Product PASS:** Commander reports product acceptance after processing evidence and Book QA, or Richard explicitly overrides the gate.
- **Evidence drop:** a self-contained folder or archive containing task file, manifest, screenshots/media, logs, checksums, and change summary.

## Commander rule

Handsome/Hermes may report:

- **Build green**
- **Evidence ready**
- **Ready for Book**
- **Book PASS/PARTIAL/FAIL received**
- **Product PASS after Book PASS**

Handsome/Hermes may not report:

- **Final/Product PASS** without evidence path
- **Book PASS** without an actual Book QA artifact
- **Visual approved** based only on local guard output

## Evidence required by task class

### Code/build

- task file
- changed files / diff summary
- test/lint/typecheck/build logs
- runtime smoke logs when relevant
- evidence manifest

### UI/visual/web/app

- task file
- before screenshot
- after screenshot
- dark screenshot when dark mode exists
- light screenshot when light mode exists
- MD5/SHA report
- console/browser logs when relevant
- route list when routes changed
- Book QA report for product acceptance

### Assets/art/identity

- task file
- source/reference manifest
- generated asset paths
- final asset hashes
- rejected asset list/quarantine note when applicable
- preview/contact sheet
- Richard approval when using Richard face/voice publicly

### Motion/video

- task file
- video preview
- keyframe/contact sheet
- generation settings/provenance
- MD5/SHA report
- motion QA notes

### Trading/research

- task file
- data/source paths
- logs/notebooks/scripts
- backtest/report outputs
- cost/slippage/risk assumptions
- no-live-trading confirmation unless explicitly authorized

## Evidence integrity rules

- Use SHA256 for archives/bundles.
- Use MD5 or SHA256 for screenshots/media comparisons.
- Before/after screenshots must differ by hash if change is claimed.
- Dark/light screenshots must differ by hash.
- If two screenshots are byte-identical where they should differ, mark QA **FAIL** or **BLOCKED**.
- Visual difference must also be human-visible; hash-only differences from metadata/compression are not enough.

## Evidence drop required files

Each evidence drop should contain:

```text
MANIFEST.md
TASK.md or task file copy
WHAT-CHANGED-SINCE-PREVIOUS-QA.md
checksums.md or checksums.sha256
logs/
screenshots/
```

Optional but recommended:

```text
videos/
assets/
routes.txt
console.log
network.log
before-after-contact-sheet.png
```

## Final-status template

Every final status must include:

```text
State: BUILD-GREEN / READY-FOR-BOOK / BOOK-PASS / BOOK-PARTIAL / BOOK-FAIL / PRODUCT-PASS / BLOCKED
Task ID:
Evidence path:
QA path:
Book state:
Checks run:
Top blockers:
Next owner:
Richard needed:
```


## Top 1% Delivery Loop

This gate is part of `ops/decisions/TOP-1-PRODUCT-DELIVERY-LOOP.md`: Understand → Research → Decide → Prototype → Build → Evidence → QA → Iterate → Report. Every project round ends with `🧭 COMMANDER CENTRAL STATUS`.
