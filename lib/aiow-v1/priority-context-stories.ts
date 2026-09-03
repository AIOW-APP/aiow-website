import type { AiowLocale } from "./locale";
import type { PricingContextSlug } from "./pricing-contexts";

export type PriorityContextStory = Readonly<{
  promise: string;
  current: string;
  withAiow: string;
  trace: readonly [string, string, string];
  humanDecision: string;
  scanQuestion: string;
}>;

type LocalizedStory = Readonly<{ nl: PriorityContextStory; en: PriorityContextStory }>;

export const PRIORITY_CONTEXT_SLUGS = ["accountants", "advocatuur", "makelaars", "kantoorpand", "woning", "villa-signature"] as const satisfies readonly PricingContextSlug[];

const stories: Record<(typeof PRIORITY_CONTEXT_SLUGS)[number], LocalizedStory> = {
  accountants: {
    nl: {
      promise: "Van losse cliëntstukken naar één dossier dat klaarstaat voor controle.",
      current: "Documenten komen via verschillende kanalen binnen. Medewerkers zoeken ontbrekende stukken uit, stellen dezelfde vragen opnieuw en bouwen handmatig een dossieroverzicht.",
      withAiow: "AIOW ordent toegestane stukken, markeert wat ontbreekt en zet een controleerbaar vraagconcept klaar. De accountant beoordeelt inhoud en verzending.",
      trace: ["Stukken ontvangen", "Dossier en ontbrekende informatie voorbereid", "Accountant controleert en verstuurt"],
      humanDecision: "Vaktechnische beoordeling, cliëntadvies, boeking en verzending blijven bij bevoegde medewerkers.",
      scanQuestion: "Welke terugkerende dossierintake kost uw team nu de meeste handmatige controle?",
    },
    en: {
      promise: "From scattered client documents to one file ready for review.",
      current: "Documents arrive through different channels. Staff identify missing items, repeat the same questions and assemble the file overview manually.",
      withAiow: "AIOW organises authorised documents, flags what is missing and prepares a reviewable question draft. The accountant controls content and sending.",
      trace: ["Documents received", "File and missing information prepared", "Accountant reviews and sends"],
      humanDecision: "Professional assessment, client advice, bookkeeping and sending remain with authorised staff.",
      scanQuestion: "Which recurring file intake currently costs your team the most manual checking?",
    },
  },
  advocatuur: {
    nl: {
      promise: "Van zoeken in een dossier naar een brongebonden tijdlijn en conceptoverzicht.",
      current: "Relevante feiten, versies en open vragen zitten verspreid over documenten en correspondentie. Controle kost tijd en context raakt makkelijk uit beeld.",
      withAiow: "AIOW ordent uitsluitend geautoriseerde bronnen, koppelt feiten terug naar het document en zet onzekerheden apart voor beoordeling.",
      trace: ["Geautoriseerde stukken geselecteerd", "Tijdlijn en bronlinks voorbereid", "Jurist beoordeelt en bepaalt gebruik"],
      humanDecision: "Juridische duiding, conflictbesluit, advies en externe communicatie worden nooit autonoom uitgevoerd.",
      scanQuestion: "Bij welk dossierwerk ontstaat de meeste zoektijd zonder dat juridisch oordeel mag worden uitbesteed?",
    },
    en: {
      promise: "From searching a matter to a source-linked timeline and draft overview.",
      current: "Relevant facts, versions and open questions are spread across documents and correspondence. Review takes time and context is easily lost.",
      withAiow: "AIOW organises authorised sources only, links facts back to documents and separates uncertainty for professional review.",
      trace: ["Authorised documents selected", "Timeline and source links prepared", "Lawyer reviews and decides its use"],
      humanDecision: "Legal interpretation, conflict decisions, advice and external communication are never executed autonomously.",
      scanQuestion: "Which matter workflow creates the most search time without outsourcing legal judgement?",
    },
  },
  makelaars: {
    nl: {
      promise: "Van versnipperde objectinformatie naar een complete voorbereiding voor publicatie en opvolging.",
      current: "Objectgegevens, bewijsstukken en vragen komen verspreid binnen. Ontbrekende informatie wordt vaak pas laat zichtbaar en opvolging hangt van losse notities af.",
      withAiow: "AIOW structureert de intake, signaleert ontbrekend bewijs en zet bezichtigingsvragen als controleerbare taken en antwoordconcepten klaar.",
      trace: ["Object en stukken aangeleverd", "Ontbrekend bewijs en opvolging voorbereid", "Makelaar controleert en publiceert"],
      humanDecision: "Objectpublicatie, waardering, toezeggingen en klantcommunicatie blijven bij de makelaar.",
      scanQuestion: "Waar verliest uw kantoor nu de meeste tijd tussen objectintake en publicatie?",
    },
    en: {
      promise: "From scattered property information to a complete preparation for publication and follow-up.",
      current: "Property data, evidence and questions arrive separately. Missing information often appears late and follow-up depends on loose notes.",
      withAiow: "AIOW structures the intake, flags missing evidence and prepares viewing questions as reviewable tasks and response drafts.",
      trace: ["Property and documents supplied", "Missing evidence and follow-up prepared", "Agent reviews and publishes"],
      humanDecision: "Publication, valuation, commitments and client communication remain with the estate agent.",
      scanQuestion: "Where does your office lose most time between property intake and publication?",
    },
  },
  kantoorpand: {
    nl: {
      promise: "Van losse gebouwmeldingen naar één begrijpelijke facilitaire actieroute.",
      current: "Klimaat-, bezettings- en storingssignalen staan in afzonderlijke systemen. De beheerder moet betekenis, locatie en opvolging zelf samenbrengen.",
      withAiow: "AIOW bundelt beschikbare signalen, voegt ruimte- en assetcontext toe en stelt een begrensde facilitaire actie of escalatie voor.",
      trace: ["Afwijking uit toegestaan systeem", "Context en actievoorstel voorbereid", "Beheerder kiest en wijst toe"],
      humanDecision: "De beheerder bepaalt prioriteit en uitvoering; gecertificeerde installatie en gebouwbesturing blijven bij bevoegde partners.",
      scanQuestion: "Welke gebouwmelding vraagt nu telkens handmatig uitzoekwerk voordat iemand kan handelen?",
    },
    en: {
      promise: "From isolated building alerts to one understandable facilities action route.",
      current: "Climate, occupancy and fault signals live in separate systems. The operator must combine meaning, location and follow-up manually.",
      withAiow: "AIOW combines available signals, adds room and asset context and proposes a bounded facilities action or escalation.",
      trace: ["Deviation from an authorised system", "Context and action proposal prepared", "Operator chooses and assigns"],
      humanDecision: "The operator decides priority and execution; certified installation and building control remain with qualified partners.",
      scanQuestion: "Which building alert repeatedly needs manual investigation before anyone can act?",
    },
  },
  woning: {
    nl: {
      promise: "Van losse slimme apparaten naar huisregels die u begrijpt en altijd kunt overrulen.",
      current: "Verlichting, klimaat, beveiliging en energie werken naast elkaar. Automatiseringen zijn kwetsbaar, onduidelijk of alleen via verschillende apps te bedienen.",
      withAiow: "AIOW verbindt ondersteunde systemen rond begrijpelijke huisregels, bewaakt uitzonderingen en houdt handmatige bediening beschikbaar.",
      trace: ["Uw regel of toegestaan signaal", "Woonactie binnen ingestelde grenzen", "Bewoner kan bevestigen, wijzigen of stoppen"],
      humanDecision: "Toegang, privacygevoelige acties en uitzonderingen blijven onder controle van bewoners; fysieke installatie blijft bij de installateur.",
      scanQuestion: "Welke dagelijkse woonroutine moet eenvoudiger worden zonder dat uw huis onvoorspelbaar wordt?",
    },
    en: {
      promise: "From separate smart devices to house rules you understand and can always override.",
      current: "Lighting, climate, security and energy systems operate alongside each other. Automations are fragile, unclear or spread across different apps.",
      withAiow: "AIOW connects supported systems around understandable house rules, monitors exceptions and keeps manual control available.",
      trace: ["Your rule or authorised signal", "Home action within set boundaries", "Resident can confirm, change or stop"],
      humanDecision: "Access, privacy-sensitive actions and exceptions remain under resident control; physical installation stays with the installer.",
      scanQuestion: "Which daily home routine should become easier without making your home unpredictable?",
    },
  },
  "villa-signature": {
    nl: {
      promise: "Van luxe subsystemen naar één rustige regielaag voor woning, huishouden en privéleven.",
      current: "Klimaat, licht, media, beveiliging, planning en woningdocumentatie hebben ieder een eigen bediening, leverancier en overdrachtsmoment.",
      withAiow: "AIOW maakt een begrensde regielaag met woonmodi, status, uitzonderingen en goedkeuringsroutes—zonder onzichtbare autonomie.",
      trace: ["Woonmodus of geautoriseerd verzoek", "Systemen en afhankelijkheden gecoördineerd", "Eigenaar of aangewezen persoon beslist"],
      humanDecision: "Beveiliging, betalingen, adviseursinstructies en uitzonderingen vereisen expliciete menselijke autoriteit.",
      scanQuestion: "Welke woning- of privéprocessen moeten samenkomen zonder controle of discretie te verliezen?",
    },
    en: {
      promise: "From luxury subsystems to one calm control layer for home, household and private life.",
      current: "Climate, lighting, media, security, planning and property documents each have their own controls, supplier and handover moments.",
      withAiow: "AIOW creates a bounded control layer with living modes, status, exceptions and approval routes—without invisible autonomy.",
      trace: ["Living mode or authorised request", "Systems and dependencies coordinated", "Owner or appointed person decides"],
      humanDecision: "Security, payments, adviser instructions and exceptions require explicit human authority.",
      scanQuestion: "Which home or private-life processes should come together without losing control or discretion?",
    },
  },
};

export function getPriorityContextStory(slug: PricingContextSlug, locale: AiowLocale): PriorityContextStory | undefined {
  return stories[slug as keyof typeof stories]?.[locale];
}
