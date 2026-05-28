# Project Ops — Team Operating System v2

This project uses **Team Operating System v2**.

## Core rule

One Commander. One canonical repo/project root. One central status.

Commander:

- Handsome / Hermes on Mac Studio

Workers:

- Debbie / Mac Mini / OpenClaw = Support Ops only
- Book / MacBook / OpenClaw / Opus = QA only

## Directory contract

```text
ops/
  README.md
  roles/
  tasks/
    active/
    done/
    blocked/
  inbox/
    mini/
    book/
  status/
  qa/
  evidence/
  decisions/
  handoffs/
  guards/
```

## Workflow

1. Commander creates task file.
2. Worker executes only that task.
3. Worker writes report/evidence.
4. Commander processes output.
5. Book QA's where needed.
6. Commander reports to Richard.

## Forbidden

- loose duplicate truths;
- worker final status;
- Book building;
- Debbie acting as Commander;
- Handsome faking Book QA;
- PASS without evidence;
- build without canonical repo/project root;
- old art/stale direction reuse.

## Canonical status

Read `ops/status/TEAM-OPERATING-SYSTEM-V2.md` first.
