# 🧠 Book — OneTap Day readiness gate (product/taste/red-team)

TASK: OneTap "klaar voor gebruik" review
VERDICT: PARTIAL — engine + safety zijn echt en goed; product-belofte en prod-levering zijn nog niet dicht.
STATUS: PARTIAL (usable als gecontroleerde early-access intake/value-test op persistente host; NIET af voor PUBLIC deploy)

## Wat PASS is (verifieerbaar)
- Durable local fallback echt: lib/onetap-capture.ts schrijft JSONL; intake + founding-interest returnen 200 LOCAL_CAPTURED zonder RESEND. Geen hard 500 meer.
- Guard live: ONETAP_READY_FOR_USE_GUARD=PASS (exit 0), npm build PASS, API+browser smoke kloppen met geclaimde receipt-ids.
- Geen fake revenue: paymentState=PAUSED_PROVIDER_OFF, geen checkout/abonnement/store/calendar/voice, geen zichtbare europrijs. Interest-test expliciet "no live checkout / no payment collected". Criterium 2 = PASS.

## Harde blockers vóór PUBLIC (criterium 1, 3, 4)
1. BELOFTE-GAT (taste, hoog): headline belooft "Stuur je dag. Krijg een bruikbaar plan terug." maar de flow levert alleen een receipt-id + "je aanvraag staat in de queue". Geen SLA, geen leverkanaal, geen automatische plan-generatie. User verwacht output, krijgt wachtrij. FIX: of concrete leverbelofte ("je plan binnen X werkdagen via email") + mens die levert, of headline verzachten zodat hij matcht met realiteit.
2. JARGON-LEK (governance theatre, criterium 3 FAIL): user-facing copy toont interne gate-metrics: "interest_intent_rate", "Soft gate: >=25% bij N>=30 binnen 14-21 dagen", "Hard gate later: paid_rate". Dat hoort in team-email/JSONL, niet op de prospectpagina. Strip van de surface.
3. PROD-LEVERING: in geteste env ontbreekt RESEND_API_KEY -> alles LOCAL_CAPTURED naar serverfilesystem. Op serverless/edge (bv Vercel) is dat filesystem niet-duurzaam -> stille dataloss van echte aanvragen. FIX: bevestig RESEND in prod OF een persistente sink (DB/queue) vóór public.
4. PRIVACY-CLAIMS: intake claimt 30-dagen-retentie + verwijdercyclus + "human-reviewed, AI-assisted within data boundary". Pagina lijst zelf "Geen privacy/security claim zonder approval" als constraint. Die claims moeten door Richard bevestigd + echt nagekomen worden vóór public.

## Bottom line
Niet "af" voor publiek. Voor interne/gecontroleerde early-access test is de intake bruikbaar en veilig. Sluit blocker 1+2 (snel, copy) en 3+4 (prod/approval) en het is PUBLIC-ready.

-- 🧠 Book, $(date -u +%Y-%m-%dT%H:%M:%SZ)
