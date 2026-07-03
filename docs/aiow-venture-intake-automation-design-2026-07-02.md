# AIOW Venture Intake Automation — ontwerp

Datum: 2026-07-02
Auteur: Claude/Fable (judgement-lane)
Opdracht Richard: ideeën automatisch beoordelen op slagingskans; bij hoge score automatisch een contractvoorstel (omzetpercentage + zelfde percentage bij verkoop); daarna automatisch een Telegram-klantgroep met Spunky (Mac mini), klant, Richard en Jeroen; plus een interne AIOW-groep waar het team de laatste klantinfo kan opvragen. Uitvoering: Hermes/OpenClaw. Handsome heeft alle logins/info.

## 1. Wat er al ligt (hergebruiken, niet opnieuw bouwen)

- `app/intake/` + `app/api/spunky/chat/route.ts` — Spunky-intake bestaat maar is **regelgebaseerd** (keyword-modes + canned antwoorden + optionele webhook). Geen echte beoordeling.
- `app/api/leads/route.ts` — leads gaan via Resend-mail.
- `app/api/contracts/sign/route.ts` — er is al een sign-endpoint met guardrails ("wijzig geen deal/contract/prijs zelfstandig").
- Spunky draait als Telegram-agent (Team AIOW hub, Mac mini) — zie Intern (AIOW)-chat.

## 2. AIOW Venture Score (AVS) v1 — hoe we slagingskans beoordelen

Score 0–100, gewogen over 7 dimensies. Elke deelscore MOET bewijs noemen; zelfrapportage van de aanvrager telt alleen als "claim" totdat de research-pass het bevestigt.

| # | Dimensie | Gewicht | Kernvragen |
|---|---|---:|---|
| 1 | Founder | 25% | domeinkennis, track record, fulltime commitment, uitvoeringssnelheid, coachbaarheid |
| 2 | Markt | 20% | omvang + groei, bereikbare niche, betalingsbereidheid, NL/EU-instap |
| 3 | Probleem/oplossing | 15% | pijn-ernst en -frequentie, huidige alternatieven, waarom nu |
| 4 | AI-hefboom | 15% | geeft AI structureel voordeel (kosten/snelheid/kwaliteit), datamoat mogelijk |
| 5 | Tractie/bewijs | 10% | omzet, gebruikers, LOI's, wachtlijst, pilots |
| 6 | Bouwbaarheid door AIOW | 10% | past op onze stack, effort in weken, hergebruik AIOW-assets |
| 7 | Dealkwaliteit | 5% | rev-share-acceptatie, schone cap table, realistische exit-route |

Beoordelingsproces per aanvraag (LLM-pipeline, niet één prompt):

1. **Intake-parse**: gestructureerd dossier uit intakeformulier + gesprek met Spunky.
2. **Research-pass**: websearch op markt, concurrenten, founder (LinkedIn/KvK), vergelijkbare producten. Bevindingen bij het dossier.
3. **Score-pass**: per dimensie score + bewijsregels + onzekerheid (laag/mid/hoog).
4. **Red-team-pass**: aparte prompt genereert de sterkste bear case; scores worden daarna bijgesteld.
5. **Verdict**: AVS-totaal + advies in vast format (VERDICT/CONTEXT/RECOMMENDATION/RISKS/PROOF).

Drempels (start conservatief, herijken na 20 cases):

- **< 50** — afwijzen met nette feedback (automatisch, geen Richard-tijd).
- **50–69** — parkeren + upsell: betaalde AI Growth Scan (vaste prijs) als alternatief. Dit is direct-omzet uit de "bijna goed genoeg"-laag.
- **≥ 70** — dossier + conceptvoorstel naar Richard; Richard beslist.

Kalibratie: elke gescoorde case + uitkomst loggen (aangenomen/afgewezen/omzet na 6 mnd). Per kwartaal gewichten herijken. Zonder deze feedbackloop wordt de score schijnzekerheid.

## 3. Contractvoorstel — automatisch opstellen, menselijk versturen

- Bij AVS ≥ 70 genereert het systeem automatisch een voorstel: omzetpercentage + zelfde percentage van de verkoopprijs bij exit.
- Voorstel percentagebanden (beslissing Richard + jurist): basis 15% van omzet; band 10–25% afhankelijk van AIOW-effort en risico; zelfde % bij verkoop; looptijd en definitie van "omzet" contractueel vastleggen.
- **Gate: het voorstel gaat nooit automatisch de deur uit.** Richard krijgt dossier + concept in Telegram en geeft go. Reden: juridische verbintenis, adverse selection en score-gaming. Na go: e-sign flow (bestaand contracts/sign-endpoint uitbouwen of SignWell/DocuSign).
- Jurist-template nodig (NL recht) met: omzetdefinitie, rapportageplicht, auditrecht, exitclausule, beëindiging, IP. Zonder rapportageplicht + auditrecht is een omzetpercentage feitelijk oninbaar — dit is de belangrijkste clausule van het hele model.

