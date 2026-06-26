# AIOW Spunky Mac Mini webhook

## Purpose

AIOW.ai uses a real Spunky agent bridge on the Mac Mini instead of local fallback replies.

The production path is:

```text
AIOW.ai /api/spunky/chat
→ SPUNKY_CHAT_WEBHOOK_URL
→ https://spunky.aiow.ai/chat
→ Cloudflare named tunnel
→ Mac Mini 127.0.0.1:8765/chat
→ Hermes/Spunky brain
```

## Public endpoints

```text
https://spunky.aiow.ai/health
https://spunky.aiow.ai/chat
```

`/health` is public and returns service readiness.

`/chat` requires bearer auth via `SPUNKY_CHAT_WEBHOOK_TOKEN` in Vercel and the matching `SPUNKY_WEBHOOK_TOKEN` on the Mac Mini LaunchAgent.

Never print or commit the token.

## Mac Mini files

```text
~/spunky-webhook/spunky_webhook.py
~/spunky-webhook/spunky-aiow.yml
~/.cloudflared/<tunnel-id>.json
~/Library/LaunchAgents/com.aiow.spunky-webhook.plist
~/Library/LaunchAgents/com.aiow.spunky-cloudflared.plist
```

## Services

Spunky webhook:

```text
com.aiow.spunky-webhook
```

Cloudflare named tunnel:

```text
com.aiow.spunky-cloudflared
```

The old quick tunnel was intentionally stopped. Production must not depend on `trycloudflare.com`.

## Cloudflare

DNS:

```text
spunky.aiow.ai CNAME <tunnel-id>.cfargotunnel.com proxied=true
```

Tunnel name:

```text
aiow-spunky-mac-mini
```

## Vercel production env

```text
SPUNKY_CHAT_WEBHOOK_URL=https://spunky.aiow.ai/chat
SPUNKY_CHAT_WEBHOOK_TOKEN=<secret>
```

After changing env vars, redeploy production. Existing deployments keep old env values.

## Relationship stages

AIOW forwards `relationshipStage` to Spunky. Accepted normalized values:

```text
anonymous
account
signed
```

Expected live smoke:

```text
anonymous → source spunky-webhook, handoff.phase anonymous
account   → source spunky-webhook, handoff.phase account
signed    → source spunky-webhook, handoff.phase signed
```

## Verification commands

Health:

```bash
curl -fsS https://spunky.aiow.ai/health
```

AIOW live API smoke:

```bash
python3 - <<'PY'
import json, urllib.request
for stage in ['anonymous','account','signed']:
    body=json.dumps({'message':'Stage smoke','relationshipStage':stage}).encode()
    req=urllib.request.Request('https://aiow.ai/api/spunky/chat', data=body, method='POST', headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        out=json.loads(r.read().decode())
    print(stage, out.get('source'), (out.get('handoff') or {}).get('phase'))
PY
```

## Watchdog

Cron job:

```text
AIOW Spunky webhook watchdog
```

Script:

```text
~/.hermes/scripts/aiow_spunky_watchdog.py
```

It should stay silent when healthy and alert only when:

- named tunnel health fails
- AIOW falls back to `bounded-aiow-fallback`
- any relationship stage is not forwarded correctly

## Current production proof

Last verified on 2026-06-26:

```text
https://spunky.aiow.ai/health = 200
https://aiow.ai/api/spunky/chat source = spunky-webhook
anonymous/account/signed phase forwarding = ok
```
