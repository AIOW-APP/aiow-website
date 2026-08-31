import Link from "next/link";
import { InfoPage } from "./InfoPage";

export const ventureScoreKnowledge = {
  nl: {
    eyebrow: "AIOW kennis · Ventures",
    title: "Laat een startup-idee beoordelen met een venture-score.",
    lead: "De AIOW venture-score ordent bewijs en risico over zeven dimensies. De score ondersteunt een menselijke selectie; hij is geen automatische acceptatie, investeringsbesluit of succesgarantie.",
    sections: [
      { title: "De zeven dimensies", items: ["Founder: domeinkennis, inzet, verkoopkracht en uitvoeringsdiscipline.", "Markt: aantoonbare urgentie, bereikbare kopers en betalingsbereidheid.", "Probleem en oplossing: recente klantvoorbeelden en een scherp afgebakende uitkomst.", "AI-hefboom: waarom AI structureel betere kwaliteit, snelheid of economie kan leveren.", "Tractie: betalende klanten, pilots of ander controleerbaar marktbewijs.", "Bouwbaarheid: data, integraties, veiligheid, foutimpact en beheerbaarheid.", "Dealkwaliteit: heldere rollen, investering, risico, eigendom, looptijd en exit."] },
      { title: "Bewijs vóór enthousiasme", paragraphs: ["Een overtuigende pitch, wachtlijst of gratis pilot kan nuttig zijn, maar bewijst niet hetzelfde als een bevoegde klant die bewust betaalt. AIOW zoekt daarom ook actief naar tegenbewijs: ontbrekende data, onbereikbare kopers, privacyrisico, onduidelijke verantwoordelijkheid of een businesscase die alleen op geschatte tijdwinst rust.", "De uitkomst kan een gemotiveerde afwijzing, extra validatie, een afzonderlijk geprijsde scan of pilot, of verdere venture-diligence zijn. Geen van die uitkomsten ontstaat automatisch uit een modelscore."] },
      { title: "Menselijke beslisgate", paragraphs: ["Een bevoegde AIOW-beslisser beoordeelt de onderliggende feiten, onzekerheden en voorgestelde samenwerking. AI mag informatie structureren en inconsistenties signaleren, maar verleent geen contract, productie-GO, betaling, investering of bindend voorstel."] },
      { title: "Wat je veilig kunt aanleveren", paragraphs: [<>Begin via de <Link href="/#booking">publieke scan-/bookingroute</Link> met het concrete klantprobleem, de beslisser, huidig bewijs, benodigde data, foutimpact en jouw eigen rol. Deel geen gevoelige klant-, personeels-, financiële of accountgegevens in vrije tekst. De publieke intake valt onder het <Link href="/privacy">privacybeleid</Link>; aanvullende vertrouwelijkheid en toegang worden pas in een afzonderlijke vervolgstap vastgelegd.</>] },
      { title: "Veelgestelde vragen", cards: [
        { title: "Is een hoge score een acceptatie?", body: "Nee. De score ordent bewijs en risico. Een menselijke beoordeling en afzonderlijke commerciële afspraak blijven noodzakelijk." },
        { title: "Is een afwijzing definitief?", body: "Niet altijd. Een afwijzing hoort aan te geven welk bewijs, welke focus of welke risicoreductie het oordeel kan veranderen." },
        { title: "Is omzetdeling standaard?", body: "Nee. Ventures heeft altijd een afzonderlijke afspraak over rollen, investering, risico, opbrengst, eigendom en exit." },
        { title: "Wordt mijn idee automatisch gebouwd?", body: "Nee. Eerst wordt vastgesteld of het probleem, bewijs, team en risicomodel sterk genoeg zijn voor een volgende stap." },
      ] },
    ],
    footer: "Inhoudelijk herijkt op 31 augustus 2026 · geen juridisch, fiscaal of investeringsadvies.",
  },
  en: {
    eyebrow: "AIOW knowledge · Ventures",
    title: "Assess a startup idea with a venture score.",
    lead: "The AIOW venture score organises evidence and risk across seven dimensions. It supports human selection; it is not automatic acceptance, an investment decision or a success guarantee.",
    sections: [
      { title: "The seven dimensions", items: ["Founder: domain knowledge, commitment, sales ability and execution discipline.", "Market: proven urgency, reachable buyers and willingness to pay.", "Problem and solution: recent customer examples and a narrowly defined outcome.", "AI leverage: why AI can structurally improve quality, speed or economics.", "Traction: paying customers, pilots or other verifiable market evidence.", "Buildability: data, integrations, security, error impact and maintainability.", "Deal quality: clear roles, investment, risk, ownership, duration and exit."] },
      { title: "Evidence before enthusiasm", paragraphs: ["A convincing pitch, waitlist or free pilot can be useful, but it is not the same evidence as an authorised customer deliberately paying. AIOW therefore also searches for counter-evidence: unavailable data, unreachable buyers, privacy risk, unclear responsibility or a business case based only on estimated time savings.", "The outcome may be a reasoned rejection, more validation, a separately priced scan or pilot, or further venture diligence. None of these outcomes is granted automatically by a model score."] },
      { title: "Human decision gate", paragraphs: ["An authorised AIOW decision-maker reviews the underlying facts, uncertainties and proposed collaboration. AI may structure information and flag inconsistencies, but it does not grant a contract, production approval, payment, investment or binding proposal."] },
      { title: "What you can submit safely", paragraphs: [<>Start through the <Link href="/en#booking">public scan/booking route</Link> with the specific customer problem, decision-maker, current evidence, required data, error impact and your own role. Do not place sensitive customer, employee, financial or account data in free text. Public intake is governed by the <Link href="/en/privacy">privacy policy</Link>; additional confidentiality and access are established only in a separate follow-up step.</>] },
      { title: "Frequently asked questions", cards: [
        { title: "Does a high score mean acceptance?", body: "No. The score organises evidence and risk. Human review and a separate commercial agreement remain necessary." },
        { title: "Is a rejection final?", body: "Not always. A rejection should identify which evidence, focus or risk reduction could change the assessment." },
        { title: "Is revenue sharing standard?", body: "No. Ventures always requires a separate agreement covering roles, investment, risk, returns, ownership and exit." },
        { title: "Will my idea be built automatically?", body: "No. AIOW first determines whether the problem, evidence, team and risk model justify a next step." },
      ] },
    ],
    footer: "Content recalibrated on 31 August 2026 · not legal, tax or investment advice.",
  },
} as const;

