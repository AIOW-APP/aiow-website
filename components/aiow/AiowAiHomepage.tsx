"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AiowAiHomepage.module.css";

type IntakeState = "idle" | "typing" | "thinking" | "briefing" | "consent" | "review";
type MemoryStatus = "temporary" | "linked";
type Role = "ai" | "user";

type Message = {
  id: string;
  role: Role;
  text: string;
  time: string;
};

type Canvas = {
  project: string;
  founder: string;
  problem: string;
  solution: string;
  businessModel: string;
  audience: string;
  aiOpportunities: string;
  risk: string;
  automation: string;
  growth: string;
  collaboration: string;
  confidence: number;
  marketScore: number;
  riskScore: number;
  aiScore: number;
  automationScore: number;
};

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
};

type WorkspaceLink = {
  accountId: string;
  accessCode: string;
  portalUrl: string;
  status?: string;
  previewLogin?: boolean;
};

const initialCanvas: Canvas = {
  project: "Nog niet ingevuld",
  founder: "Nog niet ingevuld",
  problem: "Nog niet ingevuld",
  solution: "Nog niet ingevuld",
  businessModel: "Nog niet ingevuld",
  audience: "Nog niet ingevuld",
  aiOpportunities: "Nog niet ingevuld",
  risk: "Nog niet ingevuld",
  automation: "Nog niet ingevuld",
  growth: "Nog niet ingevuld",
  collaboration: "Nog niet bepaald",
  confidence: 0,
  marketScore: 0,
  riskScore: 0,
  aiScore: 0,
  automationScore: 0,
};

const canvasLabels: Array<{ key: keyof Canvas; label: string; icon: string }> = [
  { key: "project", label: "Project", icon: "◈" },
  { key: "founder", label: "Founder", icon: "◎" },
  { key: "problem", label: "Probleem", icon: "!" },
  { key: "solution", label: "Oplossing", icon: "✦" },
  { key: "businessModel", label: "Businessmodel", icon: "▣" },
  { key: "audience", label: "Doelgroep", icon: "⌁" },
  { key: "marketScore", label: "Marktkans", icon: "⌂" },
  { key: "riskScore", label: "Risico score", icon: "◇" },
  { key: "aiScore", label: "AI potentie", icon: "✺" },
  { key: "automationScore", label: "Automatisering", icon: "⚙" },
  { key: "collaboration", label: "Samenwerking", icon: "▰" },
];

const thinkingSteps = [
  "Marktanalyse",
  "Concurrentie",
  "AI kansen",
  "Businessmodel",
  "Risico",
  "Groeipotentie",
];

const aiTeam = [
  { name: "Strategy AI", task: "Analyseert markt", level: 88, icon: "✳" },
  { name: "Finance AI", task: "Berekent ROI", level: 64, icon: "◍" },
  { name: "UX AI", task: "Onderzoekt gebruikers", level: 72, icon: "✎" },
  { name: "Dev AI", task: "Technische check", level: 58, icon: "⌘" },
  { name: "Marketing AI", task: "Zoekt kansen", level: 81, icon: "↗" },
];

const memorySteps = [
  "Gesprek gestart",
  "Bedrijf herkend",
  "Probleem ontdekt",
  "Marktkans berekend",
  "Concurrentie compleet",
  "Voorstel gegenereerd",
];

const firstMessage =
  "Hey, I’m Spunky, AIOW’s AI Venture Intake Partner. Talk to me in any language you want. I’ll reply in that language. Are you here with a startup idea, an existing company, an AI growth question or a possible partnership?";

