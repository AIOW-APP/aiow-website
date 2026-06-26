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
  "Welkom. Ik ben je AI Venture Partner. Vertel me waar je aan wilt bouwen.";

export function AiowAiHomepage() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [state, setState] = useState<IntakeState>("idle");
  const [input, setInput] = useState("");
  const [canvas, setCanvas] = useState<Canvas>(initialCanvas);
  const [contact, setContact] = useState({ name: "", email: "", company: "", consent: false });
  const [sessionId, setSessionId] = useState("");
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>("temporary");
  const [dealCardTitle, setDealCardTitle] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "ai", text: firstMessage, time: "nu" },
  ]);

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
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

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

    const nextCanvas = mergeCanvas(canvas, text, true);
    setCanvas(nextCanvas);
    setInput("");
    setState("thinking");

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text, time: "nu" };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/spunky/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: text.toLowerCase().includes("bedrijf") ? "company" : "idea",
          visitorMessageCount: userCount + 1,
          sessionId,
          canvas: nextCanvas,
          transcript: nextMessages.map((message) => `${message.role}: ${message.text}`).join("\n"),
          page: "aiow-v4-ai-venture-experience",
        }),
      });
      const data = (await response.json()) as { reply?: string; leadGate?: boolean; memorySessionId?: string };
      const reply = refineReply(data.reply, text, userCount + 1);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "ai", text: reply, time: "nu" }]);
      if (data.memorySessionId && data.memorySessionId !== sessionId) setSessionId(data.memorySessionId);
      setState(data.leadGate || userCount >= 2 ? "consent" : "briefing");
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
      const data = (await response.json()) as { ok?: boolean; dealCard?: { title?: string } };
      const nextDealCardTitle = data.dealCard?.title || "Deal Card aangemaakt";
      if (response.ok && data.ok) {
        finalDealCardTitle = nextDealCardTitle;
        setMemoryStatus("linked");
        setDealCardTitle(nextDealCardTitle);
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
    <main className={styles.page} data-aiow-homepage="ai-is-the-homepage-v2">
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
            <h1>Vertel wat je wilt bouwen.</h1>
            <span>Wij bouwen de digitale toekomst met je mee.</span>
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

          <div className={styles.thread} aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={message.role === "ai" ? styles.aiBubble : styles.userBubble}>
                <p>{message.text}</p>
                <time>{message.time}</time>
              </article>
            ))}
            {state === "thinking" ? <ThinkingCard progress={thinkingProgress} /> : null}
          </div>

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
              aria-label="Vertel AIOW waar je aan wilt bouwen"
              value={input}
              onChange={onInput}
              onKeyDown={onComposerKeyDown}
              placeholder="Vertel me wat je wilt bouwen..."
              rows={2}
            />
            <div className={styles.composerActions} aria-label="Input opties">
              <button type="button" title="Tools">+</button>
              <button type="button" title="Voice input">Praat</button>
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

      <section className={styles.mobileCards} aria-label="Swipeable Venture Canvas">
        <MobileCard title="Business" value={activeCanvas.project} detail={activeCanvas.businessModel} score={activeCanvas.confidence} />
        <MobileCard title="Probleem" value={activeCanvas.problem} detail={activeCanvas.solution} score={activeCanvas.marketScore} />
        <MobileCard title="AI kansen" value={activeCanvas.aiOpportunities} detail={activeCanvas.automation} score={activeCanvas.aiScore} />
        <MobileCard title="Risico" value={activeCanvas.risk} detail={activeCanvas.collaboration} score={activeCanvas.riskScore} />
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

      {showContact ? (
        <section className={styles.contactGate} aria-label="Magic link account">
          <div>
            <p>Magic link account</p>
            <h2>Wil je dat AIOW deze venture intake bewaart?</h2>
            <span>Je tijdelijke Venture Memory wordt gekoppeld aan je account. We mailen alleen persoonlijk over deze kans als jij toestemming geeft.</span>
          </div>
          <form onSubmit={submitContact}>
            <input aria-label="Naam" placeholder="Naam" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
            <input aria-label="E-mail" placeholder="Zakelijke e-mail" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
            <input aria-label="Bedrijf" placeholder="Bedrijf optioneel" value={contact.company} onChange={(event) => setContact({ ...contact, company: event.target.value })} />
            <label>
              <input type="checkbox" checked={contact.consent} onChange={(event) => setContact({ ...contact, consent: event.target.checked })} />
              <span>AIOW mag deze context opslaan en mij gericht mailen over deze kans.</span>
            </label>
            <button type="submit" disabled={!contact.name.trim() || !contact.email.trim() || !contact.consent}>Maak private intake</button>
          </form>
        </section>
      ) : null}
    </main>
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
  return (
    <article className={styles.mobileCard}>
      <span>{title}</span>
      <h3>{value}</h3>
      <p>{detail}</p>
      <strong>{score}/100</strong>
    </article>
  );
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
  if (canvas.project !== "Nog niet ingevuld") return ["Waar zit de meeste omzetlekkage?", "Welke data heb je al?", "Wat moet binnen 30 dagen bewezen zijn?"];
  return ["Ik heb een startup of idee", "Ik heb een bestaand bedrijf", "Ik wil processen automatiseren", "Ik wil groeien met AI"];
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
  if (reply?.trim()) return reply.trim();
  return localReply(text, count);
}

function localReply(text: string, count: number): string {
  const lower = text.toLowerCase();
  if (isGreeting(lower)) return greetingReply();
  if (count >= 3) return "Ik heb genoeg context voor een eerste route. Als je wilt, koppel ik nu naam en e-mail zodat je Venture Memory niet verloren gaat en Team AIOW dit serieus kan beoordelen.";
  if (includesAny(lower, ["lead", "offerte", "sales"])) return "Interessant. De kans zit waarschijnlijk in capture, scoring en opvolging. Mijn vraag: waar valt de meeste waarde weg, bij binnenkomst, offerte of opvolging?";
  if (includesAny(lower, ["bedrijf", "proces", "automatis"])) return "Ik hoor een operationele kans. Mijn vraag: welk proces kost vandaag het meeste tijd en wat zou er binnen 30 dagen meetbaar beter moeten zijn?";
  if (includesAny(lower, ["startup", "idee", "app"])) return "Ik hoor een mogelijke venture. Mijn vraag: welk bewijs heb je al dat klanten dit probleem urgent genoeg vinden?";
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
    "Hey, vertel. Wat wil je bouwen, automatiseren of laten groeien? Je mag rommelig beginnen, ik structureer het voor je.",
    "Hey. Geef me één zin over je idee of bedrijf, dan bouw ik meteen je eerste Venture Memory op.",
    "Hey, ik luister. Waar zit de kans: meer leads, minder handwerk, een nieuw product of iets dat nog vaag is?",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
