# Book-lane UX & trust red-team: AIOW waar AI de homepage is

Status: strategische red-team notitie  
Datum: 2026-06-25  
Scope: eerste vijf minuten, homepage, intake, trust/legal boundaries, productgevoel  
Bronnen: huidige `AiowNativeMotionPage.tsx`, Venture Platform canon, Spunky chat rebuild brief

## 1. Hard verdict

De huidige richting is al beter dan de oude AI-agency/service-site, maar nog niet radicaal genoeg. De site zegt nu: “wij zijn een AI venture & growth partner” en toont daarna nog steeds veel website-conventies: hero, navigatie, scroll-story, pricingblokken, CTA’s, FAQ, formulieren en een chatlaag. Dat is precies het mentale model dat Richard wil verlaten.

Als de nieuwe filosofie echt is: **“The AI is the Homepage”**, dan mag de eerste ervaring niet voelen als een website met AI. Het moet voelen alsof iemand het kantoor van AIOW binnenloopt en direct wordt ontvangen door een scherpe AI venture partner die de bezoeker begrijpt, kwalificeert, grenzen aangeeft en naar de juiste volgende ruimte brengt.

De AI moet dus niet prominenter worden gemaakt binnen de pagina. De pagina moet verdwijnen achter de AI.

## 2. Wat moet van de huidige site weg of hard gedegradeerd worden

### Direct verwijderen uit de eerste viewport

1. **Klassieke hero-copy als hoofdobject**  
   “Wij bouwen AI in je bedrijf en groeien mee” is bruikbaar als samenvatting, maar mag niet de primaire interface zijn. De primaire interface moet de AI-agent zijn.

2. **Secundaire CTA’s zoals “Bekijk onze aanpak” boven de vouw**  
   Dit nodigt uit tot bladeren. De nieuwe ervaring moet uitnodigen tot praten. Aanpak mag alleen verschijnen als de AI die context nodig vindt.

3. **Trust chips als losse marketingbadges**  
   “AI due diligence”, “Software + growth”, “Revenue/share upside” zijn inhoudelijk goed, maar als badges voelen ze als SaaS/agency-proof. Trust moet voortkomen uit het gedrag van de AI: goede vragen, duidelijke grenzen, geen beloftes, transparante samenvatting.

4. **Prijs/plannen als publieke koopkaart**  
   Pricingblokken trekken de verkeerde vergelijking: bureau, pakket, retainer, goedkope build. Samenwerkingsmodellen horen in de AI-diagnose en later in een Deal Card. Publiek mag alleen de boundary tonen: geen gratis bouw, paid assessment, contract voor scope/upside.

5. **Scroll-story als verplichte route**  
   De pinned story kan later als bewijslaag blijven, maar niet als primaire homepage-ervaring. Als de AI de homepage is, navigeert AI naar bewijs wanneer relevant.

6. **Formulierachtige intake onderaan**  
   De huidige CTA/intake voelt nog als formulier met opties. Dat is strijdig met “AI navigates the user”. Vervang door AI-geleide intake die na elk antwoord samenvat wat al bekend is.

7. **Chat als “Spunky-widget”**  
   De huidige brief zegt dit zelf al: Spunky voelt als widget. In de nieuwe richting moet Spunky geen component zijn, maar de host van de hele ervaring.

### Wat mag blijven, maar alleen als AI-oproepbaar bewijs

- Cases / Made by AIOW
- Venture flow uitleg
- Legal/privacy/terms
- Deal model boundaries
- Portal preview
- FAQ
- Werkwijze

Deze onderdelen worden geen nav-items. Ze worden bronnen die de AI toont als kaarten wanneer de bezoeker erom vraagt of wanneer het vertrouwen vergroot.

## 3. Eerste scherm: hoe het eruit moet zien

### Doel van het eerste scherm

Binnen 5 seconden moet de bezoeker voelen:

> “Ik ben niet op een website. Ik ben in gesprek met AIOW’s digitale venture partner.”

### Layout

**Een enkel dominant AI-command surface.** Geen traditionele hero links, geen grote marketingvisual die concurreert met de AI.

Bovenin minimaal:

- AIOW.ai
- “AI venture partner” of “Digital venture partner”
- kleine links: Privacy, Voor wie, Login/Deal Room
- taalwissel indien nodig

Midden:

```text
Welkom bij AIOW.
Ik ben de AI venture partner aan de voorkant.
Vertel me in één zin wat je wilt bouwen, automatiseren of laten groeien.
```

Daaronder een groot invoerveld, niet een kleine chatcomposer:

```text
Bijv. “Ik heb een bestaand installatiebedrijf en wil leads, planning en klantcontact automatiseren.”
```

Daaronder drie starter-routes, maar als gespreksopeners, niet als knoppen naar pagina’s:

- Ik heb een startup/idee
- Ik heb een bestaand bedrijf
- Ik wil processen/growth automatiseren

Rechts of onder het gesprek een live “Deal context” paneel:

```text
Nog onbekend:
- type kans
- doelgroep
- bewijs/tractie
- budgetbereidheid
- data/systemen
- gewenste rol AIOW
```

