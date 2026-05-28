Task ID: <task-id>
Project: <project-name / repo path>
Created by: <Richard / Handsome / Debbie / Book / system>
Owner: Handsome / Hermes / Mac Studio
Worker: Handsome / Hermes media pipeline unless explicitly assigned
Goal: Create or review motion/video output for the specified scene, asset, or product moment.
Context: <why this task exists; relevant decisions, constraints, links, prior reports>
Allowed actions:
- read assigned inputs
- write only within assigned scope
- create/update evidence artifacts required by this task
- report blockers clearly
- generate local motion variants
- create previews/contact sheets
- transcode/compress for review
Forbidden actions:
- no deploy
- no commit unless approved
- no destructive git
- no remote DB apply
- no production secrets
- no final PASS without Book when QA gate applies
- no asset replacement unless task says so
- no public posting
- no unapproved voice/face use
- no replacing canonical visual assets unless task says so
Inputs:
- <input file/path/url/report/request>
Expected output:
- motion/video file path
- prompt/settings/provenance
- preview frames or contact sheet
- recommendation/caveats
Acceptance criteria:
- scope is completed exactly as described in Goal and Expected output
- all required evidence artifacts exist and are linked
- forbidden actions were not performed
- blockers/caveats are documented
- motion communicates the intended product/brand idea
- preview is playable
- provenance/settings are recorded
Evidence required:
- video preview
- key frames/contact sheet
- generation settings/provenance
- file hash
- visual QA notes
Deadline/priority: <P0/P1/P2/P3 and deadline if any>
Richard needed: <yes/no + why>
Status: <pending/running/blocked/done/cancelled>
