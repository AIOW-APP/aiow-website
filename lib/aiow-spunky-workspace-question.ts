import type { PublicCustomerAccount } from "./aiow-customer-accounts";
import type { VentureCanvasSnapshot, VentureDealCard, VentureMemoryEvent } from "./aiow-venture-memory";

export type SpunkyWorkspaceCardTitle = "Deal Card" | "Scope en risico" | "AIOW reactie" | "Spunky projectruimte";

export type SpunkyWorkspaceQuestionInput = {
  account: PublicCustomerAccount;
  cardTitle: SpunkyWorkspaceCardTitle;
  events: VentureMemoryEvent[];
  dealCard?: Partial<VentureDealCard> | null;
  canvas?: Partial<VentureCanvasSnapshot> | null;
};

export type SpunkyWorkspaceQuestion = {
  cardTitle: SpunkyWorkspaceCardTitle;
  question: string;
  whyThisQuestion: string;
  expectedImpact: string;
  nextCardState: "requested" | "needs-info" | "ready-for-review";
  automationLevel: "auto-question" | "admin-review" | "customer-answer-needed";
};

export function workspaceCardTitles(): SpunkyWorkspaceCardTitle[] {
  return ["Deal Card", "Scope en risico", "AIOW reactie", "Spunky projectruimte"];
}

export function isWorkspaceCardTitle(value: string): value is SpunkyWorkspaceCardTitle {
  return workspaceCardTitles().includes(value as SpunkyWorkspaceCardTitle);
}