export function AiowAiHomepage() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<IntakeState>("idle");
  const [input, setInput] = useState("");
  const [canvas, setCanvas] = useState<Canvas>(initialCanvas);
  const [contact, setContact] = useState({ name: "", email: "", company: "", consent: false });
  const [sessionId, setSessionId] = useState("");
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>("temporary");
  const [dealCardTitle, setDealCardTitle] = useState("");
  const [dealCard, setDealCard] = useState<DealCard | null>(null);
  const [workspaceLink, setWorkspaceLink] = useState<WorkspaceLink | null>(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "ai", text: firstMessage, time: "now" },
  ]);
  const [chatLanguage, setChatLanguage] = useState("en");

  const userCount = messages.filter((message) => message.role === "user").length;
  const activeCanvas = useMemo(() => mergeCanvas(canvas, input), [canvas, input]);
  const quickActions = useMemo(() => getQuickActions(activeCanvas, userCount), [activeCanvas, userCount]);
  const thinkingProgress = useMemo(() => getThinkingProgress(activeCanvas, state, input), [activeCanvas, state, input]);
  const showContact = state === "consent" || state === "review";

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = window.localStorage.getItem("aiow:ventureSessionId");
    const nextSessionId = stored || `aiow_session_${crypto.randomUUID()}`;
    window.localStorage.setItem("aiow:ventureSessionId", nextSessionId);
    setSessionId(nextSessionId);
    if (window.matchMedia("(min-width: 881px) and (pointer: fine)").matches) {
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    }
  }, []);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    requestAnimationFrame(() => {
      thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
    });
  }, [messages.length, state]);

  function onInput(event: ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    if (event.target.value.trim()) setState("typing");
    if (!event.target.value.trim() && userCount === 0) setState("idle");
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submitPrompt();
  }

  async function submitPrompt(prompt?: string) {
    const text = (prompt || input).trim();
    if (!text) return;

    const detectedLanguage = detectChatLanguage(text, chatLanguage);
    setChatLanguage(detectedLanguage);
    const nextCanvas = mergeCanvas(canvas, text, true);
    setCanvas(nextCanvas);
    setInput("");
    setState("thinking");

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text, time: "nu" };
    const nextMessages = [...messages, userMessage];
    const conversationMode = classifyConversationMode(text, nextMessages.map((message) => `${message.role}: ${message.text}`).join("\n"));
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/spunky/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: conversationMode === "workflow_scan" || conversationMode === "lead_machine" ? "company" : "idea",
          conversationMode,
          language: detectedLanguage,
          responseLanguage: detectedLanguage,
          relationshipStage: memoryStatus === "linked" ? "account" : "anonymous",
          visitorMessageCount: userCount + 1,
          sessionId,
          canvas: nextCanvas,
          transcript: nextMessages.map((message) => `${message.role}: ${message.text}`).join("\n"),
          page: "aiow-v4-ai-venture-experience",
        }),
      });
      const data = (await response.json()) as { reply?: string; language?: string; leadGate?: boolean; memorySessionId?: string; dealCard?: DealCard; workspace?: WorkspaceLink; canvas?: Partial<Canvas>; ventureSnapshot?: Partial<Canvas> };
      if (data.language) setChatLanguage(data.language);
      const reply = refineReply(data.reply, text, userCount + 1);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "ai", text: reply, time: "nu" }]);
      if (data.memorySessionId && data.memorySessionId !== sessionId) setSessionId(data.memorySessionId);
      const serverCanvas = toCanvas(data.ventureSnapshot || data.canvas);
      if (serverCanvas) setCanvas(serverCanvas);
      if (data.workspace) {
        setMemoryStatus("linked");
        setDealCard(data.dealCard || null);
        setDealCardTitle(data.dealCard?.title || "Deal Card aangemaakt");
        setWorkspaceLink(data.workspace);
        window.localStorage.setItem("aiow:lastAccountId", data.workspace.accountId);
        window.localStorage.setItem("aiow:lastAccessCode", data.workspace.accessCode);
        setState("review");
      } else {
        setState(data.leadGate || userCount >= 2 ? "consent" : "briefing");
      }
    } catch {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "ai", text: localReply(text, userCount + 1), time: "nu" }]);
      setState(userCount >= 2 ? "consent" : "briefing");
    }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact.name.trim() || !contact.email.trim() || !contact.consent) return;
    setState("review");
    let finalDealCardTitle = "Ik heb een eerste Deal Card voorbereid";
    try {
      const response = await fetch("/api/venture-memory/link-contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: contact.name,
          email: contact.email,
          company: contact.company,
          consentAccepted: contact.consent,
          consentText: "AIOW mag deze Venture Memory koppelen aan mijn account en mij persoonlijk e-mailen over deze kans.",
          consentVersion: "aiow-venture-memory-v1",
          canvas: activeCanvas,
          transcript: messages.map((message) => `${message.role}: ${message.text}`).join("\n"),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; dealCard?: DealCard; workspace?: WorkspaceLink; canvas?: Partial<Canvas>; ventureSnapshot?: Partial<Canvas> };
      const nextDealCardTitle = data.dealCard?.title || "Deal Card aangemaakt";
      if (response.ok && data.ok) {
        finalDealCardTitle = nextDealCardTitle;
        setMemoryStatus("linked");
        setDealCardTitle(nextDealCardTitle);
        setDealCard(data.dealCard || null);
        if (data.workspace) {
          setWorkspaceLink(data.workspace);
          window.localStorage.setItem("aiow:lastAccountId", data.workspace.accountId);
          window.localStorage.setItem("aiow:lastAccessCode", data.workspace.accessCode);
        }
        const serverCanvas = toCanvas(data.ventureSnapshot || data.canvas);
        if (serverCanvas) setCanvas(serverCanvas);
      }
    } catch {
      finalDealCardTitle = "Deal Card lokaal voorbereid";
      setDealCardTitle(finalDealCardTitle);
    }
    setCanvas((current) => ({
      ...current,
      founder: contact.name.trim(),
      collaboration: "Private intake voor menselijke review",
      confidence: Math.max(current.confidence, 74),
    }));
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: `Je Venture Memory is gekoppeld. ${finalDealCardTitle}. Team AIOW kan nu beoordelen of dit een scan, proof sprint, fixed build, growth partner of venture review wordt.`,
        time: "nu",
      },
    ]);
  }

  return (
    <main className={styles.page} data-aiow-homepage="ai-is-the-homepage-v2" data-composer-focused={composerFocused ? "true" : "false"}>
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className={styles.frame} aria-label="AIOW AI Venture Interface">
        <aside className={styles.leftRail} aria-label="AIOW status">
          <Link href="/" className={styles.brand} aria-label="AIOW home">
            <span className={styles.logo}>A</span>
            <span>
              <strong>AIOW.ai</strong>
              <em>AI Venture Partner</em>
            </span>
          </Link>

          <div className={styles.mission}>
            <p>THE AI IS THE HOMEPAGE</p>
            <h1>Laat je case beoordelen.</h1>
            <span>Spunky bouwt je Venture Memory op en toetst of AIOW als partner waarde kan toevoegen.</span>
          </div>

          <div className={styles.presencePanel} aria-label="AI Presence">
            <div className={styles.presenceOrb}>
              <i />
              <b />
            </div>
            <div className={styles.presenceStates}>
              <span>{state === "typing" ? "Listening" : "Listening"}</span>
              <span>{state === "thinking" ? "Thinking" : "Thinking"}</span>
              <span>{activeCanvas.confidence > 45 ? "Building" : "Memory Active"}</span>
            </div>
            <PresenceBar label="Memory" value={Math.max(12, activeCanvas.confidence - 18)} />
            <PresenceBar label="Reasoning" value={Math.max(18, activeCanvas.confidence - 6)} />
            <PresenceBar label="Confidence" value={activeCanvas.confidence} />
          </div>

          <div className={styles.statusStack}>
            <StatusLine label="AI online" value="Live" active />
            <StatusLine label="Context actief" value={`${Math.max(8, activeCanvas.confidence)}%`} />
            <MetricCard label="Actieve analyses" value="24" />
            <MetricCard label="Deals in behandeling" value="7" />
          </div>

          <nav className={styles.railNav} aria-label="AIOW menu">
            <Link href="/projects">Cases</Link>
            <Link href="/legacy-aiow">Legacy</Link>
            <Link href="/nl/werkwijze-ai-implementatie">Werkwijze</Link>
            <Link href="/portal">Login</Link>
          </nav>
        </aside>

        <section className={styles.workspace} aria-label="AI conversation workspace">
          <div className={styles.workspaceTop}>
            <div className={styles.partnerTitle}>
              <span className={styles.logoSmall}>A</span>
              <strong>AIOW Venture Partner</strong>
              <i />
            </div>
            <div className={styles.sessionTools}>
              <span className={styles.avatars}><b /> <b /> <b /></span>
              <span>{aiTeam.length}</span>
              <button type="button">Deel gesprek +</button>
            </div>
          </div>
          <div className={styles.aiState}>
            <span className={styles.liveDot} />
            <span>{state === "thinking" ? "AI denkt mee" : state === "typing" ? "AI luistert" : memoryStatus === "linked" ? "Venture Memory gekoppeld" : "Tijdelijke Venture Memory actief"}</span>
          </div>

          <div className={styles.wave} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div ref={threadRef} className={styles.thread} aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={message.role === "ai" ? styles.aiBubble : styles.userBubble}>
                <p>{message.text}</p>
                <time>{message.time}</time>
              </article>
            ))}
            {state === "thinking" ? <ThinkingCard progress={thinkingProgress} /> : null}
          </div>

          <section className={styles.mobileCards} aria-label="Compacte Venture Memory">
            <MobileCard title="Business" value={activeCanvas.project} detail={activeCanvas.businessModel} score={activeCanvas.confidence} />
            <MobileCard title="Probleem" value={activeCanvas.problem} detail={activeCanvas.solution} score={activeCanvas.marketScore} />
            <MobileCard title="AI kans" value={activeCanvas.aiOpportunities} detail={activeCanvas.automation} score={activeCanvas.aiScore} />
            <MobileCard title="Risico" value={activeCanvas.risk} detail={activeCanvas.collaboration} score={activeCanvas.riskScore} />
          </section>

          <div className={styles.quickActions} aria-label="Slimme vervolgstappen">
            {quickActions.map((action) => (
              <button key={action} type="button" onClick={() => submitPrompt(action)}>
                {action}
              </button>
            ))}
          </div>

          <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); submitPrompt(); }}>
            <textarea
              ref={inputRef}
              aria-label="Vertel AIOW welke case beoordeeld moet worden"
              value={input}
              onChange={onInput}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              onKeyDown={onComposerKeyDown}
              placeholder="Startup, company, market or growth chance..."
              rows={2}
            />
            <div className={styles.composerActions} aria-label="Input opties">
              <button type="button" title="Tools">+</button>
              <button type="button" title="Voice input">Speak</button>
              <button type="button" title="Website analyseren">Website</button>
              <button type="button" title="Pitchdeck uploaden">Pitchdeck</button>
            </div>
            <button className={styles.send} type="submit" disabled={!input.trim()} aria-label="Stuur bericht">
              ➤
            </button>
          </form>

          <div className={styles.memoryTimeline} aria-label="AI memory timeline">
            <span>AI Memory Timeline</span>
            <ol>
              {memorySteps.map((step, index) => (
                <li key={step} className={index <= Math.min(memorySteps.length - 1, Math.floor(activeCanvas.confidence / 18)) ? styles.memoryActive : ""}>
                  <i />
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className={styles.canvas} aria-label="Live Venture Canvas">
          <div className={styles.canvasHeader}>
            <span>Live Venture Canvas</span>
            <strong>Live</strong>
          </div>

          <div className={styles.canvasList}>
            {canvasLabels.map((item) => (
              <CanvasRow key={String(item.key)} icon={item.icon} label={item.label} value={activeCanvas[item.key]} />
            ))}
          </div>

          <div className={styles.confidence}>
            <div>
              <span>Confidence score</span>
              <strong>{activeCanvas.confidence}%</strong>
            </div>
            <meter min="0" max="100" value={activeCanvas.confidence} />
          </div>

          <div className={styles.teamRail} aria-label="AI Team online">
            <h2>Team online</h2>
            {aiTeam.map((agent) => (
              <article key={agent.name}>
                <span>{agent.icon}</span>
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.task}</p>
                  <i><b style={{ width: `${agent.level}%` }} /></i>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className={styles.thinkingDock} aria-label="AI thinking analyse">
        {thinkingSteps.map((step, index) => (
          <div key={step} className={styles.thinkingTile}>
            <span>{step}</span>
            <div><i style={{ width: `${thinkingProgress[index]}%` }} /></div>
            <strong>{thinkingProgress[index]}%</strong>
          </div>
        ))}
      </section>

      {showContact && !workspaceLink ? (
        <section className={styles.contactGate} aria-label="Preview workspace account">
          <div>
            <p>Private workspace</p>
            <h2>Wil je dat AIOW deze Venture Memory bewaart?</h2>
            <span>Je tijdelijke Venture Memory wordt gekoppeld aan een preview workspace. We mailen alleen persoonlijk over deze kans als jij toestemming geeft.</span>
          </div>
          <form onSubmit={submitContact}>
            <input aria-label="Naam" placeholder="Naam" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
            <input aria-label="E-mail" placeholder="Zakelijke e-mail" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
            <input aria-label="Bedrijf" placeholder="Bedrijf optioneel" value={contact.company} onChange={(event) => setContact({ ...contact, company: event.target.value })} />
            <label>
              <input type="checkbox" checked={contact.consent} onChange={(event) => setContact({ ...contact, consent: event.target.checked })} />
              <span>AIOW mag deze context opslaan en mij persoonlijk mailen over deze kans. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.</span>
            </label>
            <button type="submit" disabled={!contact.name.trim() || !contact.email.trim() || !contact.consent}>Maak private workspace</button>
          </form>
        </section>
      ) : null}

      {workspaceLink ? <DealCardPanel dealCard={dealCard} workspace={workspaceLink} title={dealCardTitle} /> : null}
    </main>
  );
}

function DealCardPanel({ dealCard, workspace, title }: { dealCard: DealCard | null; workspace: WorkspaceLink; title: string }) {
  return (
    <section className={styles.dealCardPanel} aria-label="AIOW Deal Card en private workspace">
      <div>
        <p>Deal Card klaar</p>
        <h2>{dealCard?.title || title || "AIOW Venture Memory"}</h2>
        <span>{dealCard?.likelyRoute || "Team AIOW review"}</span>
      </div>
      <div className={styles.dealGrid}>
        <article>
          <strong>{dealCard?.confidence ?? 0}%</strong>
          <span>Venture confidence</span>
        </article>
        <article>
          <strong>{workspace.status || "INTAKE"}</strong>
          <span>Workspace status</span>
        </article>
      </div>
      <p>{dealCard?.problem || "Je context is opgeslagen als Venture Memory."}</p>
      <p>{dealCard?.nextStep || "Open je private workspace om ontbrekende context aan te vullen."}</p>
      {dealCard?.missing?.length ? <div className={styles.missingList}>{dealCard.missing.map((item) => <span key={item}>{item}</span>)}</div> : null}
      <div className={styles.workspaceAccess}>
        <div>
          <span>Preview toegangscode</span>
          <strong>{workspace.accessCode}</strong>
        </div>
        <a href={workspace.portalUrl}>Open private workspace</a>
      </div>
      <small>Preview login-link, nog geen echte Magic Link. Productie, contract en betalingen starten pas na AIOW review en akkoord.</small>
    </section>
  );
}

function StatusLine({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={styles.statusLine}>
      <span className={active ? styles.statusActive : ""} />
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function PresenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.presenceBar}>
      <span>{label}</span>
      <i><b style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></i>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <i />
    </div>
  );
}

function CanvasRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  const display = typeof value === "number" ? `${value || ""}${value ? " / 10" : ""}` : value;
  return (
    <div className={styles.canvasRow}>
      <span>{icon}</span>
      <div>
        <strong>{label}</strong>
        <p>{display || "Nog niet gevuld"}</p>
      </div>
    </div>
  );
}

function ThinkingCard({ progress }: { progress: number[] }) {
  return (
    <article className={styles.thinkingCard}>
      <p>Ik bouw de eerste analyse op.</p>
      {thinkingSteps.slice(0, 5).map((step, index) => (
        <div key={step}>
          <span>{step}</span>
          <i><b style={{ width: `${progress[index]}%` }} /></i>
        </div>
      ))}
    </article>
  );
}

function MobileCard({ title, value, detail, score }: { title: string; value: string; detail: string; score: number }) {
  const hasValue = value && !value.toLowerCase().includes("nog niet");
  return (
    <details className={styles.mobileCard}>
      <summary>
        <span>{title}</span>
        <strong>{hasValue ? value : "Nog leeg"}</strong>
        <b>{score || 0}</b>
      </summary>
      <p>{detail && !detail.toLowerCase().includes("nog niet") ? detail : "Spunky vult dit zodra je meer context geeft."}</p>
    </details>
  );
}


function toCanvas(value?: Partial<Canvas>): Canvas | null {
  if (!value || typeof value !== "object") return null;
  return {
    ...initialCanvas,
    ...value,
    confidence: cleanPercent(value.confidence),
    marketScore: cleanTen(value.marketScore),
    riskScore: cleanTen(value.riskScore),
    aiScore: cleanTen(value.aiScore),
    automationScore: cleanTen(value.automationScore),
  };
}

function cleanPercent(value: unknown): number {
  return Math.min(100, Math.max(0, Number(value || 0) || 0));
}

function cleanTen(value: unknown): number {
  return Math.min(10, Math.max(0, Number(value || 0) || 0));
}

function mergeCanvas(current: Canvas, text: string, committed = false): Canvas {
  const lower = text.toLowerCase();
  const hasCompany = includesAny(lower, ["bedrijf", "kantoor", "klanten", "omzet", "b2b", "mkb"]);
  const hasIdea = includesAny(lower, ["startup", "idee", "app", "platform", "product"]);
  const hasLeads = includesAny(lower, ["lead", "sales", "offerte", "klant", "websitebezoeker"]);
  const hasOps = includesAny(lower, ["planning", "administratie", "support", "mail", "crm", "proces", "automatis"]);
  const hasMarket = includesAny(lower, ["makelaar", "installatie", "logistiek", "zorg", "finance", "agency"]);
  const lengthBoost = Math.min(28, Math.floor(text.length / 12));
  const baseConfidence = committed ? 24 : 10;
  const confidence = Math.min(92, Math.max(current.confidence, baseConfidence + lengthBoost + (hasLeads ? 14 : 0) + (hasOps ? 12 : 0) + (hasCompany ? 10 : 0)));

  return {
    ...current,
    project: hasCompany ? "Bestaande business digitaliseren" : hasIdea ? "Nieuwe AI venture" : current.project,
    problem: hasLeads ? "Leads en opvolging lekken waarde" : hasOps ? "Processen kosten te veel handwerk" : current.problem,
    solution: hasLeads ? "AI lead intake, scoring en opvolging" : hasOps ? "AI workflow en operationele copilots" : current.solution,
    businessModel: hasCompany ? "Bestaande omzet plus digitale groeilaag" : hasIdea ? "Te valideren venture model" : current.businessModel,
    audience: hasMarket ? extractAudience(lower) : current.audience,
    aiOpportunities: hasLeads ? "Persoonlijke follow-up, scoring, CRM routing" : hasOps ? "Planning, inbox, documentflow en klantvragen" : current.aiOpportunities,
    automation: hasOps ? "Hoge automatiseringskans" : hasLeads ? "Leadflow kan grotendeels worden geautomatiseerd" : current.automation,
    risk: confidence > 55 ? "Bewijs, budget en scope nog toetsen" : "Nog te weinig context voor serieuze beoordeling",
    collaboration: confidence > 72 ? "Proof Sprint of Growth Partner review" : confidence > 44 ? "Paid Venture Scan kandidaat" : current.collaboration,
    confidence,
    marketScore: Math.min(10, Math.max(current.marketScore, hasCompany ? 7 : hasIdea ? 5 : 0)),
    riskScore: Math.min(10, Math.max(current.riskScore, confidence > 60 ? 5 : 3)),
    aiScore: Math.min(10, Math.max(current.aiScore, hasLeads || hasOps ? 8 : hasIdea ? 6 : 0)),
    automationScore: Math.min(10, Math.max(current.automationScore, hasOps ? 9 : hasLeads ? 7 : 0)),
  };
}

function getQuickActions(canvas: Canvas, userCount: number): string[] {
  if (userCount >= 2) return ["Maak hier een private intake van", "Welke info mist AIOW nog?", "Wat is de beste eerste sprint?"];
  if (canvas.project !== "Nog niet ingevuld") return ["Wat is je tractie?", "Wie is de doelgroep?", "Waarom win jij deze markt?"];
  return ["Ik heb een startup of idee", "Ik heb al een bedrijf", "Ik wil weten hoe AIOW werkt", "Ik ben partner of investeerder"];
}

function getThinkingProgress(canvas: Canvas, state: IntakeState, input: string): number[] {
  const boost = state === "thinking" ? 18 : input.trim() ? 8 : 0;
  return [
    Math.min(100, canvas.marketScore * 9 + boost),
    Math.min(100, canvas.confidence + 12),
    Math.min(100, canvas.aiScore * 10 + boost),
    Math.min(100, Math.max(8, canvas.confidence - 6)),
    Math.min(100, canvas.riskScore * 9 + boost),
    Math.min(100, canvas.automationScore * 9 + boost),
  ];
}

function refineReply(reply: string | undefined, text: string, count: number): string {
  if (reply?.trim()) return reply.trim().replace(/\u2014/g, ", ").replace(/\u2013/g, "-");
  return localReply(text, count);
}

function detectChatLanguage(text: string, fallback = "en"): string {
  const lower = text.toLowerCase();
  if (/\b(hallo|hoi|goedemorgen|goedemiddag|goedenavond|bedrijf|idee|groei|klant|klanten|omzet|afspraak|mijn|ik wil|wij willen|kun je)\b/.test(lower)) return "nl";
  if (/\b(bonjour|salut|merci|entreprise|idée|croissance)\b/.test(lower)) return "fr";
  if (/\b(hola|gracias|empresa|idea|crecimiento)\b/.test(lower)) return "es";
  if (/\b(hallo|guten|danke|unternehmen|idee|wachstum)\b/.test(lower)) return "de";
  if (/\b(hello|hey|hi|company|startup|idea|growth|customer|customers|revenue|meeting)\b/.test(lower)) return "en";
  return fallback || "en";
}

function classifyConversationMode(text: string, transcript = "") {
  const lower = `${text}\n${transcript}`.toLowerCase();
  if (isGreeting(text.toLowerCase())) return "greeting";
  if (includesAny(lower, ["lead", "leads", "sales", "opvolg", "follow-up", "follow up", "mail", "crm", "offerte", "afspraak"])) return "lead_machine";
  if (includesAny(lower, ["startup", "idee", "app", "platform", "product", "venture", "founder", "bouwen", "markt", "tractie"])) return "new_venture";
  if (includesAny(lower, ["proces", "workflow", "automatis", "administratie", "support", "planning", "operatie", "handwerk"])) return "workflow_scan";
  if (includesAny(lower, ["prijs", "kosten", "budget", "revenue", "share", "participatie", "equity", "dealmodel", "retainer"])) return "pricing_model";
  if (includesAny(lower, ["team", "mini", "book", "handsome", "spunky", "toegang", "mac mini", "agent"])) return "team_access";
  return "general_intake";
}

function localReply(text: string, count: number): string {
  const lower = text.toLowerCase();
  const conversationMode = classifyConversationMode(text);
  if (isGreeting(lower)) return greetingReply();
  if (count >= 3) return "Ik begin genoeg context te krijgen om dit serieus als AIOW-case te beoordelen. Om te voorkomen dat je opnieuw moet beginnen, maak ik graag vrijblijvend een Venture Memory voor je aan. Wat is je naam en e-mail, en mogen we je hierover persoonlijk mailen?";
  if (conversationMode === "pricing_model") return "Het juiste model hangt af van bewijs en scope: scan, proof sprint, vaste build, growth partner, revenue share of participatie. Welke route wil je vooral onderzoeken?";
  if (conversationMode === "team_access") return "Handsome pakt de centrale bouw en waarheid, Spunky de AIOW intake en klantcontext, Book strategie en UX-redteam, Mini buitenwereld en growth-signalen. Welke uitkomst moet dit team nu forceren?";
  if (conversationMode === "lead_machine") return "Ik beoordeel dit als groeicase, niet als losse marketingtaak. Waar verliest je bedrijf nu de meeste waarde: websitebezoek, intake, offerte, opvolging of retentie?";
  if (conversationMode === "workflow_scan") return "Ik hoor een bestaande bedrijfsoperatie. Dan kijk ik breder dan een taakje: groei, klantcontact, administratie, planning en schaalbaarheid. Waar blijft nu de meeste waarde liggen?";
  if (conversationMode === "new_venture") return "Om te bepalen of AIOW hier echt als venture partner waarde kan toevoegen, moet ik eerst begrijpen hoe sterk het idee, de markt en jouw eigen positie zijn. Wat is de doelgroep en welk bewijs of welke tractie heb je al?";
  return "Ik ben bij je. Dump je idee gerust rommelig: bedrijf, probleem, website, screenshot of gewoon één zin. Ik haal er markt, risico, AI-kans en de slimste vervolgvraag uit.";
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function extractAudience(lower: string) {
  if (lower.includes("makelaar")) return "Makelaars en vastgoedteams";
  if (lower.includes("installatie")) return "Installatiebedrijven";
  if (lower.includes("logistiek")) return "Logistiek en operatie";
  if (lower.includes("zorg")) return "Zorgorganisaties";
  if (lower.includes("agency")) return "Agencies en consultants";
  return "B2B markt";
}


function isGreeting(lower: string): boolean {
  return /^(hey|hi|hoi|hallo|yo|hello|goeie|goedemorgen|goedemiddag|goedenavond)[!.\s]*$/i.test(lower.trim());
}

function greetingReply(): string {
  const replies = [
    "Hey, vertel. Kom je met een startup of idee, een bestaand bedrijf, een AI-groeivraag of als mogelijke partner? Een rommelige zin is genoeg.",
    "Hey. Ik ben Spunky, AI Venture Intake Partner van AIOW. Ik toets of jouw case interessant genoeg is om samen aan te bouwen.",
    "Hey, ik luister. Om te bepalen of AIOW als venture partner waarde kan toevoegen, moet ik eerst begrijpen wie je bent en wat je wilt bouwen.",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
