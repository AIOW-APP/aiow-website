# AIOW Phase 2 Admin Quote Flow

Status: internal prototype spec. No live customer acceptance.

## Admin flow
1. Create lead from WhatsApp/manual intake.
2. Convert lead to draft account.
3. Build quote from template blocks.
4. Mark quote for internal review.
5. Prepare planning proposal.
6. Manually send summary only after Richard/legal-approved wording.

## Quote status model
- `draft` — editable internal quote.
- `internal_review` — needs review.
- `ready_to_send_disabled` — content complete but sending disabled.
- `sent_manual` — only after manual approval.
- `accepted_disabled` — digital acceptance intentionally disabled.

## Safety copy
Quote acceptance is disabled until auth, database, customer identity and legal wording are approved.
