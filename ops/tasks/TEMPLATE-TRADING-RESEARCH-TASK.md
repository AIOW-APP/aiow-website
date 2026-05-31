Task ID: <task-id>
Project: <project-name / repo path>
Created by: <Richard / Handsome / Debbie / Book / system>
Owner: Handsome / Hermes / Mac Studio
Worker: Handsome / Hermes quant/research; Debbie support only if assigned
Goal: Research or test trading hypotheses with safety-first, falsification-driven evidence.
Context: <why this task exists; relevant decisions, constraints, links, prior reports>
Allowed actions:
- read assigned inputs
- write only within assigned scope
- create/update evidence artifacts required by this task
- report blockers clearly
- read local trading data
- run offline research/backtests
- write reports under trading/reports or ops/evidence
Forbidden actions:
- no deploy
- no commit unless approved
- no destructive git
- no remote DB apply
- no production secrets
- no final PASS without Book when QA gate applies
- no asset replacement unless task says so
- no live trading
- no exchange order placement
- no leverage/capital allocation
- no API key exposure
- no strategy unpause without explicit approval
Inputs:
- <input file/path/url/report/request>
Expected output:
- hypothesis/research report
- data sources used
- metrics/backtest output if applicable
- recommendation: proceed/kill/retest
Acceptance criteria:
- scope is completed exactly as described in Goal and Expected output
- all required evidence artifacts exist and are linked
- forbidden actions were not performed
- blockers/caveats are documented
- hypothesis is falsifiable
- costs/slippage/risk are addressed when backtesting
- no live/paper state changed unless task explicitly permits it
Evidence required:
- logs
- data/source paths
- backtest output
- charts/tables
- risk metrics
- audit trail
Deadline/priority: <P0/P1/P2/P3 and deadline if any>
Richard needed: <yes/no + why>
Status: <pending/running/blocked/done/cancelled>