export function KnowledgeHub({ locale }: { locale: "nl" | "en" }) {
  const en = locale === "en";
  return <InfoPage locale={locale} eyebrow={en ? "AIOW knowledge" : "AIOW kennis"} title={en ? "Evidence before AI promises." : "Bewijs vóór AI-beloftes."} lead={en ? "Practical explanations of AIOW's process, product and venture decisions, with explicit evidence and authority boundaries." : "Praktische uitleg over AIOW-processen, producten en venturebesluiten, met expliciete bewijs- en bevoegdheidsgrenzen."} sections={[{
    title: en ? "Venture assessment" : "Venturebeoordeling",
    cards: [{ title: en ? "Assess a startup idea with a venture score" : "Startup-idee laten beoordelen met een venture-score", body: <>{en ? "Seven dimensions, counter-evidence and a mandatory human decision gate." : "Zeven dimensies, tegenbewijs en een verplichte menselijke beslisgate."} <Link href={en ? "/en/knowledge/startup-idea-venture-score" : "/nl/kennis/startup-idee-laten-beoordelen-venture-score"}>{en ? "Read the explanation" : "Lees de uitleg"}</Link>.</> }],
  }, { title: en ? "Publishing standard" : "Publicatiestandaard", paragraphs: [en ? "AIOW publishes only material that matches the current product, pricing, privacy and authority contracts. Older knowledge pages remain unavailable until they have passed that review." : "AIOW publiceert alleen materiaal dat aansluit op de actuele product-, prijs-, privacy- en bevoegdheidscontracten. Oudere kennispagina’s blijven uit totdat zij die herijking hebben doorstaan."] }]} footer={en ? "Knowledge contract restored on 31 August 2026." : "Kenniscontract hersteld op 31 augustus 2026."} />;
}

export function VentureScoreKnowledgePage({ locale }: { locale: "nl" | "en" }) { return <InfoPage locale={locale} {...ventureScoreKnowledge[locale]} />; }
