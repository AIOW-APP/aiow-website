"use client";

import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../AiowPortal.module.css";

type Account = {
  accountId: string;
  createdAt: string;
  status: string;
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  projectName: string;
  projectType: string;
  moduleInterests: string[];
  addOns: string[];
  aiowRevenueSharePercent: number;
  moduleRevenueModel: string;
  analysisProfile: Record<string, string>;
  analysisReadinessScore: number;
  analysis: {
    successProbabilityScore: number;
    uniquenessScore: number;
    ventureFitScore: number;
    verdict: string;
    recommendedRevenueSharePercent: number;
    recommendedResaleSharePercent: number;
    recommendedModuleTerms: string;
    requiredCustomerProof: string[];
    firstSprintRecommendation: string;
  };
  productionBoundary: string;
  paymentState: string;
  customerNextSteps: string[];
  aiowNextSteps: string[];
  onboardingId?: string;
};

type LifecycleView = {
  label: string;
  headline: string;
  detail: string;
  primaryAction: string;
  stage: number;
  tone: "intake" | "review" | "contract" | "signed" | "spunky" | "build";
};

const lifecycleStages = ["Intake", "Review", "Contract", "Signed", "Spunky room", "Build sprint"] as const;

function lifecycleView(status: string): LifecycleView {
  if (status === "READY_FOR_SCOPE_REVIEW") return {
    label: "Review aangevraagd",
    headline: "Team Richard beoordeelt je Deal Card.",
    detail: "AIOW kijkt nu naar scope, bewijs, dealfit, risico's en eerste proof sprint. Productie start nog niet.",
    primaryAction: "Wacht op besluit of lever ontbrekend bewijs aan.",
    stage: 2,
    tone: "review",
  };
  if (status.startsWith("ADMIN_DECISION_")) return {
    label: "AIOW besluit genomen",
    headline: "Je aanvraag is beoordeeld.",
    detail: "Team Richard heeft een route gekozen. Als de case doorgaat volgt contract, extra vragen of aangepaste scope.",
    primaryAction: "Bekijk de volgende stappen en reageer op ontbrekende informatie.",
    stage: 2,
    tone: "review",
  };
  if (status === "CONTRACT_DRAFTED" || status === "CONTRACT_SENT") return {
    label: "Contractfase",
    headline: "AIOW voorstel en voorwaarden staan centraal.",
    detail: "Controleer scope, commerciële basis, verantwoordelijkheden en voorwaarden voordat je tekent.",
    primaryAction: "Onderteken alleen als scope en afspraken kloppen.",
    stage: 3,
    tone: "contract",
  };
  if (status === "SIGNED") return {
    label: "Akkoord getekend",
    headline: "De AIOW operating setup wordt voorbereid.",
    detail: "Na signing bereidt Team Richard de private projectruimte voor met Spunky als contextcollector.",
    primaryAction: "Wacht op de private projectgroep en verzamel alvast databronnen, KPI en beslisser.",
    stage: 4,
    tone: "signed",
  };
  if (status === "SPUNKY_HANDOFF_READY") return {
    label: "Spunky handoff ready",
    headline: "Je projectgroep staat klaar om voorbereid te worden.",
    detail: "Team Richard maakt de Telegram intro, interne Spunky briefing en kickoff checklist klaar.",
    primaryAction: "Bereid je eerste workflow, databronnen en praktische beperkingen voor.",
    stage: 5,
    tone: "spunky",
  };
  if (status === "SPUNKY_PROJECT_GROUP_PREPARED") return {
    label: "Projectgroep voorbereid",
    headline: "De private AIOW projectruimte is voorbereid.",
    detail: "Spunky helpt met context verzamelen en vragen structureren. Team Richard bewaakt scope, planning, privacy, prijs en livegang.",
    primaryAction: "Gebruik de projectgroep voor context, vragen en bewijs. Geen livegang zonder Team Richard akkoord.",
    stage: 5,
    tone: "spunky",
  };
  return {
    label: "Intake actief",
    headline: "Maak je AIOW Deal Card sterker.",
    detail: "Vul context aan zodat AIOW kan beoordelen of samenwerking, proof sprint of build logisch is.",
    primaryAction: "Vul de guided intake aan en vraag daarna review aan.",
    stage: 1,
    tone: "intake",
  };
}

function isOperatingPhase(status: string): boolean {
  return ["SIGNED", "SPUNKY_HANDOFF_READY", "SPUNKY_PROJECT_GROUP_PREPARED"].includes(status);
}

type DealCard = {
  title?: string;
  founder?: string;
  company?: string;
  problem?: string;
  opportunity?: string;
  likelyRoute?: string;
  missing?: string[];
  nextStep?: string;
  confidence?: number;
  memoryEventCount?: number;
  updatedAt?: string;
};

type VentureCanvas = {
  project?: string;
  founder?: string;
  problem?: string;
  solution?: string;
  businessModel?: string;
  audience?: string;
  aiOpportunities?: string;
  risk?: string;
  automation?: string;
  growth?: string;
  collaboration?: string;
  confidence?: number;
  marketScore?: number;
  riskScore?: number;
  aiScore?: number;
  automationScore?: number;
  memoryEventCount?: number;
};

type MemoryEvent = {
  id: string;
  role: "user" | "ai" | "system";
  type: string;
  content: string;
  createdAt: string;
};

type VentureMemoryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; dealCard: DealCard | null; canvas: VentureCanvas | null; events: MemoryEvent[]; storageMode?: string }
  | { status: "error"; message: string };

type CustomerProofStep = {
  id: string;
  createdAt: string;
  label: string;
  detail: string;
  state: "done" | "active" | "waiting";
};

type CustomerProofState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; steps: CustomerProofStep[] }
  | { status: "error"; message: string };

type WorkspaceCardState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "saved"; message: string; nextQuestion: string }
  | { status: "error"; message: string };

type LoadState =
  | { status: "locked" }
  | { status: "loading" }
  | { status: "loaded"; account: Account }
  | { status: "error"; message: string };

type IntakeState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; onboardingId: string }
  | { status: "error"; message: string };