## 4. Telegram-automatisering (Spunky, Mac mini)

Bot-API-beperking: een bot kan zelf geen groepen aanmaken. Oplossing: Spunky draait als **userbot (MTProto/Telethon) of via de bestaande Spunky-agent** op de Mac mini die wel groepen kan aanmaken.

Flow bij "voorstel verstuurd":

1. Systeem-event → Spunky maakt supergroep `AIOW × {klantnaam}`.
2. Voegt toe: Richard, Jeroen, Spunky-bot. Klant krijgt invite-link (direct toevoegen faalt vaak op privacy-instellingen; link is robuust). Klant-Telegram-handle wordt al in de intake uitgevraagd.
3. Spunky's rol in de groep: klant-info-gatherer — vragen stellen, documenten/foto's verzamelen, alles gestructureerd loggen naar de klantstore (Supabase, per klant getagd).
4. Interne groep "AIOW Intern": commando's als `/klant {naam}` → samenvatting laatste info uit die klantgroep; wekelijkse digest van alle actieve klantgroepen.

Randvoorwaarden: Mac mini krijgt eigen silent health-check (zelfde patroon als Mac Studio-stack); klantdata in Telegram + store = AVG-punt → privacyverklaring en verwerkingsgrondslag regelen; userbot-gebruik binnen Telegram-ToS houden (geen spam, alleen eigen klanten).

## 5. Extra automatiseringen die dit model sterker maken

1. **Rev-share-inning automatiseren** — grootste gat in het plan: kwartaalrapportage per venture (omzetopgave klant) + automatische factuur (Moneybird/Stripe) + reminder-flow. Zonder dit is het percentage papier.
2. Lead-bron-tracking (UTM → dossier) zodat je leert welk kanaal goede founders levert.
3. Auto-follow-up: 3-touch sequence voor intakes die stilvallen (dag 2, 5, 12).
4. KvK/LinkedIn-verrijking automatisch in de research-pass.
5. Betaalde pre-scan als product voor de 50–69-laag (direct omzet, feeder voor de venture-funnel).
6. Wekelijks funnel-dashboard naar AIOW Intern: intakes, scores, voorstellen, conversie, omzet per venture.
7. NDA-stap optioneel vóór diepe intake (e-sign, zelfde flow als contract).
8. Kalibratielog (zie §2) als vast onderdeel, niet als bijzaak.

## 6. Bouwvolgorde (gefaseerd, elke fase levert los waarde)

- **Fase 1 (nu)**: AVS-scoring-engine + dossier → Richard-ping via Hermes. Spunky-chat upgraden van keyword-regels naar echte LLM-intake die het AVS-dossier vult. Storage: Supabase.
- **Fase 2**: conceptvoorstel-generator + e-sign-flow + percentagebanden (na jurist-template).
- **Fase 3**: Telegram-groepsautomatisering (Spunky userbot, klantgroepen, invite-flow).
- **Fase 4**: AIOW Intern query-commando's, digests, funnel-dashboard, rev-share-facturatie.

Eigenaarschap: OpenClaw of Hermes bouwt (bounded tasks per fase); Claude/Fable levert scoringprompts, red-team-prompt en reviewt elke fase; Richard beslist percentages, jurist-template en elke voorstel-verzending.

## 7. Hero video (Pexels) — kandidaten voor Hermes

Gratis Pexels-licentie, commercieel gebruik toegestaan. Past bij donker thema (#100904). Downloadlinks (Hermes: download, comprimeer naar ≤4MB 1080p H.264 + poster-frame, implementeer conform video-hero-spec op het dispatch board):

1. Monochroom particle-wave (subtiel, minst afleidend): https://www.pexels.com/video/animated-white-and-black-color-digital-abstract-particle-wave-background-cyber-or-technology-background-od-moving-particles-28561007/
2. Warme gouden bokeh-golf (past bij warm-donkere branding): https://www.pexels.com/video/abstract-golden-light-bokeh-wave-animation-34549010/
3. Geometrische digitale ruimte (tech/venture-gevoel): https://www.pexels.com/video/digital-calculation-of-geometrical-space-3141211/

Advies: optie 1 of 2; optie 3 als het "techniger" mag. Tekstcontrast checken met overlay-gradient.