export function generateSpunkyWorkspaceQuestion(input: SpunkyWorkspaceQuestionInput): SpunkyWorkspaceQuestion {
  const latestAnswer = latestWorkspaceAnswer(input.events, input.cardTitle);
  const combined = [
    input.account.projectName,
    input.account.projectType,
    input.account.companyName,
    input.account.analysisProfile?.coreOffer,
    input.account.analysisProfile?.painPoints,
    input.account.analysisProfile?.successMetrics,
    input.dealCard?.problem,
    input.dealCard?.opportunity,
    input.canvas?.problem,
    input.canvas?.aiOpportunities,
    latestAnswer,
  ].filter(Boolean).join("\n").toLowerCase();
  const missing = input.dealCard?.missing || [];

  if (input.cardTitle === "Deal Card") {
    if (missing.some((item) => item.includes("budget")) && !includesAny(combined, ["budget", "€", "euro", "retainer", "sprint"])) {
      return build(input, "Welke budgetrange voelt logisch voor een eerste AIOW proof sprint, en wanneer is die investering voor jou geslaagd?", "Budget ontbreekt nog. Zonder budget kan Team Richard geen realistische route kiezen tussen scan, proof sprint, build of growth partner.", "Team Richard kan sneller bepalen of dit een scan, proof sprint of venture-route moet worden.");
    }
    if (!includesAny(combined, ["klant", "lead", "loi", "pre-order", "preorder", "omzet", "gesprek", "demo"])) {
      return build(input, "Kun je één concreet bewijs delen dat deze klantvraag echt bestaat: warme lead, klantgesprek, omzet, LOI, pre-order of demo-aanvraag?", "Er is nog geen hard bewijs van vraag. Dat is meestal de grootste Go of No Go factor.", "De Deal Card wordt minder vaag en Team Richard kan de kans scherper beoordelen.");
    }
    if (!includesAny(combined, ["kpi", "30 dagen", "conversie", "gesprekken", "uren", "besparing", "omzet"] )) {
      return build(input, "Welke KPI moet binnen 30 dagen bewijzen dat deze eerste sprint waarde oplevert? Denk aan gesprekken, conversie, bespaarde uren, omzet of response time.", "De eerste meetbare KPI ontbreekt nog. Zonder KPI wordt de sprint te breed.", "AIOW kan de kleinste bewijsbare sprint kiezen in plaats van breed advies geven.");
    }
    return build(input, "Wat is het kleinste bewijs dat AIOW als eerste moet bouwen of meten om deze case te valideren?", "De basis is aanwezig. Nu moet Spunky de eerste proof sprint verkleinen.", "Minder scope, sneller bewijs en een duidelijkere eerste sprint.", "ready-for-review");
  }

  if (input.cardTitle === "Scope en risico") {
    if (!includesAny(combined, ["data", "crm", "systeem", "systemen", "database", "mail", "website", "analytics"])) {
      return build(input, "Welke data of systemen mag AIOW gebruiken voor analyse of automatisering? Noem ook wat juist buiten scope blijft.", "Databronnen en grenzen ontbreken. Dat blokkeert veilige AI-automatisering.", "Team Richard kan privacy, technische haalbaarheid en scope sneller inschatten.");
    }
    if (!includesAny(combined, ["privacy", "avg", "toestemming", "gevoelig", "betaal", "medisch", "contract", "geheim"])) {
      return build(input, "Zijn er privacygevoelige gegevens, betaalgegevens, contracten of andere grenzen waar AIOW expliciet van weg moet blijven?", "De veilige grens is nog niet scherp genoeg. Spunky moet dit vroeg ophalen.", "Minder risico op verkeerde aannames over data, privacy of livegang.");
    }
    return build(input, "Wie mag straks akkoord geven op scope, privacy en livegang?", "Beslisbevoegdheid bepaalt of het project kan versnellen of blijft hangen.", "Team Richard weet wie nodig is voor akkoord en voorkomt losse afstemming.");
  }

  if (input.cardTitle === "AIOW reactie") {
    if (input.account.status === "READY_FOR_SCOPE_REVIEW") {
      return build(input, "Wil je dat Team Richard vooral reageert met Go/No Go, risico's, contractroute of een voorstel voor de eerste proof sprint?", "De klant vraagt review, maar de gewenste reactie kan specifieker.", "Team Richard kan direct in de juiste beslismodus reageren.", "requested", "admin-review");
    }
    return build(input, "Wat wil je als eerste van AIOW terugkrijgen: een scherpe diagnose, een proof sprint voorstel, een dealroute of een risico-inschatting?", "De gewenste AIOW response bepaalt hoe we het vervolg simpeler maken.", "De klant krijgt geen generieke reactie maar de juiste volgende output.");
  }

  if (!includesAny(combined, ["workflow", "proces", "owner", "eigenaar", "kpi", "toegang", "crm", "telegram", "projectgroep"])) {
    return build(input, "Welke workflow moet Spunky als eerste helpen structureren zodra de projectruimte start? Noem owner, KPI en benodigde toegang als je die al weet.", "De projectruimte wordt pas waardevol als Spunky weet welke workflow als eerste strak moet.", "Na signing kan Spunky sneller starten met context, kickoff en taakverdeling.");
  }
  return build(input, "Welke eerste drie acties moet Spunky in de projectgroep bewaken zodat Team Richard sneller kan bouwen?", "De kickoff-context is deels aanwezig. Nu moet Spunky de eerste acties operationaliseren.", "De projectgroep start met duidelijke acties in plaats van losse chat.", "ready-for-review");
}

export function latestWorkspaceAnswer(events: VentureMemoryEvent[], cardTitle: string): string {
  const matching = events.filter((event) => event.content.includes(`Workspace card: ${cardTitle}`));
  return extractAnswer(matching.at(-1)?.content || "");
}

function build(
  input: SpunkyWorkspaceQuestionInput,
  question: string,
  whyThisQuestion: string,
  expectedImpact: string,
  nextCardState: SpunkyWorkspaceQuestion["nextCardState"] = "requested",
  automationLevel?: SpunkyWorkspaceQuestion["automationLevel"],
): SpunkyWorkspaceQuestion {
  return {
    cardTitle: input.cardTitle,
    question,
    whyThisQuestion,
    expectedImpact,
    nextCardState,
    automationLevel: automationLevel || (nextCardState === "ready-for-review" ? "admin-review" : "customer-answer-needed"),
  };
}

function extractAnswer(content: string): string {
  const marker = "Customer answer:";
  const index = content.indexOf(marker);
  if (index === -1) return "";
  return content.slice(index + marker.length).trim().slice(0, 1600);
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}
