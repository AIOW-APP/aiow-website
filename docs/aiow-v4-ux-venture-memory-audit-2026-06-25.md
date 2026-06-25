# AIOW v4 UX en Persistent Venture Memory Audit

Datum: 2026-06-25
Status: v4 foundation live-ready na build en smoke QA

## Hard oordeel

De huidige AIOW richting is strategisch goed, maar de interface mag niet blijven voelen als een modern SaaS-dashboard. De lat is hoger: de gebruiker moet binnen 30 seconden voelen dat hij met een intelligente venture partner praat.

De volgende productregel is leidend:

**Minder interface. Meer intelligentie.**

## Onafhankelijke agent-conclusies

### Desktop UX

- De AI workspace moet dominant zijn.
- Sidebar, rechter canvas en bottom dock concurreren te veel met het gesprek.
- De composer is heilig. Niets mag eroverheen vallen of hem visueel verstoppen.
- Het Venture Canvas moet voelen als gevolg van het gesprek, niet als statisch dashboard.
- Thinking indicators moeten tijdelijk en betekenisvol zijn, niet permanent als debuglaag.

### Mobile UX

- Mobiel moet een eigen premium messaging app zijn, geen responsive desktop.
- Composer moet keyboard-safe, thumb-friendly en simpel zijn.
- Tools horen achter een plusknop of sheet, niet als permanente drukke rij.
- Venture Memory moet in de chat voelbaar worden via inline cards of memory pills.
- Canvas cards horen progressief te verschijnen na context, niet als standaard dashboardlaag.

### Venture Memory architectuur

- Memory moet vanaf eerste bericht server-side worden opgebouwd.
- Client moet een stabiele `ventureSessionId` bewaren.
- Na maximaal drie inhoudelijke berichten moet AIOW vragen om naam, e-mail en expliciete toestemming.
- Contact-link moet de tijdelijke memory koppelen, lead/follow-up aanmaken en een Deal Card genereren.
- Admin Team Richard moet later de volledige Deal Card, consentstatus en transcript-samenvatting zien.

## Wat nu is aangepast

### Chat UX

- Quick action chips staan niet meer achter de composer.
- Desktop en mobiel hebben harde spacing tussen chips en composer.
- Enter verstuurt direct.
- Shift+Enter maakt een nieuwe regel.
- Korte begroetingen zoals `Hey` krijgen nu een natuurlijk AI-agent antwoord met variatie.
- Composer tools zijn teruggebracht naar een compactere set.

### Persistent Venture Memory MVP

Nieuwe server-side basis:

- `lib/aiow-venture-memory.ts`
  - schrijft Venture Memory events
  - ondersteunt Supabase mode wanneer schema bestaat
  - valt terug op JSONL voor preview/local
  - bouwt een eerste Deal Card

Uitgebreide route:

- `POST /api/spunky/chat`
  - accepteert `sessionId`
  - schrijft user message event
  - schrijft AI reply event
  - retourneert `memorySessionId`
  - lead gate pas vanaf derde inhoudelijke message

Nieuwe route:

- `POST /api/venture-memory/link-contact`
  - vraagt naam, e-mail en consent
  - schrijft `contact_linked`
  - bouwt Deal Card
  - maakt lead capture plus next-day follow-up metadata aan
  - retourneert privacy en Deal Card status

Client:

- bewaart `aiow:ventureSessionId` in localStorage
- stuurt sessionId en canvas mee naar Spunky
- contact form koppelt de tijdelijke Venture Memory aan lead en Deal Card

## Wat nog niet goed genoeg is voor het volledige eindplan

### 1. Supabase schema ontbreekt nog voor Venture Memory

De code kan naar `aiow_venture_memory_events` schrijven, maar production Supabase heeft daarvoor nog tabellen nodig.

Nodig:

- `aiow_venture_sessions`
- `aiow_venture_memory_events`
- `aiow_deal_cards`
- `aiow_agent_context_snapshots`
- indexes op `session_id`, `person_email`, `created_at`
- retention/deletion kolommen

### 2. Magic Link is nog geen echte Magic Link

De bestaande account-flow gebruikt preview-access-code patronen. Voor echte Magic Link zijn nodig:

- Supabase Auth magic links of eigen signed link flow
- e-mail delivery via Resend
- account merge op e-mailadres
- veilige portal session

### 3. Follow-up e-mail is gepland, niet volledig uitgevoerd

Lead capture maakt follow-up metadata. Er is nog een worker nodig:

- `/api/cron/aiow-followups`
- pending jobs ophalen
- Deal Card en Venture Memory snapshot in e-mail verwerken
- idempotent verzenden
- send log opslaan

### 4. Admin view mist nog Venture Memory

Team Richard moet kunnen zien:

- Deal Card
- transcript summary
- consent status
- missing fields
- recommended route
- retention state
- delete/revoke acties

### 5. Privacy lifecycle moet functioneel worden

Nodig:

- delete temporary memory endpoint
- revoke consent endpoint
- retention deadline voor niet-klanten
- deletion audit event
- PII redaction wanneer nodig

### 6. UI moet nog naar progressive disclosure

De v4 foundation werkt, maar de beste versie moet minder tegelijk tonen:

Fase 1: alleen gesprek
Fase 2: Venture Memory pill en eerste snapshot
Fase 3: Live Venture Canvas verschijnt
Fase 4: AI Team verschijnt bij echte analyse
Fase 5: Personal Workspace na account-link

## Beste volgende ontwerpstap

Niet nog meer dashboard polish.

Bouw de volgende iteratie als progressive AI experience:

1. Open met bijna alleen AI gesprek en composer.
2. Toon Venture Memory als klein levend object.
3. Laat canvas pas verschijnen wanneer de AI echte context heeft.
4. Laat AI Team pas verschijnen als er agentwerk gebeurt.
5. Verplaats thinking dock naar tijdelijke inline analysis cards.
6. Maak mobiel een eigen messaging shell met tools achter plusknop.

## Acceptance criteria voor volledige rollout

- Eerste bericht schrijft server-side memory.
- Refresh behoudt sessionId.
- Na drie inhoudelijke berichten vraagt AIOW naam, e-mail en toestemming.
- Contact-link maakt Deal Card en lead capture.
- Admin ziet Deal Card en memory summary.
- Next-day follow-up gebruikt de memory snapshot.
- Niet-klant memory krijgt retention/deletion beleid.
- Mobiel blijft keyboard-safe.
- Geen em dash in publieke AIOW content.
