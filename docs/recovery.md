# AIOW Website — Recovery Guide

Purpose: restore local development/build/deploy context without relying on chat history.

## Local restore

```bash
cd ~/projects/aiow-website
npm install
npm run dev
```

## Build verification

```bash
npm run build
npm run lint
```

## Git / source

- Local repo: `~/projects/aiow-website`
- Remote: `https://github.com/Squirrel-Richard/aiow-website.git`
- Current warning: working tree has many uncommitted modifications/untracked files. Review before deploy, reset, archive, or cleanup.

## Existing operating system

This project already uses Team Operating System v2 under `ops/`:

- `ops/README.md`
- `ops/status/TEAM-OPERATING-SYSTEM-V2.md`
- `ops/evidence/`
- `ops/qa/`
- `ops/decisions/`

Do not create a second ops process; update `ops/` or this capsule if recovery/status needs improving.

## Required external services

- GitHub
- Deployment provider, likely Vercel or equivalent, verify before deploying
- Any email/database/AI integrations via secure env vars, not plaintext docs

## Recovery path after internet returns

1. Confirm local build works.
2. Confirm desired git state.
3. Verify deployment target and env vars.
4. Deploy only after approval if public surface materially changes.
5. Capture proof URL/screenshot and update `STATUS.md`.
