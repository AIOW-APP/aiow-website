# AIOW — Living Design Direction

Datum: 2026-07-02 · Claude/Fable
Opdracht Richard: onderzoek de allerbeste sites en overtref ze met uniek design, unieke features en motion alsof de pagina leeft en ademt.

## Onderzoek — waar de lat ligt (Awwwards SOTD juni 2026 + toonaangevende studio's)

Gezien: recente Sites of the Day van Lusion (EverSwap), Locomotive (Truck'N Roll), WILD (Serve Robotics), Unseen Studio (Hubtown), makemepulse (Apechain), Noomo, O0 (Fauna Robotics), MONOGRID (Gucci).

Wat de top gemeen heeft: (1) één sterk concept dat overal in doorwerkt, niet losse effecten; (2) WebGL/canvas-laag die op de cursor en scroll reageert; (3) traagheid en easing die duur voelt — niets beweegt lineair; (4) typografie als hoofdpersoon, motion als ondersteuning; (5) film-grain en licht in plaats van vlakke kleuren; (6) 60fps of het effect gaat eruit.

Wat bijna niemand doet (onze opening om te overtreffen): de motion is decoratie, nergens ís de site het product zelf.

## Concept: "De site is het systeem"

AIOW beoordeelt ideeën met AI. Dus de pagina moet niet over dat systeem vertellen — de pagina IS het systeem, zichtbaar levend:

1. **Ademhaling** — alles ademt in één ritme van 4,8s: achtergrondlicht, particles, de titel (0,8% schaal), de statusdot. Subtiel genoeg dat je het voelt voordat je het ziet.
2. **Bioluminescentie** — een canvas-veld van plankton-achtige particles drijft door een flow field; rond de cursor beginnen ze te gloeien en om je heen te cirkelen. De site merkt je op.
3. **De unieke feature: het systeem weegt je terwijl je typt** — in de hero staat een invoerveld ("Typ je idee in één zin"). Bij elke letter reageert het organisme: particles versnellen, een venture-signaal-teller loopt op, statustekst verandert. Niemand in de Awwwards-lijst koppelt de motion aan het echte product. Wij wel: dit veld wordt in productie de voordeur van de echte AVS-intake.
4. **Hartslag** — een ECG-lijn in de footer klopt continu: "het systeem draait, ook nu." Kan in productie gekoppeld aan echte health-check.
5. **Bewijs boven beloftes** — cases (Cargo Donkey, OneTap Day) direct onder de hero, claim-safe.

Prototype (open in browser): `docs/prototypes/aiow-living-landing-prototype-2026-07-02.html` — volledig zelfstandig, respecteert prefers-reduced-motion, mobiel-vriendelijk (particles teruggeschroefd, geen custom cursor).

## Hero-video: zelf genereren i.p.v. stock

Richard: Handsome heeft Kling.ai, Grok Imagine, GPT Image 2. Bespoke wint van Pexels (uniek = het hele punt). Pexels-kandidaten uit het eerdere ontwerp blijven fallback.

Kling.ai prompt (10s, loop, 16:9):
"Macro shot of bioluminescent ink slowly breathing and unfurling in dark water, deep charcoal background, thin glowing filaments in warm ember orange and electric cyan, organic pulsing rhythm like a living organism inhaling and exhaling, extremely slow graceful motion, cinematic, shallow depth of field, seamless loop, no text, no logos"

Variant 2 (abstracter): "Slow breathing aurora of warm amber and violet light behind dark silk, organic undulation, particles of dust drifting upward, meditative pace, seamless loop, dark elegant, cinematic grain"

GPT Image 2: poster-frame + og-image in dezelfde stijl genereren (1200×630 en 2560×1440), zodat LCP en social shares kloppen.

Specs blijven: ≤4MB 1080p H.264 + WebM, muted/autoplay/playsInline, poster = LCP, reduced-motion fallback naar stilstaand frame.

## Volgende stap

1. Richard bekijkt prototype → smaak-feedback (kleuren nu: ember/cyaan/violet op near-black).
2. Hermes genereert hero-video met Kling-prompt + poster met GPT Image 2.
3. Na Richard-go port ik het prototype naar de Next.js-component (AiowVentureLanding v2) met video-laag eronder.
