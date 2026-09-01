"use client";

import { useState } from "react";
import Link from "next/link";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import styles from "./CapabilitiesExperience.module.css";

type Mode = "process" | "building" | "home";
type Trace = { label:string; eyebrow:string; title:string; intro:string; steps:{ label:string; state:string; title:string; body:string }[]; boundary:string };

const content: Record<AiowLocale,{ eyebrow:string; title:string; lead:string; choose:string; reference:string; modes:Record<Mode,Trace>; beyondTitle:string; beyondLead:string; capabilities:string[]; scanEyebrow:string; scanTitle:string; scanLead:string; deliverables:string[]; ctaTitle:string; ctaBody:string; cta:string; rates:string }> = {
  nl: {
    eyebrow:"AI in de praktijk", title:"AI is meer dan een antwoord in een chatvenster.",
    lead:"AIOW verbindt informatie, signalen en bestaande systemen tot een controleerbare workflow. Kies een omgeving en bekijk wat er stap voor stap gebeurt.",
    choose:"Kies uw omgeving", reference:"Publieke, synthetische referentieworkflow",
    modes:{
      process:{ label:"Bedrijfsproces", eyebrow:"Van aanvraag naar gecontroleerd werk", title:"Een binnenkomende aanvraag wordt een uitvoerbare workflow.", intro:"Niet alleen tekst genereren, maar informatie lezen, controleren, koppelen en doorzetten naar de juiste mensen en systemen.", steps:[
        {label:"01 · Signaal",state:"Gebruiker of systeem",title:"Een aanvraag komt binnen",body:"E-mail, formulier, document of spraak bevat een concrete vraag, bijlagen en gewenste termijn."},
        {label:"02 · Interpretatie",state:"Afgeleid door AI",title:"AI structureert de vraag",body:"Onderwerp, ontbrekende gegevens, risico en voorgestelde vervolgstap worden apart en controleerbaar vastgelegd."},
        {label:"03 · Systeemactie",state:"Begrensde automatisering",title:"De workflow wordt voorbereid",body:"CRM, planning, dossier of ERP krijgt een concepttaak met eigenaar, deadline en bronverwijzing — zonder stil een commerciële toezegging te doen."},
        {label:"04 · Beslissing",state:"Menselijke autoriteit",title:"Een medewerker controleert en bevestigt",body:"De verantwoordelijke corrigeert, wijst toe of stopt. Pas daarna volgt de bevoegde actie en een bewijsbaar resultaat."},
      ], boundary:"Referentiearchitectuur — geen klantcase, besparingsclaim of live verwerking."},
      building:{ label:"Gebouw", eyebrow:"Van signaal naar beheersbare actie", title:"Een gebouwsignaal wordt een taak met context.", intro:"AI kan sensoren, documentatie en onderhoudsafspraken combineren zonder zelfstandig veiligheid of techniek te overrulen.", steps:[
        {label:"01 · Signaal",state:"Sensor + systeemfeit",title:"Een afwijkend patroon verschijnt",body:"Bezetting, energie, temperatuur of apparatuur wijkt af van de afgesproken bandbreedte."},
        {label:"02 · Interpretatie",state:"Afgeleid door AI",title:"AI vergelijkt context en historie",body:"Het systeem koppelt de meting aan ruimtegebruik, handleidingen en bekende uitzonderingen en toont wat zeker, afgeleid of onbekend is."},
        {label:"03 · Systeemactie",state:"Begrensde automatisering",title:"Een controle wordt voorbereid",body:"Een facilitaire taak krijgt prioriteit, locatie, relevante bron en voorgestelde controle — geen autonome technische ingreep."},
        {label:"04 · Beslissing",state:"Menselijke autoriteit",title:"Beheerder kiest de vervolgstap",body:"De beheerder accepteert, plant een monteur, past de regel aan of markeert een legitieme uitzondering."},
      ], boundary:"Referentiearchitectuur — fysieke installatie en gecertificeerd technisch werk worden apart gescoped."},
      home:{ label:"Woning", eyebrow:"Van voorkeur naar private ondersteuning", title:"Een woning reageert op afspraken, niet op losse gadgets.", intro:"AI kan comfort, energie en veiligheid ondersteunen met lokale of private verwerking waar dat passend is, terwijl bewoners de autoriteit houden.", steps:[
        {label:"01 · Signaal",state:"Bewonerskeuze + apparaat",title:"Een situatie verandert",body:"Aanwezigheid, tijd, energiegebruik of een expliciete bewonersactie vormt het signaal — geen verborgen profiel."},
        {label:"02 · Interpretatie",state:"Afgeleid door AI",title:"AI herkent de afgesproken context",body:"Alleen toegestane gegevens en huisregels worden gebruikt om een voorstel of waarschuwing te maken."},
        {label:"03 · Systeemactie",state:"Begrensde automatisering",title:"Een scène of taak wordt voorgesteld",body:"Verlichting, klimaat, melding of energietaak wordt binnen ingestelde grenzen voorbereid of uitgevoerd."},
        {label:"04 · Beslissing",state:"Bewonersautoriteit",title:"De bewoner kan altijd ingrijpen",body:"Uitleg, handmatige bediening, stop en aanpassing blijven beschikbaar. Veiligheidskritische acties krijgen expliciete bevestiging."},
      ], boundary:"Referentiearchitectuur — geen medische inferentie; hardware en installatie zijn partnerafhankelijk en apart geprijsd."},
    },
    beyondTitle:"Wat AIOW toevoegt bovenop een los AI-model", beyondLead:"Een model kan taal of beeld begrijpen. Waarde ontstaat pas wanneer het veilig onderdeel wordt van uw echte werk.", capabilities:["Documenten en beelden begrijpen","Systemen en gegevens koppelen","Signalen continu bewaken","Beslissingen voorbereiden","Begrensde acties uitvoeren","Resultaat en fouten bewijsbaar maken"],
    scanEyebrow:"Concreet na de scan", scanTitle:"U krijgt een besluitbaar ontwerp, geen AI-presentatie.", scanLead:"De scan eindigt met één compact artefact waarmee u kunt besluiten wat we bouwen, voorbereiden of bewust niet automatiseren.", deliverables:["Huidige situatie","Gekozen proces of ruimte","Geverifieerde inputs","Systemen en afhankelijkheden","Menselijke beslismomenten","Uitzonderingen en foutimpact","Aanbevolen pilot","Expliciete uitsluitingen","Gepubliceerde prijsbasis","Volgende beslissing"],
    ctaTitle:"Breng één proces of één ruimte mee.", ctaBody:"Wij laten zien waar AI werkelijk helpt, welke koppelingen nodig zijn en waar menselijke controle moet blijven.", cta:"Vraag een scan aan", rates:"Bekijk tarieven en grenzen",
  },
  en: {
    eyebrow:"AI in practice", title:"AI is more than an answer in a chat window.",
    lead:"AIOW connects information, signals and existing systems into a controlled workflow. Choose an environment and inspect what happens step by step.", choose:"Choose your environment", reference:"Public, synthetic reference workflow",
    modes:{
      process:{ label:"Business process",eyebrow:"From request to controlled work",title:"An incoming request becomes an executable workflow.",intro:"Not merely generating text, but reading, checking, connecting and routing information to the right people and systems.",steps:[
        {label:"01 · Signal",state:"User or system",title:"A request arrives",body:"Email, form, document or speech contains a concrete request, attachments and desired timing."},{label:"02 · Interpretation",state:"Derived by AI",title:"AI structures the request",body:"Subject, missing facts, risk and proposed next step are recorded separately and remain inspectable."},{label:"03 · System action",state:"Bounded automation",title:"The workflow is prepared",body:"CRM, planning, dossier or ERP receives a draft task with owner, deadline and source — without silently making a commercial commitment."},{label:"04 · Decision",state:"Human authority",title:"A person reviews and confirms",body:"The responsible person corrects, assigns or stops it. Only then does the authorised action run with an inspectable result."},
      ],boundary:"Reference architecture — not a customer case, saving claim or live processing."},
      building:{ label:"Building",eyebrow:"From signal to controlled action",title:"A building signal becomes a contextual task.",intro:"AI can combine sensors, documentation and maintenance agreements without overruling safety or engineering authority.",steps:[
        {label:"01 · Signal",state:"Sensor + system fact",title:"An unusual pattern appears",body:"Occupancy, energy, temperature or equipment leaves its agreed range."},{label:"02 · Interpretation",state:"Derived by AI",title:"AI compares context and history",body:"The system links the reading to space use, manuals and known exceptions and shows what is verified, derived or unknown."},{label:"03 · System action",state:"Bounded automation",title:"A check is prepared",body:"A facilities task gets priority, location, source and proposed check — never an autonomous engineering intervention."},{label:"04 · Decision",state:"Human authority",title:"The operator chooses the next step",body:"The operator accepts, schedules a technician, adjusts the rule or records a legitimate exception."},
      ],boundary:"Reference architecture — physical installation and certified engineering work are scoped separately."},
      home:{ label:"Home",eyebrow:"From preference to private support",title:"A home responds to agreements, not isolated gadgets.",intro:"AI can support comfort, energy and safety with local or private processing where appropriate, while residents retain authority.",steps:[
        {label:"01 · Signal",state:"Resident choice + device",title:"A situation changes",body:"Presence, time, energy use or an explicit resident action forms the signal — never a hidden profile."},{label:"02 · Interpretation",state:"Derived by AI",title:"AI recognises the permitted context",body:"Only allowed data and household rules are used to create a proposal or warning."},{label:"03 · System action",state:"Bounded automation",title:"A scene or task is proposed",body:"Lighting, climate, notification or energy work is prepared or executed within configured limits."},{label:"04 · Decision",state:"Resident authority",title:"The resident can always intervene",body:"Explanation, manual control, stop and adjustment remain available. Safety-critical work requires explicit confirmation."},
      ],boundary:"Reference architecture — no medical inference; hardware and installation are partner-dependent and priced separately."},
    },
    beyondTitle:"What AIOW adds beyond a standalone AI model",beyondLead:"A model may understand language or images. Value appears only when it becomes a safe part of real work.",capabilities:["Understand documents and images","Connect systems and data","Monitor signals continuously","Prepare decisions","Execute bounded actions","Make results and failures inspectable"],
    scanEyebrow:"Concrete scan output",scanTitle:"You receive a decision-ready design, not an AI presentation.",scanLead:"The scan ends with one compact artefact for deciding what to build, prepare or deliberately not automate.",deliverables:["Current situation","Selected workflow or space","Verified inputs","Systems and dependencies","Human checkpoints","Exceptions and error impact","Recommended pilot","Explicit exclusions","Published price basis","Next decision"],
    ctaTitle:"Bring one process or one space.",ctaBody:"We show where AI genuinely helps, which connections are required and where human control must remain.",cta:"Request a scan",rates:"View rates and boundaries",
  },
};