type IntakeField = {
  name: string;
  label: string;
  placeholder: string;
  kind?: "input" | "textarea";
  wide?: boolean;
};

type IntakeStep = {
  eyebrow: string;
  title: string;
  aiPrompt: string;
  why: string;
  fields: IntakeField[];
  chips: string[];
};

const intakeSteps: IntakeStep[] = [
  {
    eyebrow: "Stap 01 / 10",
    title: "Wat is de kans of het bedrijf?",
    aiPrompt: "Begin simpel. Vertel wat je bouwt of verkoopt, voor wie het is, en waarom dit nu belangrijk is.",
    why: "Hiermee kan AIOW de kernpropositie en founder/company fit beoordelen.",
    chips: ["pitch", "doelgroep", "context"],
    fields: [
      { name: "ideaSummary", label: "Korte pitch", kind: "textarea", wide: true, placeholder: "Wij willen/bouwen/verkopen... Voor deze doelgroep... Het probleem is..." },
      { name: "coreOffer", label: "Aanbod / waardepropositie", kind: "textarea", wide: true, placeholder: "Wat krijgt de klant concreet, en waarom zou iemand ervoor betalen?" },
    ],
  },
  {
    eyebrow: "Stap 02 / 10",
    title: "Wie zit erachter?",
    aiPrompt: "AIOW moet weten of het team dit kan dragen. Ervaring, netwerk en snelheid tellen zwaarder dan mooie woorden.",
    why: "Input voor Founder Score en Execution Score.",
    chips: ["founder score", "track record"],
    fields: [
      { name: "founderExperience", label: "Ervaring / track record", kind: "textarea", wide: true, placeholder: "Relevante ervaring, eerdere bedrijven, branchekennis, verkoopervaring, teamleden..." },
      { name: "industryContacts", label: "Branchecontacten / distributie", kind: "textarea", wide: true, placeholder: "Welke warme contacten, klanten, partners of kanalen zijn er al?" },
    ],
  },
  {
    eyebrow: "Stap 03 / 10",
    title: "Is er echte vraag?",
    aiPrompt: "Geen 100 vragen: alleen bewijs. Wie heeft al interesse getoond, betaald, gevraagd, geklaagd of gewacht op deze oplossing?",
    why: "Input voor Market Score en proof sprint prioriteit.",
    chips: ["vraagbewijs", "markt"],
    fields: [
      { name: "proofOfDemand", label: "Bewijs dat mensen willen betalen", kind: "textarea", wide: true, placeholder: "Klanten, gesprekken, LOI's, offerteaanvragen, omzet, wachtlijst, screenshots, mails..." },
      { name: "customerSegments", label: "Klantsegmenten", kind: "textarea", wide: true, placeholder: "Welke typen klanten hebben dit probleem het sterkst?" },
    ],
  },
  {
    eyebrow: "Stap 04 / 10",
    title: "Hoe groeit dit?",
    aiPrompt: "AIOW kijkt niet alleen naar bouwen. We kijken of distributie, marketing en sales te automatiseren zijn.",
    why: "Input voor growth route en dealmodel.",
    chips: ["sales", "growth", "channels"],
    fields: [
      { name: "acquisitionChannels", label: "Acquisitiekanalen", kind: "textarea", wide: true, placeholder: "LinkedIn, SEO, referrals, partnerships, outbound, bestaande klanten, marketplaces..." },
      { name: "successMetrics", label: "Succesmetrics", kind: "textarea", wide: true, placeholder: "Welke KPI bewijst na 30 dagen dat dit werkt? Leads, demo's, omzet, tijdwinst, marge..." },
    ],
  },
  {
    eyebrow: "Stap 05 / 10",
    title: "Welke cijfers zijn relevant?",
    aiPrompt: "Vul alleen de cijfers in die je veilig kunt delen. Schattingen zijn beter dan niets; bewijs volgt later.",
    why: "Input voor Investment Score, revenue-share advies en upside.",
    chips: ["omzet", "target", "upside"],
    fields: [
      { name: "currentMonthlyRevenue", label: "Huidige maandelijkse omzet", placeholder: "Bijv. €12.000 of nog €0" },
      { name: "targetMonthlyRevenue", label: "Doelomzet / potentie", placeholder: "Bijv. €50.000/mnd binnen 12 maanden" },
      { name: "resalePotential", label: "Doorverkoop / white-label potentie", kind: "textarea", wide: true, placeholder: "Kan dit later als module, white-label, licentie of reseller-model verkocht worden?" },
    ],
  },
  {
    eyebrow: "Stap 06 / 10",
    title: "Welke systemen en data zijn er?",
    aiPrompt: "Dit bepaalt of we snel kunnen automatiseren of eerst moeten opruimen. Geen perfecte lijst nodig.",
    why: "Input voor technische haalbaarheid en eerste integraties.",
    chips: ["data", "CRM", "tools"],
    fields: [
      { name: "systemsStack", label: "Systemen/tools", kind: "textarea", wide: true, placeholder: "Website, CRM, boekhouding, sheets, inbox, WhatsApp, Telegram, planning, database..." },
      { name: "dataSources", label: "Databronnen/documenten", kind: "textarea", wide: true, placeholder: "Documenten, klantlijsten, FAQ, offertes, contracten, productdata, cases..." },
    ],
  },
  {
    eyebrow: "Stap 07 / 10",
    title: "Waar zit de frictie?",
    aiPrompt: "Vertel waar tijd, geld of kwaliteit lekt. AIOW zoekt de automation advantage: wat wordt simpeler door AI?",
    why: "Input voor Automation Advantage en eerste sprint scope.",
    chips: ["frictie", "automatisering"],
    fields: [
      { name: "painPoints", label: "Knelpunten", kind: "textarea", wide: true, placeholder: "Wat kost nu te veel tijd? Waar gaan leads, klanten of marge verloren?" },
      { name: "manualWork", label: "Handmatig werk", kind: "textarea", wide: true, placeholder: "Welke taken herhalen mensen elke week die AI/software kan overnemen of voorbereiden?" },
    ],
  },
  {
    eyebrow: "Stap 08 / 10",
    title: "Wat moet AIOW bouwen?",
    aiPrompt: "Denk in uitkomst, niet in features. Wat moet de klant, medewerker of eigenaar straks makkelijker kunnen doen?",
    why: "Input voor build scope, modulekeuze en sprint planning.",
    chips: ["scope", "AI build"],
    fields: [
      { name: "aiowBuildScope", label: "Wat moet AIOW bouwen?", kind: "textarea", wide: true, placeholder: "Agent, portal, dashboard, CRM-flow, intake, offerte-automatisering, support, marketing machine..." },
      { name: "customerResponsibilities", label: "Wat kan/wil de klant zelf leveren?", kind: "textarea", wide: true, placeholder: "Content, data, klantintro's, domeinkennis, feedback, sales opvolging..." },
    ],
  },
  {
    eyebrow: "Stap 09 / 10",
    title: "Risico's en grenzen",
    aiPrompt: "Sterke deals benoemen risico's vroeg. Privacy, compliance, afhankelijkheid, toestemming, reputatie en scope horen vóór livegang op tafel.",
    why: "Input voor risk review en voorwaarden-gate.",
    chips: ["risico", "privacy", "approval"],
    fields: [
      { name: "risks", label: "Risico's", kind: "textarea", wide: true, placeholder: "Juridisch, privacy, datakwaliteit, teamcapaciteit, klantbelofte, reputatie, afhankelijkheid..." },
      { name: "dataBoundaries", label: "Datagrens / approval", kind: "textarea", wide: true, placeholder: "Wat mag AI wel/niet zien of doen? Waar is menselijke goedkeuring verplicht?" },
    ],
  },
  {
    eyebrow: "Stap 10 / 10",
    title: "Wat is de beste eerste proof?",
    aiPrompt: "Laatste stap: kies het kleinste bewijs dat AIOW en jij allebei vertrouwen geeft om door te bouwen.",
    why: "Input voor eerste 30-dagen sprint en Go/Conditional Go.",
    chips: ["proof sprint", "next action"],
    fields: [
      { name: "firstProof", label: "Eerste proof", kind: "textarea", wide: true, placeholder: "Bijv. 10 salesgesprekken, werkende demo, 1 geautomatiseerd proces, eerste klant, KPI-dashboard..." },
      { name: "openQuestions", label: "Open vragen aan AIOW", kind: "textarea", wide: true, placeholder: "Waar wil je dat AIOW specifiek naar kijkt of advies over geeft?" },
    ],
  },
];

