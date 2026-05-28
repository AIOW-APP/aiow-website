Task ID: <task-id>
Project: <project-name / repo path>
Created by: <Richard / Handsome / Debbie / Book / system>
Owner: Handsome / Hermes / Mac Studio
Worker: Book / MacBook / QA-only
Goal: Independently verify the assigned build/evidence and return a PASS/PARTIAL/FAIL recommendation.
Context: <why this task exists; relevant decisions, constraints, links, prior reports>
Allowed actions:
- read assigned inputs
- write only within assigned scope
- create/update evidence artifacts required by this task
- report blockers clearly
- inspect screenshots/build/evidence
- run read-only browser/QA checks
- write QA report to ops/qa or ops/inbox/book
Forbidden actions:
- no deploy
- no commit unless approved
- no destructive git
- no remote DB apply
- no production secrets
- no final PASS without Book when QA gate applies
- no asset replacement unless task says so
- no code fixes
- no product/art changes
- no final Commander status
- no deploy
Inputs:
- <input file/path/url/report/request>
Expected output:
- QA report
- blockers with reproduction/evidence
- confidence level
- reviewed evidence list
Acceptance criteria:
- scope is completed exactly as described in Goal and Expected output
- all required evidence artifacts exist and are linked
- forbidden actions were not performed
- blockers/caveats are documented
- QA report states PASS/PARTIAL/FAIL recommendation
- every blocker has evidence/repro
- evidence reviewed is explicitly listed
Evidence required:
- screenshots
- QA report
- console/build logs reviewed
- before/after comparison
- hashes/SHA/MD5 if evidence bundles are used
Deadline/priority: <P0/P1/P2/P3 and deadline if any>
Richard needed: <yes/no + why>
Status: <pending/running/blocked/done/cancelled>
