# AIOW Spunky Mac Mini webhook

Status: live as of 2026-06-25.

## Purpose

AIOW.ai `/api/spunky/chat` now routes production chat replies to Spunky on the Mac Mini instead of using the local bounded fallback.

Live acceptance check:

```text
POST https://aiow.ai/api/spunky/chat
source = spunky-webhook
handoff.phase = anonymous | account | signed
```

## Mac Mini service

Host alias:

```text
mini
```

Service files on the Mac Mini:

```text
~/spunky-webhook/spunky_webhook.py
~/Library/LaunchAgents/com.aiow.spunky-webhook.plist
~/.spunky-webhook/token
~/.spunky-webhook/logs/requests.jsonl
~/.spunky-webhook/logs/launchd.out.log
~/.spunky-webhook/logs/launchd.err.log
~/.spunky-webhook/public_url
~/.spunky-webhook/logs/cloudflared.log
```

Local service:

```text
http://127.0.0.1:8765/health
http://127.0.0.1:8765/chat
```

The `/chat` route requires bearer auth with the token stored at `~/.spunky-webhook/token`.

## Production Vercel env

```text
SPUNKY_CHAT_WEBHOOK_URL = <cloudflared-url>/chat
SPUNKY_CHAT_WEBHOOK_TOKEN = encrypted
```

Do not print the token.

## Phase policy

### anonymous, first website contact

Spunky may:

- greet warmly as AIOW AI Venture Partner;
- ask one sharp follow-up question;
- build first Venture Memory;
- name opportunity, risk, missing proof and next step;
- ask for name/e-mail only after value has been delivered.

Spunky must not:

- promise production work, legal conclusions, pricing or a final deal;
- pretend the visitor already has an account or signed agreement;
- ask for unnecessary sensitive data;
- send e-mail or confirm appointments.

### account, account created

Spunky may:

- refer to existing Venture Memory;
- collect missing proof;
- prepare Deal Card for Team AIOW review;
- ask for documents, website, target group, budget and timeline;
- suggest workspace next steps.

Spunky must not:

- accept collaboration without Team AIOW;
- finalize contract terms;
- present payment, equity or revenue share as agreed.

### signed, proposal or appointment signed

Spunky may:

- use project context for execution prep;
- create build-ready briefings for Strategy, UX, Dev, Automation and Growth agents;
- identify blockers, risks and required input;
- prepare sprint plan and team handoff.

Spunky must not:

- expand scope beyond signed agreement;
- make legal, financial or public claims independently;
- promise production deploys or external actions without human review.

## Smoke commands

Live source check:

```bash
python3 - <<'PY'
import json, urllib.request
payload=json.dumps({'message':'Hey','visitorMessageCount':1,'sessionId':'smoke','relationshipStage':'anonymous'}).encode()
req=urllib.request.Request('https://aiow.ai/api/spunky/chat', data=payload, headers={'content-type':'application/json'})
with urllib.request.urlopen(req, timeout=170) as r:
    d=json.loads(r.read().decode())
print(d.get('source'), d.get('handoff'))
print(d.get('reply'))
PY
```

Expected:

```text
source spunky-webhook
handoff.phase anonymous
```

Mac Mini health:

```bash
ssh mini 'curl -sS http://127.0.0.1:8765/health | jq .'
```

Tunnel health:

```bash
ssh mini 'cat ~/.spunky-webhook/public_url; tail -20 ~/.spunky-webhook/logs/cloudflared.log'
```

## Current limitation

The current tunnel is a Cloudflare quick tunnel. It is public and working, but the URL can change after tunnel restart or Mac reboot. If that happens, update Vercel env `SPUNKY_CHAT_WEBHOOK_URL` to the new URL plus `/chat` and redeploy.

Permanent fix: create a named Cloudflare tunnel on an AIOW domain, for example:

```text
spunky.aiow.ai/chat
```

That requires Cloudflare account/domain login on the Mac Mini.