Na elke user-input verandert dit paneel. Dat maakt het geen chatbot maar een intake intelligence system.

### Eerste scherm moet expliciet grenzen tonen

Kleine trust-boundary onder de composer:

```text
De AI kan je kans structureren en een intake voorbereiden. AIOW belooft geen build, deal, investering of juridisch advies zonder menselijke review, scope en contract.
```

Dit is belangrijk: trust ontstaat niet door “wij zijn betrouwbaar” te zeggen, maar door niet te overclaimen.

## 4. Conversational arc: eerste vijf minuten

### Fase 1: ontvangst en vrije intentie

AI vraagt niet meteen naam, email of budget. Eerst waarde.

AI opening:

```text
Vertel kort wat je bedrijf of idee is en waar AIOW volgens jou waarde moet bouwen. Ik luister eerst, daarna stel ik één scherpe vervolgvraag.
```

### Fase 2: scherpe diagnose na eerste antwoord

Na antwoord geeft AI geen lange marketingtekst, maar een compacte venture-diagnose:

```text
Ik hoor drie signalen:
1. Kans: [type kans]
2. Mogelijke AI/softwarelaag: [workflow/product/growth engine]
3. Grootste ontbrekende bewijs: [data/klanten/budget/tractie]

Mijn eerste vraag: [één vraag]
```

Kritisch: maximaal één vraag per beurt. Geen intakeformulier vermomd als chat.

### Fase 3: stille fact extraction

De AI bouwt zichtbaar een “Opportunity Brief” op:

- Type: idee / startup / bestaand bedrijf
- Beslisser: onbekend / ja
- Klantsegment
- Bewijs van vraag
- Omzet/tractie indicatie
- Data/systemen
- Bottleneck
- Gewenste AIOW-rol
- Budgetsignaal
- Risico’s

De bezoeker ziet: “AIOW begrijpt mij en structureert mijn kans.”

### Fase 4: eerste waardemoment vóór contactcapture

Na 2 tot 4 berichten moet AI een mini Deal Readout geven:

```text
Voorlopige route:
- Waarschijnlijk: Paid Venture Scan of Proof Sprint
- Niet genoeg bewijs voor: directe venture deal
- Eerste proof sprint kandidaat: [concreet]
- Belangrijkste risico: [concreet]
- Wat AIOW nodig heeft om dit serieus te beoordelen: [3 items]
```

Pas daarna vraagt AI contactgegevens.

### Fase 5: consent en overgang naar private Deal Room

Niet: “Vul je gegevens in.”  
Wel:

```text
Ik kan hiervan een private intake aanmaken voor menselijke review door AIOW. Daarvoor heb ik je naam, zakelijke email en expliciete toestemming nodig om deze samenvatting op te slaan en je te benaderen.
```

Daarna:

- checkbox consent
- naam
- zakelijke email
- bedrijf optioneel
- “Maak private intake”

Na submit:

```text
Je intake is voorbereid. De AI heeft geen deal goedgekeurd. Een AIOW-operator beoordeelt of dit No-Go, Paid Venture Scan, Proof Sprint, Fixed Build, Growth Partner of Hybrid/Venture Deal wordt.
```

## 5. Trust en legal boundaries

### AI mag wel

- kansen structureren
- follow-up vragen stellen
- intake completeness beoordelen
- risico’s signaleren
- mogelijke routes voorstellen
- Deal Card voorbereiden
- uitleg geven over AIOW’s proces
- publieke proof/cases tonen

### AI mag niet

- beloven dat AIOW gaat bouwen
- equity/revenue-share voorwaarden toezeggen
- “goedgekeurd” zeggen zonder mens
- juridisch, fiscaal of investeringsadvies geven
- vertrouwelijkheid beloven zonder voorwaarden
- gevoelige documenten publiek laten uploaden zonder private context
- doen alsof Richard/Jeroen al akkoord zijn
- prijs of planning hard vastleggen zonder scope

### Noodzakelijke microcopy

Bij eerste scherm:

```text
Geen gevoelige klantlijsten, financiële details of IP in de publieke chat. De AI vraagt alleen de minimale context. Gevoelige informatie hoort in een private Deal Room na toestemming.
```

Bij AI-readout:

```text
Voorlopige AI-inschatting. Geen aanbod, investering, overeenkomst of juridisch advies.
```

Bij contactcapture:

```text
Met je toestemming slaat AIOW je intake, transcript en samenvatting op voor opvolging. Je kunt verwijdering aanvragen.
```

Bij Deal Room:

```text
Toegang is persoonlijk. Upload alleen informatie waarvoor je bevoegd bent. Contract, NDA of verwerkersafspraken volgen waar nodig vóór uitvoering.
```

## 6. Wat maakt het niet voelbaar als chatbot

Een chatbot praat. Een venture partner werkt. De interface moet daarom werk tonen.

### Nodig

1. **Live Opportunity Brief**  
   De AI vult een zichtbaar dossier terwijl je praat.

2. **Structured answer cards**  
   Antwoorden als diagnosekaarten, niet bubble-muren.

3. **One-question discipline**  
   Eén scherpe vraag per beurt. Dat voelt senior.

