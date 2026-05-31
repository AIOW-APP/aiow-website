Task ID: <task-id>
Project: <project-name / repo path>
Created by: <Richard / Handsome / Debbie / Book / system>
Owner: Handsome / Hermes / Mac Studio
Worker: Handsome / Hermes or explicitly assigned build worker
Goal: Build or modify the specified product/code/system component without exceeding the task scope.
Context: <why this task exists; relevant decisions, constraints, links, prior reports>
Allowed actions:
- read assigned inputs
- write only within assigned scope
- create/update evidence artifacts required by this task
- report blockers clearly
- run local tests/builds
- create local screenshots/evidence
Forbidden actions:
- no deploy
- no commit unless approved
- no destructive git
- no remote DB apply
- no production secrets
- no final PASS without Book when QA gate applies
- no asset replacement unless task says so
- no production deploy unless this task explicitly says deploy
- no broad refactor outside task scope
Inputs:
- <input file/path/url/report/request>
Expected output:
- code/files changed as scoped
- tests/build/checks executed
- status report with changed paths and caveats
Acceptance criteria:
- scope is completed exactly as described in Goal and Expected output
- all required evidence artifacts exist and are linked
- forbidden actions were not performed
- blockers/caveats are documented
- tests/builds relevant to touched scope pass
- changed files are listed
- no unapproved external side effects
Evidence required:
- build output
- test/lint/typecheck logs
- before/after diff
- screenshots/video if UI changed
- route list if routes changed
Deadline/priority: <P0/P1/P2/P3 and deadline if any>
Richard needed: <yes/no + why>
Status: <pending/running/blocked/done/cancelled>
