# Evidence Drops

Status: ACTIVE
Date: 2026-05-17 18:43 CEST
Owner: Handsome / Hermes / Mac Studio
Task: td-20260517-184147-52fabb

## Purpose

This directory stores proof. No project should be called done, accepted, or ready for final status without an evidence path.

## Required evidence-drop format

Every evidence drop should be a folder or archive containing:

```text
MANIFEST.md
TASK.md or copied task contract
WHAT-CHANGED-SINCE-PREVIOUS-QA.md
checksums.md or checksums.sha256
logs/
screenshots/
```

Recommended optional folders/files:

```text
videos/
assets/
routes.txt
console.log
network.log
before-after-contact-sheet.png
qa-request.md
```

## MANIFEST.md must include

```text
Task ID:
Project:
Owner:
Worker:
Created:
Evidence bundle path:
What changed:
Commands/checks run:
Screenshots:
Logs:
Checksums:
Known caveats:
Book QA requested: yes/no
Richard needed: yes/no
```

## Checksums

Use SHA256 for evidence bundles/archives. Use MD5 or SHA256 for image/video comparison reports.

Example:

```bash
find screenshots logs -type f -print0 | sort -z | xargs -0 shasum -a 256 > checksums.sha256
md5 screenshots/before.png screenshots/after.png > image-md5.txt
```

## Before/after rule

If a change is claimed:

- before screenshot required where possible;
- after screenshot required;
- before/after files must differ by hash;
- the visual difference must be human-visible, not metadata-only.

## Dark/light rule

If dark/light modes are claimed:

- dark screenshot required;
- light screenshot required;
- screenshots must differ by hash;
- light mode must visibly be lighter.

## Old/rejected art rule

Evidence must prove old/rejected art is not rendering when the task touches visuals/assets.

Use:

- screenshot review;
- route scan;
- asset manifest;
- rejected asset quarantine note;
- grep/search for stale asset references when applicable.

## Book QA handoff

A Book QA-ready evidence drop must include:

- `MANIFEST.md`
- task file
- screenshots
- logs
- MD5/SHA report
- `WHAT-CHANGED-SINCE-PREVIOUS-QA.md`

Book returns a report using `ops/qa/BOOK-RED-TEAM-GATE.md` format.

## Runtime checker

Use the central checker:

```bash
cd /Users/handsomebastard/debbie
scripts/evidence_drop_check.py /path/to/evidence/drop
```

The checker verifies required files/folders exist and flags missing core evidence.
