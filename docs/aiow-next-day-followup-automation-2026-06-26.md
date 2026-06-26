# AIOW next-day follow-up automation

Status: live endpoint and scheduler created on 2026-06-26.

## Production endpoint

`/api/cron/aiow-followups`

Auth:

- `Authorization: Bearer $AIOW_CRON_SECRET`
- secret stored in Vercel production env and locally at `~/.hermes/credentials/aiow-cron.env`

Behavior:

1. Selects pending `aiow_email_jobs` where `scheduled_for <= now()`.
2. Loads lead and consent.
3. Skips if consent is missing or revoked.
4. If `dryRun=true`, returns preview without state changes.
5. If `RESEND_API_KEY` is missing, returns 503 and leaves jobs pending.
6. If Resend succeeds:
   - inserts `aiow_email_sends`
   - marks job `sent`
   - marks lead `followed_up`
   - appends `followup_email_sent` to `aiow_lead_events`
7. If Resend fails:
   - increments attempts
   - writes `aiow_email_sends` with status `failed`
   - appends `followup_email_failed`
   - keeps pending until 3 attempts, then marks failed

## Scheduler

Hermes cron job:

- name: `AIOW next-day follow-up processor`
- job id: `eaf9f0311236`
- schedule: `30 9 * * *`
- script: `~/.hermes/scripts/aiow_followups_cron.py`

The script stays silent when there is nothing to process. It reports sent/skipped/failed jobs and alerts if due jobs exist but sending is blocked.

## Current blocker

`RESEND_API_KEY` is not set in Vercel production. The queue and processor are live, but real e-mail sending intentionally does not run until the key is added.

## Verified

- build passed
- unauthorized endpoint returns 401
- live Spunky lead creates Supabase lead and pending e-mail job
- dry-run returns due job preview
- real run returns safe 503 when Resend is missing
- test job was cleaned up as skipped