4. **Route recommendation**  
   AI moet na enkele berichten durven zeggen: “dit lijkt paid scan”, “dit is nog te vroeg”, “dit mist bewijs”.

5. **Visible confidence and unknowns**  
   Toon wat zeker is, wat onzeker is en wat nodig is voor review.

6. **Human decision rail**  
   Altijd zichtbaar: AI intake → AI due diligence → human review → proposal/No-Go → contract → proof sprint/build.

7. **Context memory in dezelfde sessie**  
   De AI moet eerder genoemde feiten actief gebruiken en corrigeren kunnen verwerken.

8. **Geen avatar-theater**  
   Geen gimmicky botkop, geen “typende assistent” als kern. Premium, rustig, dossier-achtig.

9. **AI navigeert bewijs**  
   Als de bezoeker vraagt “voor wie is dit?” toont AI een relevante kaart. Niet sturen naar een pagina.

10. **Een duidelijke stopknop**  
   “Ik wil alleen lezen” of “Toon proces” mag, maar wordt door AI als uitlegmodus behandeld, niet als website-navigatie.

## 7. Red-team risico’s

### Risico 1: AI als homepage klinkt innovatief maar wordt alsnog een formulier

Als de AI vaste chips en steppervelden gebruikt, voelt het als Typeform met bottekst. Oplossing: vrije input eerst, structured extraction ernaast, niet vooraf alles vragen.

### Risico 2: te veel venture-taal schrikt MKB af

“Venture partner”, “Deal Card”, “upside” kan intimiderend zijn. De AI moet de taal spiegelen. Een bakker/installateur zegt niet “venture deal”; die zegt “meer klanten en minder handwerk”. AI vertaalt intern naar venture model.

### Risico 3: revenue share/equity trekt opportunisten

Publiek niet sexy maken. AI moet vroeg filteren op budget, bewijs, toegang en beslisrechten. Copy: “AIOW bouwt niet gratis.”

### Risico 4: vertrouwen zakt als AI te slim of te beslissend klinkt

De AI moet scherp maar begrensd zijn. Gebruik “voorlopig”, “lijkt”, “voor review”, “menselijke beslissing”.

### Risico 5: privacy-schade door publieke chat

Verbied gevoelige uploads/details in public chat. Escaleer naar Deal Room met consent. Log minimale gegevens voor anonieme sessie.

### Risico 6: AI kan hallucinerende capabilities of contracten noemen

Frontend en backend moeten een strict response contract hebben met verboden claims. Routes zijn suggesties, geen aanbiedingen.

### Risico 7: te weinig bewijs op de eerste screen

AI-first betekent niet proof-loos. Het bewijs moet in de interactie zitten: duidelijke diagnose, goede samenvatting, boundaries, route. Cases kunnen door AI opgeroepen worden.

## 8. Productrichting: homepage IA

Nieuwe homepage is eigenlijk één app-shell:

```text
AIOW.ai
└── AI Venture Partner
    ├── Conversation
    ├── Opportunity Brief
    ├── Trust & boundaries
    ├── Suggested next route
    └── Create private Deal Room
```

Minimal nav:

- Login / Deal Room
- Privacy
- Voor wie? (opent AI-uitlegkaart)
- Proces (opent AI-uitlegkaart)

Geen traditionele paginanavigatie als hoofdroute.

## 9. Concrete acceptance criteria voor Book-lane signoff

Book zou pas “ja” moeten zeggen als:

1. Eerste viewport voor minimaal 70% uit AI-intake surface bestaat.
2. De gebruiker kan direct typen zonder te scrollen.
3. De eerste AI-reactie geeft een concrete diagnose en één vervolgvraag.
4. Contactcapture komt pas na aantoonbare waarde.
5. Er is een zichtbaar Opportunity Brief-paneel.
6. Er staat duidelijke microcopy over AI-beperkingen en gevoelige data.
7. Geen pricing/plannen/cards in de eerste flow vóór diagnose.
8. Geen “chat widget” styling: geen kleine overlay, geen bubble-wall, geen zwevende bot.
9. AI kan een No-Go of “te vroeg” route communiceren.
10. Menselijke review is zichtbaar vóór ieder aanbod/deal/contract.
11. Mobile opent als native full-screen intake, niet als embedded homepage-blok.
12. De gebruiker voelt na vijf minuten: “AIOW heeft mijn kans gestructureerd”, niet “ik heb een formulier ingevuld”.

## 10. Mijn aanbevolen eerste buildbeslissing

Niet itereren op de bestaande hero. Bouw een aparte homepage mode rond de AI-agent en degradeer de huidige site tot bewijsbibliotheek achter de agent.

Eerste implementatie:

1. Full-screen AI Venture Partner shell op `/`.
2. Public chat endpoint met strict structured intake response.
3. Live Opportunity Brief naast/onder gesprek.
4. Consent-gated lead capture.
5. Create private Deal Room route na consent.
6. Huidige sections alleen als AI-openbare “evidence cards”.

De kernzin voor het team:

> Stop met een betere website maken. Maak een betere eerste meeting met AIOW.