export function CapabilitiesExperience({ locale="nl" }:{ locale?:AiowLocale }){
  const [mode,setMode]=useState<Mode>("process"); const t=content[locale]; const trace=t.modes[mode]; const en=locale==="en";
  return <div className={styles.site}><PublicHeader locale={locale}/><main>
    <header className={styles.hero}><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{t.title}</h1><p>{t.lead}</p><div className={styles.heroActions}><a href="#experience">{t.choose} ↓</a><Link href={en?"/en/scan":"/scan"}>{t.cta} ↗</Link></div></header>
    <section id="experience" className={styles.experience} aria-labelledby="experience-title">
      <div className={styles.experienceTop}><div><p className={styles.eyebrow}>{t.reference}</p><h2 id="experience-title" aria-live="polite">{trace.title}</h2><p>{trace.intro}</p></div><span>{trace.eyebrow}</span></div>
      <div className={styles.modeSwitch} aria-label={t.choose}>{(["process","building","home"] as Mode[]).map(key=><button key={key} type="button" aria-pressed={mode===key} aria-controls="capability-trace" onClick={()=>setMode(key)}>{t.modes[key].label}</button>)}</div>
      <ol id="capability-trace" className={styles.trace}>{trace.steps.map(step=><li key={step.label}><div className={styles.traceMeta}><span>{step.label}</span><em>{step.state}</em></div><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
      <p className={styles.boundary}>{trace.boundary}</p>
    </section>
    <section className={styles.beyond}><div><p className={styles.eyebrow}>{en?"Beyond chat":"Meer dan chat"}</p><h2>{t.beyondTitle}</h2><p>{t.beyondLead}</p></div><ol>{t.capabilities.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>
    <section className={styles.scan}><div><p className={styles.eyebrow}>{t.scanEyebrow}</p><h2>{t.scanTitle}</h2><p>{t.scanLead}</p></div><ol>{t.deliverables.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>
    <section className={styles.cta}><p className={styles.eyebrow}>{en?"Your starting point":"Uw startpunt"}</p><h2>{t.ctaTitle}</h2><p>{t.ctaBody}</p><div><Link href={en?"/en/scan":"/scan"}>{t.cta}</Link><Link href={en?"/en/rates":"/tarieven"}>{t.rates}</Link></div></section>
  </main><PublicFooter locale={locale} showYear/></div>;
}
