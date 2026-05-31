Task ID: <task-id>
Project: <project-name / repo path>
Created by: <Richard / Handsome / Debbie / Book / system>
Owner: Handsome / Hermes / Mac Studio
Worker: Handsome / Hermes visual pipeline unless explicitly assigned
Goal: Generate, edit, or curate assets strictly within the approved visual/identity scope.
Context: <why this task exists; relevant decisions, constraints, links, prior reports>
Allowed actions:
- read assigned inputs
- write only within assigned scope
- create/update evidence artifacts required by this task
- report blockers clearly
- generate local asset variants
- post-process/crop/resize assets
- update asset manifests
Forbidden actions:
- no deploy
- no commit unless approved
- no destructive git
- no remote DB apply
- no production secrets
- no final PASS without Book when QA gate applies
- no asset replacement unless task says so
- no asset replacement unless this task explicitly says so
- no public upload/posting
- no use of unapproved likeness/voice
Inputs:
- <input file/path/url/report/request>
Expected output:
- generated asset path(s)
- asset manifest update
- preview/contact sheet if multiple assets
- usage recommendation
Acceptance criteria:
- scope is completed exactly as described in Goal and Expected output
- all required evidence artifacts exist and are linked
- forbidden actions were not performed
- blockers/caveats are documented
- final asset path exists
- asset matches approved identity/style constraints
- rejected variants are not treated as canon
Evidence required:
- generated asset path
- source/reference manifest
- preview screenshot/contact sheet
- SHA/MD5 for final assets
Deadline/priority: <P0/P1/P2/P3 and deadline if any>
Richard needed: <yes/no + why>
Status: <pending/running/blocked/done/cancelled>
