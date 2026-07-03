# Handsome.bot early-adopter strategy

Status: draft decision rail  
Date: 2026-05-30

## Verdict

AIOW.ai moet B2B-informatief blijven: AI-systemen, werkwijze, datagrenzen, klantscan, portals en bedrijfswaarde.

Handsome.bot wordt de consumer/product hub: alle Team Handsome apps, app pages, download links, early access, founding offers, lifetime caps, community/feedback en launch proof.

OneTap Day mag tijdelijk als private/noindex revenue test blijven draaien zolang de eerste proof wordt gemeten, maar de structurele funnel hoort op Handsome.bot.

## OneTap Day pricing verdict

€19 is slim als eerste echte revenue proof, niet als permanente prijs.

Aanbevolen ladder:

- Founding 20: €19 one-time
  - cap: eerste 20 betalende users
  - bevat: OneTap Day Core early access + eerste concierge-light proof
  - niet bevat: lifetime op toekomstige producten, onbeperkte AI credits, eeuwige concierge/support
- Founding 50: €29 one-time
  - users 21–50
  - OneTap Day Core lifetime/early access
  - geen zware concierge
- Founding 100: €49 one-time
  - users 51–100
  - OneTap Day Core lifetime/early access
- Daarna launch pricing:
  - €4,99/maand of €39/jaar
  - eventuele later lifetime: €79, alleen zonder onbeperkte AI/support

## Wie komt in aanmerking?

Voor OneTap Day:

- Max 100 lifetime users totaal vóór normale pricing.
- Alleen gebruikers die:
  - betalen via Stripe;
  - complete intake sturen;
  - akkoord gaan met text-only Phase 1 datagrens;
  - begrijpen dat dit OneTap Day Core is, niet alle toekomstige producten.

Voor een bredere Handsome Early Adopter Pass:

- Niet meteen lanceren als “alles lifetime”.
- Als we dit doen: max 25 users.
- Richtprijs: €99–€149 one-time.
- Geeft:
  - lifetime OneTap Day Core;
  - early access tot nieuwe Handsome.bot apps;
  - private feedback/influence;
  - eventueel 50% korting eerste jaar op toekomstige betaalde apps.
- Geeft niet:
  - gratis lifetime toegang tot alle toekomstige producten;
  - onbeperkte AI credits/infrastructuur;
  - B2B AIOW diensten;
  - onbeperkte persoonlijke support.

## Waarom deze cap

Lifetime deals zijn nuttig voor vroege cash, feedback en social proof, maar kunnen toekomstige omzet kapotmaken als ze te breed zijn. De cap moet klein genoeg zijn dat support en AI-kosten beheersbaar blijven, maar groot genoeg om echte vraag te bewijzen.

- 20 users: bewijst willingness-to-pay snel.
- 50 users: bewijst dat het buiten vrienden/inner circle werkt.
- 100 users: genoeg data voor retention/pricing, nog beperkt genoeg om lifetime liability te managen.

## Positionering per domein

### AIOW.ai

Rol:

- B2B credibility site.
- AI systems for companies.
- Secure worklayer, automation, client portals, scan, governance.
- Case/capability proof mag, maar niet als consumer app store.

Niet doen:

- Consumer app index.
- “Made by AIOW” app launch wall.
- Early adopter/lifetime app offers.

### Handsome.bot

Rol:

- Product/app hub.
- OneTap Day, future apps, app download links.
- Early adopter/founding offers.
- Searchable/categorized showcase.
- Update/proof pages per app.

## Immediate implementation

- AIOW.ai homepage: geen publieke app/project-index.
- `/projects`: noindex B2B explanation; geen app cards.
- `/projects.json`: lege/disabled AIOW manifest response.
- `/onetap-day`: legacy redirect naar `https://handsome.bot/apps/onetap-day`.
- Handsome.bot apex: product hub live.
- Handsome.bot `/apps/onetap-day`: OneTap Day provider-off founding premium interest test live.
- Guard: AIOW_B2B_SEPARATION_GUARD beschermt dat AIOW.ai geen app showcase wordt.

## Next after this patch

1. Deploy AIOW.ai B2B separation.
2. Laat OneTap revenue watcher doorlopen.
3. Maak Handsome.bot architecture/spec:
   - `/apps`
   - `/apps/onetap-day`
   - `/early-access`
   - `/founders`
   - app manifest + pricing caps + Stripe product mapping.
4. Migreer OneTap Day funnel naar Handsome.bot zodra hub live is.
5. Redirect/noindex legacy AIOW route definitief zodra Handsome.bot equivalent bewezen is.

## Implementation proof — 2026-05-31

- `https://handsome.bot/` returns 200 and contains `Handsome.bot`, `Apps, tests, proof`, `OneTap Day`.
- `https://handsome.bot/apps/onetap-day` returns 200 and contains `OneTap Day · Handsome.bot project`, `Founding Premium Interest Test`, `Geen live checkout`, `interest_intent_rate`.
- `https://aiow.ai/onetap-day` returns 308 to `https://handsome.bot/apps/onetap-day`.
- Live Handsome.bot API smoke: `POST https://handsome.bot/api/onetap/founding-interest` returned 200 with receipt `otd_interest_83fd72ae3123f501` and `commercialState=PROVIDER_OFF_INTEREST_ONLY`.
- `https://www.handsome.bot/` still returns Vercel 404; apex `handsome.bot` is live. Follow-up: clear/verify `www` alias assignment.