export function CustomerPortalView({ accountId }: { accountId: string }) {
  const [accessCode, setAccessCode] = useState("");
  const [loadState, setLoadState] = useState<LoadState>({ status: "locked" });

  useEffect(() => {
    const storedAccountId = localStorage.getItem("aiow:lastAccountId");
    const storedCode = localStorage.getItem("aiow:lastAccessCode");
    if (storedAccountId === accountId && storedCode) setAccessCode(storedCode);
  }, [accountId]);

  async function loadAccount(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoadState({ status: "loading" });
    try {
      const response = await fetch(`/api/customer-accounts?accountId=${encodeURIComponent(accountId)}&accessCode=${encodeURIComponent(accessCode)}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Geen toegang tot dit account.");
      localStorage.setItem("aiow:lastAccountId", accountId);
      localStorage.setItem("aiow:lastAccessCode", accessCode);
      window.dispatchEvent(new Event("aiow:account-state-changed"));
      setLoadState({ status: "loaded", account: data.account });
    } catch (error) {
      setLoadState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className={styles.shell}>
      {loadState.status !== "loaded" && (
        <form onSubmit={loadAccount} className={styles.loginForm}>
          <div className={styles.aiGuide}>
            <div className={styles.aiAvatar}>AI</div>
            <div>
              <strong>Open je private AIOW cockpit.</strong>
              <p>Na inloggen begeleid ik je stap voor stap door precies de informatie die onze beoordeling sterker maakt.</p>
            </div>
          </div>
          <label className={styles.field}>
            <span>Toegangscode</span>
            <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required placeholder="AIOW-XXXXXX-XXXXXX" className={styles.input} />
          </label>
          <button type="submit" disabled={loadState.status === "loading"} className={styles.primaryButton}>{loadState.status === "loading" ? "Laden..." : "Open portaal"}</button>
          {loadState.status === "error" && <div className={styles.error}>{loadState.message}</div>}
        </form>
      )}

      {loadState.status === "loaded" && <AccountDashboard account={loadState.account} accessCode={accessCode} />}
    </div>
  );
}

function AccountDashboard({ account, accessCode }: { account: Account; accessCode: string }) {
  const [currentAccount, setCurrentAccount] = useState(account);
  const [reviewState, setReviewState] = useState<{ status: "idle" | "submitting" | "success" | "error"; message?: string }>({ status: "idle" });
  const [proofState, setProofState] = useState<CustomerProofState>({ status: "idle" });
  const [memoryState, setMemoryState] = useState<VentureMemoryState>({ status: "idle" });
  const requiredProof = currentAccount.analysis?.requiredCustomerProof?.length ? currentAccount.analysis.requiredCustomerProof : ["Klantvraag of eerste verkoopbewijs", "Systeem-/datatoegang overzicht", "Eerste KPI voor proof sprint"];
  const lifecycle = lifecycleView(currentAccount.status);
  const operatingPhase = isOperatingPhase(currentAccount.status);

  useEffect(() => {
    setCurrentAccount(account);
  }, [account]);

  useEffect(() => {
    setProofState({ status: "loading" });
    fetch(`/api/customer-proof?accountId=${encodeURIComponent(currentAccount.accountId)}&accessCode=${encodeURIComponent(accessCode)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Proof summary niet beschikbaar")))
      .then((data) => setProofState({ status: "loaded", steps: Array.isArray(data.steps) ? data.steps : [] }))
      .catch((error) => setProofState({ status: "error", message: error instanceof Error ? error.message : "Proof summary kon niet laden" }));
  }, [currentAccount.accountId, currentAccount.status, accessCode]);

  const loadVentureMemory = useCallback((sessionId = currentAccount.onboardingId || currentAccount.accountId) => {
    if (!sessionId) {
      setMemoryState({ status: "idle" });
      return;
    }
    setMemoryState({ status: "loading" });
    fetch(`/api/venture-memory/session?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Venture Memory niet gevonden")))
      .then((data) => setMemoryState({
        status: "loaded",
        dealCard: data.dealCard || null,
        canvas: data.canvas || data.ventureSnapshot || null,
        events: Array.isArray(data.events) ? data.events : [],
        storageMode: data.storageMode,
      }))
      .catch((error) => setMemoryState({ status: "error", message: error instanceof Error ? error.message : "Venture Memory kon niet laden" }));
  }, [currentAccount.accountId, currentAccount.onboardingId]);

  useEffect(() => {
    loadVentureMemory();
  }, [loadVentureMemory]);

  async function requestReview() {
    setReviewState({ status: "submitting" });
    try {
      const response = await fetch("/api/customer-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: currentAccount.accountId,
          accessCode,
          action: "request_scope_review",
          note: "Klant heeft via private workspace scope review aangevraagd.",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Review-aanvraag kon niet worden opgeslagen.");
      setCurrentAccount(data.account);
      setProofState({ status: "loading" });
      setReviewState({ status: "success", message: data.message || "AIOW scope review aangevraagd." });
    } catch (error) {
      setReviewState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className={styles.stepLayout}>
      <div className={styles.dashboardHeader}>
        <div>
          <span className={styles.statusBadge}>{currentAccount.status}</span>
          <h2>{currentAccount.companyName}</h2>
          <p className={styles.muted}>{currentAccount.projectName} · {currentAccount.projectType}</p>
        </div>
        <div className={styles.warning}><strong>{currentAccount.paymentState}</strong><br />Voorwaarden vereist vóór livegang.</div>
      </div>

      <LifecyclePanel account={currentAccount} lifecycle={lifecycle} requiredProof={requiredProof} />

      <CustomerProofSummary proofState={proofState} />

      <WorkspaceDealCard account={currentAccount} memoryState={memoryState} onRequestReview={requestReview} reviewState={reviewState} lifecycle={lifecycle} />

      <SpunkyWorkspaceCards account={currentAccount} accessCode={accessCode} memoryState={memoryState} lifecycle={lifecycle} requiredProof={requiredProof} onMemoryRefresh={loadVentureMemory} />

      <div className={styles.grid3}>
        <Card title="Analyse" value={`${currentAccount.analysisReadinessScore || 0}% gevuld`} detail="Elke stap hieronder verhoogt de Deal Card kwaliteit." />
        <Card title="AIOW model" value={`${currentAccount.aiowRevenueSharePercent || 10}% omzetdeel`} detail="Definitief na proof, scope en contract." />
        <Card title="Account" value={currentAccount.accountId} detail={`Aangemaakt: ${new Date(currentAccount.createdAt).toLocaleString("nl-NL")}`} mono />
      </div>

      <VentureMemoryTimeline memoryState={memoryState} />

      <div className={styles.aiGuide}>
        <div className={styles.aiAvatar}>AI</div>
        <div>
          <strong>{operatingPhase ? "Spunky helpt straks context scherp houden." : "Ik help je beoordeling sterker maken."}</strong>
          <p>{operatingPhase ? "Vanaf nu draait het minder om intake en meer om uitvoering: databronnen, KPI, planning, beperkingen en concrete workflow-proof." : "Niet alles hoeft in één keer. Vul per stap in wat je al weet. AIOW gebruikt dit voor founder/market/execution/AI opportunity/investment scores."}</p>
          <div className={styles.stepPills}>{requiredProof.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </div>

      <AnalysisSummary analysis={currentAccount.analysis} />
      {!operatingPhase && <GuidedVentureIntake account={currentAccount} />}
      {operatingPhase && <OperatingPrepPanel account={currentAccount} requiredProof={requiredProof} />}
      <AnalysisProfile profile={currentAccount.analysisProfile || {}} />

      <div className={styles.grid2}>
        <StepList title="Jouw volgende stappen" steps={currentAccount.customerNextSteps} />
        <StepList title="AIOW acties" steps={currentAccount.aiowNextSteps} />
      </div>
    </div>
  );
}


function buildCustomerWorkspaceCardStates(events: MemoryEvent[]) {
  const states = new Map<string, { answered: boolean; requested: boolean; question: string; answerAt: string; requestAt: string }>();
  const titles = ["Deal Card", "Scope en risico", "AIOW reactie", "Spunky projectruimte"];
  for (const title of titles) states.set(title, { answered: false, requested: false, question: "", answerAt: "", requestAt: "" });
  for (const event of events) {
    if (event.content.includes("Workspace card:")) {
      const title = extractPortalLineValue(event.content, "Workspace card");
      const current = states.get(title);
      if (current) {
        current.answered = true;
        current.answerAt = event.createdAt;
      }
    }
    if (event.content.includes("Admin workspace question:")) {
      const title = extractPortalLineValue(event.content, "Admin workspace question");
      const current = states.get(title);
      if (current) {
        current.question = extractPortalQuestion(event.content);
        current.requestAt = event.createdAt;
      }
    }
  }
  for (const current of states.values()) {
    current.requested = Boolean(current.requestAt) && (!current.answerAt || current.requestAt.localeCompare(current.answerAt) > 0);
  }
  return states;
}

function extractPortalLineValue(content: string, label: string): string {
  const line = content.split("\n").find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function extractPortalQuestion(content: string): string {
  const marker = "Question:";
  const index = content.indexOf(marker);
  if (index === -1) return "";
  return content.slice(index + marker.length).trim().slice(0, 700);
}

function SpunkyWorkspaceCards({ account, accessCode, memoryState, lifecycle, requiredProof, onMemoryRefresh }: { account: Account; accessCode: string; memoryState: VentureMemoryState; lifecycle: LifecycleView; requiredProof: string[]; onMemoryRefresh: (sessionId?: string) => void }) {
  const loaded = memoryState.status === "loaded" ? memoryState : null;
  const dealCard = loaded?.dealCard;
  const cardStates = buildCustomerWorkspaceCardStates(loaded?.events || []);
  const cardState = (title: string) => cardStates.get(title) || { answered: false, requested: false, question: "" };
  const missing = dealCard?.missing?.length ? dealCard.missing : requiredProof;
  const operating = isOperatingPhase(account.status);
  const dealState = cardState("Deal Card");
  const scopeState = cardState("Scope en risico");
  const responseState = cardState("AIOW reactie");
  const roomState = cardState("Spunky projectruimte");
  const cards = [
    {
      title: "Deal Card",
      label: dealState.requested ? "Vraag van Team Richard" : dealState.answered ? "Info ontvangen" : account.analysisReadinessScore >= 70 ? "Sterk genoeg voor review" : "Context nodig",
      status: dealState.requested ? "needs-info" : dealState.answered ? "ready" : account.analysisReadinessScore >= 70 ? "ready" : "needs-info",
      detail: dealCard?.problem || "AIOW gebruikt je input om probleem, kans, bewijs en eerste sprint scherp te maken.",
      owner: dealState.requested ? "Jij + Spunky" : dealState.answered ? "Team Richard" : account.analysisReadinessScore >= 70 ? "Team Richard" : "Jij + Spunky",
      eta: account.analysisReadinessScore >= 70 || dealState.answered ? "Binnen 1 werkdag na review-aanvraag" : "Direct na extra input",
      action: dealState.requested ? "Beantwoord de vraag van Team Richard" : dealState.answered ? "AIOW neemt dit mee in de beoordeling" : account.analysisReadinessScore >= 70 ? "Vraag review aan of wacht op besluit" : "Vul ontbrekende context aan",
      prompt: dealState.question || "Welke klantvraag, KPI of bewijs maakt deze Deal Card sterker?",
      items: missing.slice(0, 3),
    },
    {
      title: "Scope en risico",
      label: scopeState.requested ? "Vraag van Team Richard" : scopeState.answered ? "Info ontvangen" : account.productionBoundary.includes("live") ? "Veilig begrensd" : "Check nodig",
      status: scopeState.requested ? "needs-info" : scopeState.answered ? "ready" : "active",
      detail: "We bepalen wat AI mag doen, welke data nodig is en waar menselijke goedkeuring verplicht blijft.",
      owner: scopeState.requested ? "Jij + Spunky" : scopeState.answered ? "Team Richard" : "Jij + Team Richard",
      eta: "Binnen 1 tot 2 werkdagen na voldoende context",
      action: scopeState.requested ? "Beantwoord de scopevraag van Team Richard" : scopeState.answered ? "AIOW verwerkt je grens in scope review" : "Lever privacy, systemen en beslisser aan",
      prompt: scopeState.question || "Welke data, systemen of grenzen moet AIOW absoluut respecteren?",
      items: ["databronnen", "goedkeuring", "scopegrens"],
    },
    {
      title: "AIOW reactie",
      label: responseState.requested ? "Vraag van Team Richard" : responseState.answered ? "Voorkeur ontvangen" : lifecycle.label,
      status: responseState.requested ? "needs-info" : responseState.answered ? "ready" : account.status === "READY_FOR_SCOPE_REVIEW" ? "waiting" : operating ? "ready" : "active",
      detail: lifecycle.detail,
      owner: responseState.requested ? "Jij + Spunky" : account.status === "READY_FOR_SCOPE_REVIEW" ? "Team Richard" : "Jij",
      eta: account.status === "READY_FOR_SCOPE_REVIEW" ? "Normaal binnen 1 werkdag" : "Na review-aanvraag",
      action: responseState.requested ? "Beantwoord de vraag van Team Richard" : responseState.answered ? "Team Richard ziet je voorkeur bij review" : lifecycle.primaryAction,
      prompt: responseState.question || "Waar wil je dat Team Richard vooral op reageert: Go, risico, contractroute of eerste proof sprint?",
      items: account.customerNextSteps.slice(0, 3),
    },
    {
      title: "Spunky projectruimte",
      label: roomState.requested ? "Vraag van Team Richard" : roomState.answered ? "Kickoff input ontvangen" : operating ? "Voorbereiding actief" : "Na akkoord",
      status: roomState.requested ? "needs-info" : roomState.answered ? "ready" : operating ? "active" : "waiting",
      detail: "Spunky verzamelt straks context, stelt gerichte vragen en houdt ontbrekende informatie zichtbaar per onderdeel.",
      owner: roomState.requested ? "Jij + Spunky" : operating ? "Spunky + Team Richard" : "Wacht op contractfase",
      eta: operating ? "Meestal dezelfde of volgende werkdag" : "Na signing",
      action: roomState.requested ? "Beantwoord de kickoffvraag van Team Richard" : roomState.answered ? "Kickoff-context staat klaar" : operating ? "Bereid workflow, KPI en toegang voor" : "Eerst scope en akkoord afronden",
      prompt: roomState.question || "Welke workflow moet Spunky als eerste helpen scherp krijgen zodra de projectruimte start?",
      items: ["workflow", "KPI", "toegang"],
    },
  ];
  return (
    <section className={styles.panel} aria-label="Spunky workspace cards">
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.cardLabel}>Spunky workspace</p>
          <strong>Overzicht per onderdeel</strong>
        </div>
        <span>{operating ? "operating mode" : "intake mode"}</span>
      </div>
      <p className={styles.cardDetail}>Dit houdt dezelfde ervaring als Spunky: geen zwarte doos, maar per onderdeel duidelijk wat compleet is, wat ontbreekt, wie aan zet is en wanneer je reactie kunt verwachten.</p>
      <div className={styles.grid2}>
        {cards.map((card) => <SpunkyWorkspaceCard key={card.title} account={account} accessCode={accessCode} card={card} onMemoryRefresh={onMemoryRefresh} />)}
      </div>
    </section>
  );
}

function SpunkyWorkspaceCard({ account, accessCode, card, onMemoryRefresh }: { account: Account; accessCode: string; card: { title: string; label: string; status: string; detail: string; owner: string; eta: string; action: string; prompt: string; items: string[] }; onMemoryRefresh: (sessionId?: string) => void }) {
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<WorkspaceCardState>({ status: "idle" });
  const tone = card.status === "ready" ? styles.success : card.status === "needs-info" ? styles.warning : card.status === "waiting" ? styles.notice : styles.card;

  async function submitCardAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });
    try {
      const response = await fetch("/api/customer-workspace-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.accountId,
          accessCode,
          cardTitle: card.title,
          cardStatus: card.status,
          prompt: card.prompt,
          answer,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Extra info kon niet worden opgeslagen.");
      setAnswer("");
      setState({ status: "saved", message: data.message || "Extra info opgeslagen.", nextQuestion: data.nextQuestion || card.prompt });
      onMemoryRefresh(data.memorySessionId || account.onboardingId || account.accountId);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <article className={tone}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.cardLabel}>{card.label}</p>
          <strong>{card.title}</strong>
        </div>
        <span>{state.status === "saved" ? "info received" : card.status}</span>
      </div>
      <p>{card.detail}</p>
      <div className={styles.grid2}>
        <div>
          <p className={styles.cardLabel}>Wie is aan zet</p>
          <strong className={styles.cardValue}>{state.status === "saved" ? "Team Richard" : card.owner}</strong>
        </div>
        <div>
          <p className={styles.cardLabel}>Expected response</p>
          <strong className={styles.cardValue}>{card.eta}</strong>
        </div>
      </div>
      <p className={styles.cardDetail}><strong>Volgende actie:</strong> {state.status === "saved" ? "AIOW neemt je extra info mee in de beoordeling." : card.action}</p>
      <div className={styles.stepPills}>{card.items.map((item) => <span key={item}>{item}</span>)}</div>
      <form onSubmit={submitCardAnswer} className={styles.formGrid}>
        <label className={styles.field}>
          <span>Spunky vervolgvraag</span>
          <textarea className={styles.textarea} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={state.status === "saved" ? state.nextQuestion : card.prompt} />
        </label>
        <div className={styles.actions}>
          <p className={styles.muted}>Opslaan verrijkt alleen Venture Memory. Geen contract, scopewijziging of livegang.</p>
          <button type="submit" disabled={state.status === "submitting" || answer.trim().length < 12} className={styles.secondaryButton}>{state.status === "submitting" ? "Opslaan..." : "Geef extra info"}</button>
        </div>
        {state.status === "saved" && <p className={styles.success}>{state.message}<br />Volgende vraag: {state.nextQuestion}</p>}
        {state.status === "error" && <p className={styles.error}>{state.message}</p>}
      </form>
    </article>
  );
}

function CustomerProofSummary({ proofState }: { proofState: CustomerProofState }) {
  return (
    <section className={styles.memoryPanel} aria-label="Wat AIOW met je aanvraag heeft gedaan">
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.cardLabel}>Proof summary</p>
          <strong>Wat is er met je aanvraag gebeurd?</strong>
        </div>
        <span>{proofState.status === "loaded" ? `${proofState.steps.length} stappen` : "veilig overzicht"}</span>
      </div>
      {proofState.status === "loading" && <p className={styles.muted}>Proof summary laden...</p>}
      {proofState.status === "error" && <p className={styles.warning}>Proof summary kon nu niet laden. Je accountstatus hierboven blijft de bron.</p>}
      {proofState.status === "loaded" && (
        <div className={styles.memoryList}>
          {proofState.steps.length === 0 ? <p className={styles.muted}>Nog geen openbare proof stappen beschikbaar.</p> : proofState.steps.map((step, index) => (
            <div key={step.id} className={styles.memoryRow}>
              <i aria-hidden="true" />
              <div>
                <span>{step.state === "active" ? "Nu actief" : `Stap ${index + 1}`}</span>
                <p><strong>{step.label}</strong></p>
                <p>{step.detail}</p>
                <p className={styles.muted}>{new Date(step.createdAt).toLocaleString("nl-NL")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className={styles.cardDetail}>Dit is de klantveilige versie van de AIOW proof log. Interne notities, commerciële payloads en technische details worden hier niet getoond.</p>
    </section>
  );
}

function WorkspaceDealCard({ account, memoryState, onRequestReview, reviewState, lifecycle }: { account: Account; memoryState: VentureMemoryState; onRequestReview: () => void; reviewState: { status: "idle" | "submitting" | "success" | "error"; message?: string }; lifecycle: LifecycleView }) {
  const loaded = memoryState.status === "loaded" ? memoryState : null;
  const dealCard = loaded?.dealCard;
  const canvas = loaded?.canvas;
  const title = dealCard?.title || canvas?.project || account.projectName;
  const confidence = Math.max(dealCard?.confidence || canvas?.confidence || account.analysisReadinessScore || 0, 0);
  const missing = dealCard?.missing?.length ? dealCard.missing : ["budgetindicatie", "bewijs van vraag", "eerste proof sprint KPI"];
  const nextStep = isOperatingPhase(account.status) ? lifecycle.primaryAction : dealCard?.nextStep || (confidence >= 55 ? "Vraag AIOW om scope review" : "Vul de ontbrekende context hieronder aan");
  const scoreStyle = { "--score": `${Math.min(100, Math.max(0, confidence))}%` } as CSSProperties;
  return (
    <section className={styles.dealHero} aria-label="AIOW Deal Card">
      <div className={styles.dealHeroMain}>
        <p className={styles.eyebrow}>Deal Card</p>
        <h3>{title}</h3>
        <p>{dealCard?.problem || canvas?.problem || "De eerste kans is aangemaakt. Voeg meer context toe zodat AIOW de scope, waarde en risico's beter kan beoordelen."}</p>
        <div className={styles.dealMeta}>
          <span>{loaded?.storageMode ? `Memory: ${loaded.storageMode}` : account.onboardingId ? "Memory laden" : "Account intake"}</span>
          <span>{account.status}</span>
          <span>{account.contactName}</span>
        </div>
      </div>
      <div className={styles.dealHeroSide}>
        <div className={styles.scoreRing} style={scoreStyle}>
          <strong>{Math.round(confidence)}%</strong>
          <span>Venture score</span>
        </div>
        <div className={styles.nextActionBox}>
          <p className={styles.cardLabel}>Volgende stap</p>
          <strong>{nextStep}</strong>
          <ul>
            {missing.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
          </ul>
          {!isOperatingPhase(account.status) && (
            <button type="button" onClick={onRequestReview} disabled={reviewState.status === "submitting" || account.status === "READY_FOR_SCOPE_REVIEW"} className={styles.primaryButton}>
              {reviewState.status === "submitting" ? "Aanvragen..." : account.status === "READY_FOR_SCOPE_REVIEW" ? "Review aangevraagd" : "Vraag AIOW review aan"}
            </button>
          )}
          {reviewState.status === "success" && <p className={styles.success}>{reviewState.message}</p>}
          {reviewState.status === "error" && <p className={styles.error}>{reviewState.message}</p>}
        </div>
      </div>
      {memoryState.status === "error" && <p className={styles.error}>{memoryState.message}</p>}
    </section>
  );
}

function LifecyclePanel({ account, lifecycle, requiredProof }: { account: Account; lifecycle: LifecycleView; requiredProof: string[] }) {
  const stageIndex = Math.max(1, Math.min(lifecycle.stage, lifecycleStages.length));
  return (
    <section className={styles.commandHero} aria-label="AIOW lifecycle status">
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.cardLabel}>{lifecycle.label}</p>
          <strong>{lifecycle.headline}</strong>
        </div>
        <span>{account.status}</span>
      </div>
      <p className={styles.cardDetail}>{lifecycle.detail}</p>
      <div className={styles.pipeline}>
        {lifecycleStages.map((stage, index) => (
          <div key={stage} className={index + 1 <= stageIndex ? styles.activeStage : ""}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage}</strong>
          </div>
        ))}
      </div>
      <div className={styles.grid2}>
        <div className={styles.notice}>
          <strong>Nu belangrijk</strong>
          <p>{lifecycle.primaryAction}</p>
        </div>
        <div className={styles.warning}>
          <strong>Veilige grens</strong>
          <p>Signing of projectgroep betekent nog geen automatische livegang, betaling, provider billing of scopewijziging. Team Richard bevestigt live-go apart.</p>
        </div>
      </div>
      <div className={styles.stepPills}>{requiredProof.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
    </section>
  );
}

function OperatingPrepPanel({ account, requiredProof }: { account: Account; requiredProof: string[] }) {
  const items = [
    "Eerste workflow of klantproces dat bewezen moet worden",
    "Beschikbare databronnen, documenten, systemen en toegangsniveaus",
    "Eerste KPI voor 30 dagen: leads, omzet, tijdwinst, response time of marge",
    "Wie mag beslissen over scope, privacy, budget en livegang",
  ];
  return (
    <section className={styles.panel}>
      <p className={styles.cardLabel}>Operating prep</p>
      <strong className={styles.cardValue}>Wat Spunky straks van je nodig heeft</strong>
      <p className={styles.cardDetail}>Gebruik dit als voorbereiding voor de projectgroep. Spunky verzamelt context, Team Richard beslist over scope en livegang.</p>
      <div className={styles.grid2}>
        <StepList title="Voor kickoff" steps={items} />
        <StepList title="Bewijs en grenzen" steps={[...requiredProof.slice(0, 3), account.productionBoundary]} />
      </div>
    </section>
  );
}

function VentureMemoryTimeline({ memoryState }: { memoryState: VentureMemoryState }) {
  if (memoryState.status === "idle") return null;
  if (memoryState.status === "loading") return <div className={styles.panel}><p className={styles.cardLabel}>Venture Memory</p><p className={styles.cardDetail}>Live gesprek en Deal Card worden geladen.</p></div>;
  if (memoryState.status === "error") return <div className={styles.panel}><p className={styles.cardLabel}>Venture Memory</p><p className={styles.cardDetail}>Geen gekoppelde live-memory gevonden. Het account blijft bruikbaar via de intake hieronder.</p></div>;
  const events = memoryState.events.slice(-6).reverse();
  return (
    <section className={styles.memoryPanel} aria-label="Venture Memory timeline">
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.cardLabel}>Live Venture Memory</p>
          <strong>{memoryState.canvas?.memoryEventCount || events.length} events gekoppeld</strong>
        </div>
        <span>{memoryState.storageMode || "store"}</span>
      </div>
      {events.length === 0 ? (
        <p className={styles.cardDetail}>Nog geen memory events zichtbaar voor dit account.</p>
      ) : (
        <div className={styles.memoryList}>
          {events.map((event) => <MemoryEventRow key={event.id} event={event} />)}
        </div>
      )}
    </section>
  );
}

function MemoryEventRow({ event }: { event: MemoryEvent }) {
  const label = event.type === "contact_linked" ? "Contact gekoppeld" : event.type === "deal_card" ? "Deal Card" : event.role === "user" ? "Founder input" : event.role === "ai" ? "Spunky" : "Systeem";
  const content = event.type === "deal_card" ? parseDealTitle(event.content) : event.content;
  return (
    <div className={styles.memoryRow}>
      <i />
      <div>
        <span>{label}</span>
        <p>{content}</p>
      </div>
    </div>
  );
}

function parseDealTitle(content: string): string {
  try {
    const parsed = JSON.parse(content) as DealCard;
    return parsed.title ? `${parsed.title}: ${parsed.nextStep || "Deal Card klaar voor review"}` : "Deal Card klaar voor review";
  } catch {
    return content;
  }
}

function Card({ title, value, detail, mono }: { title: string; value: string; detail: string; mono?: boolean }) {
  return <div className={styles.card}><p className={styles.cardLabel}>{title}</p><strong className={`${styles.cardValue} ${mono ? styles.accountCode : ""}`}>{value}</strong><p className={styles.cardDetail}>{detail}</p></div>;
}

function GuidedVentureIntake({ account }: { account: Account }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [intakeData, setIntakeData] = useState<Record<string, string>>(() => account.analysisProfile || {});
  const [state, setState] = useState<IntakeState>({ status: "idle" });
  const step = intakeSteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / intakeSteps.length) * 100);
  const isFinal = stepIndex === intakeSteps.length - 1;
  const answeredCount = useMemo(() => intakeSteps.flatMap((item) => item.fields).filter((field) => (intakeData[field.name] || "").trim()).length, [intakeData]);

  function updateField(name: string, value: string) {
    setIntakeData((current) => ({ ...current, [name]: value }));
    if (state.status === "error" || state.status === "success") setState({ status: "idle" });
  }

  async function submit() {
    setState({ status: "submitting" });
    try {
      const response = await fetch("/api/customer-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intakeData,
          companyName: account.companyName,
          legalName: account.legalName,
          billingEmail: account.contactEmail,
          primaryContactName: account.contactName,
          primaryContactEmail: account.contactEmail,
          projectName: account.projectName,
          projectType: account.projectType,
          authorizedSignerName: account.contactName,
          authorizedSignerRole: "Privé klantportaal intake",
          authorizedSignerEmail: account.contactEmail,
          revenueSource: intakeData.revenueSource || "Privé klantportaal",
          crmSource: intakeData.crmSource || "Privé klantportaal",
          paymentSource: intakeData.paymentSource || "Privé klantportaal",
          moduleInterests: account.moduleInterests,
          addOns: account.addOns,
          onboardingId: account.accountId,
          termsRequiredAccepted: true,
          consentAccepted: true,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Private intake kon niet worden opgeslagen.");
      setState({ status: "success", onboardingId: data.onboardingId });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFinal) {
      setStepIndex((index) => Math.min(index + 1, intakeSteps.length - 1));
      return;
    }
    void submit();
  }

  return (
    <section id="intake" className={styles.stepCard} aria-labelledby="guided-intake-title">
      <div className={styles.progressRail}>
        <div className={styles.progressMeta}><span>{answeredCount} velden aangevuld</span><span>{progress}%</span></div>
        <div className={styles.progressTrack} aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
      </div>

      <form onSubmit={onContinue} className={styles.formGrid}>
        <div className={styles.stepHead}>
          <div>
            <p className={styles.eyebrow}>{step.eyebrow}</p>
            <h3 id="guided-intake-title">{step.title}</h3>
            <p className={styles.muted}>{step.why}</p>
          </div>
          <div className={styles.stepPills}>{step.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>
        </div>

        <div className={styles.aiGuide}>
          <div className={styles.aiAvatar}>AI</div>
          <div>
            <strong>AIOW intake-gids</strong>
            <p>{step.aiPrompt}</p>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          {step.fields.map((field) => <IntakeFieldInput key={field.name} field={field} value={intakeData[field.name] || ""} onChange={updateField} />)}
        </div>

        <div className={styles.actions}>
          <button type="button" disabled={stepIndex === 0 || state.status === "submitting"} onClick={() => setStepIndex((index) => Math.max(0, index - 1))} className={styles.secondaryButton}>Vorige stap</button>
          <button type="submit" disabled={state.status === "submitting"} className={styles.primaryButton}>{state.status === "submitting" ? "Opslaan..." : isFinal ? "Intake opslaan" : "Volgende stap"}</button>
        </div>

        {state.status === "success" && <p className={styles.success}>Private intake opgeslagen: {state.onboardingId}. AIOW kan je Deal Card nu beter beoordelen.</p>}
        {state.status === "error" && <p className={styles.error}>{state.message}</p>}
        <p className={styles.muted}>Geen deal of productie wordt geactiveerd; dit verrijkt alleen de AIOW analyse, Deal Card en proof sprint.</p>
      </form>
    </section>
  );
}

function IntakeFieldInput({ field, value, onChange }: { field: IntakeField; value: string; onChange: (name: string, value: string) => void }) {
  const className = `${styles.field} ${field.wide ? styles.fieldWide : ""}`;
  return (
    <label className={className}>
      <span>{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea value={value} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder} className={styles.textarea} />
      ) : (
        <input value={value} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder} className={styles.input} />
      )}
    </label>
  );
}

function AnalysisSummary({ analysis }: { analysis?: Account["analysis"] }) {
  if (!analysis) return null;
  return (
    <div className={styles.grid3}>
      <Card title="Slagingskans" value={`${analysis.successProbabilityScore}%`} detail={`Venture verdict: ${analysis.verdict}`} />
      <Card title="Uniekheid" value={`${analysis.uniquenessScore}%`} detail="Voor definitief oordeel volgt extern marktonderzoek." />
      <Card title="AIOW dealadvies" value={`${analysis.recommendedRevenueSharePercent}% omzet`} detail={`${analysis.recommendedResaleSharePercent}% doorverkoop/resell minimum.`} />
      <div className={`${styles.panel} ${styles.notice}`}>
        <strong>Eerste sprint:</strong> {analysis.firstSprintRecommendation}
        <p>{analysis.recommendedModuleTerms}</p>
      </div>
    </div>
  );
}

function AnalysisProfile({ profile }: { profile: Record<string, string> }) {
  const rows = [
    ["Aanbod", profile.coreOffer],
    ["Klantsegmenten", profile.customerSegments],
    ["Acquisitie", profile.acquisitionChannels],
    ["Systemen", profile.systemsStack],
    ["Databronnen", profile.dataSources],
    ["Knelpunten", profile.painPoints],
    ["Succesmetrics", profile.successMetrics],
  ].filter(([, value]) => value);
  return (
    <div className={styles.panel}>
      <p className={styles.cardLabel}>Analyseprofiel</p>
      <strong className={styles.cardValue}>Wat AIOW al weet</strong>
      {rows.length === 0 ? (
        <p className={styles.cardDetail}>Nog weinig analyse-input ingevuld. De begeleide intake hierboven maakt dit concreet.</p>
      ) : (
        <div className={styles.grid2}>
          {rows.map(([label, value]) => (
            <div key={label} className={styles.card}>
              <p className={styles.cardLabel}>{label}</p>
              <p className={styles.cardDetail}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return <div className={styles.panel}><p className={styles.cardLabel}>{title}</p><ol className={styles.list}>{steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol></div>;
}
