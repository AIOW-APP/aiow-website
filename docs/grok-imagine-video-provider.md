# Grok Imagine Video provider adapter

Status: implemented as the default image-to-video provider contract, with Kling retained as fallback.

## Decision
- Default provider: `grok`
- Fallback provider: `kling`
- Model: `grok-imagine-video`
- xAI price basis used for estimates: `$0.05/sec`
- Secrets: `XAI_API_KEY` is read only from environment and errors are redacted before returning/logging.

## Flow
1. Content brief can set `videoProvider?: "grok" | "kling"`.
2. `core/media/video-provider.ts` validates the image URL and prompt.
3. Grok request posts to the xAI image-to-video endpoint using `grok-imagine-video`.
4. If Grok fails and fallback is enabled, the adapter returns the Kling fallback contract instead of exposing raw provider errors.
5. Result metadata includes provider, model, duration, estimated cost, latency, fallback marker, and sanitized failure reason.

## Current limitation
The repo previously used Kling mainly as generated/static asset provenance, not a fully wired API client. So Kling remains the explicit fallback contract until its API credentials/endpoint are wired in this repo.

## Guard
Run:

```bash
npm run guard:grok-video
```

This verifies:
- Grok/Kling provider union exists.
- Grok is default.
- xAI/Grok image-to-video model path exists.
- `XAI_API_KEY` is env-only.
- Kling fallback exists.
- error redaction exists.
- cost/latency/failure metadata exists.
