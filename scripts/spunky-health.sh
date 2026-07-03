#!/usr/bin/env bash
set -euo pipefail
HOST="${1:-spunky}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=5)

ssh "${SSH_OPTS[@]}" "$HOST" 'set -e
printf "host="; hostname
printf "user="; whoami
printf "date="; date -u +%Y-%m-%dT%H:%M:%SZ
printf "hermes="; ~/.local/bin/hermes --version 2>&1 | head -1 || true
printf "gateway="; launchctl print gui/$(id -u)/ai.hermes.gateway 2>/dev/null | awk "/PID|LastExitStatus|Program/ {print}" | tr "\n" " " || true; echo
printf "bridge_plist="; ls ~/Library/LaunchAgents/ai.teamrichard.bridge.spunky.plist 2>/dev/null || true
printf "aiow_processes=\n"; ps -axo pid,ppid,%cpu,%mem,etime,command | grep -Ei "[h]ermes|[g]ateway|[s]punky|[a]iow|[d]oorz" | head -25
'
