"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, KeyboardEvent, RefObject, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AiowAiHomepage.module.css";

type IntakeState = "idle" | "typing" | "thinking" | "briefing" | "consent" | "review";
type MemoryStatus = "temporary" | "linked";
type Role = "ai" | "user";
type MobileTab = "home" | "workspace" | "chat" | "team" | "account";

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
  const [portalUrl, setPortalUrl] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("home");
  const [mobileTypingMode, setMobileTypingMode] = useState(false);
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
    if (window.matchMedia("(min-width: 881px)").matches) {
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    }
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
      const data = (await response.json()) as { ok?: boolean; portalUrl?: string; dealCard?: { title?: string } };
      if (response.ok && data.ok) {
        setMemoryStatus("linked");
        setDealCardTitle(data.dealCard?.title || "Deal Card aangemaakt");
        setPortalUrl(data.portalUrl || "");
      }
    } catch {
      setDealCardTitle("Deal Card lokaal voorbereid");
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
        text: `Je Venture Memory is gekoppeld. ${dealCardTitle || "Ik heb een eerste Deal Card voorbereid"}. Open je project workspace om extra context te delen. Als alles compleet is, maakt Team AIOW een voorstel. Na ondertekening kan de bouwfase starten.`,
        time: "nu",
      },
    ]);
  }

  return (
    <main className={styles.page} data-aiow-homepage="aiow-venture-os-v5">
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <MobileVentureOs
        activeTab={mobileTab}
        setActiveTab={setMobileTab}
        messages={messages}
        state={state}
        activeCanvas={activeCanvas}
        quickActions={quickActions}
        input={input}
        inputRef={inputRef}
        onInput={onInput}
        onComposerKeyDown={onComposerKeyDown}
        submitPrompt={submitPrompt}
        memoryStatus={memoryStatus}
        contactLinked={Boolean(portalUrl) || memoryStatus === "linked"}
        mobileTypingMode={mobileTypingMode}
        setMobileTypingMode={setMobileTypingMode}
      />

      <section className={styles.frame} aria-label="AIOW AI Venture Interface">
        <aside className={styles.leftRail} aria-label="AIOW status">
          <div className={styles.railTopbar}>
            <Link href="/" className={styles.brand} aria-label="AIOW home">
              <span className={styles.logo}>A</span>
              <span>
                <strong>AIOW.ai</strong>
                <em>AI Venture Partner</em>
              </span>
            </Link>
            <TopbarActions />
          </div>

          <div className={styles.mission}>
            <p>AI Venture Operating System</p>
            <h1>Ontmoet je digitale venture partner.</h1>
            <span>Geen softwarelaag. Een gesprek dat Venture Memory, Deal Card en menselijke review opbouwt.</span>
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
            <StatusLine label="AI Presence" value={state === "thinking" ? "Thinking" : state === "typing" ? "Listening" : "Observing"} active />
            <StatusLine label="Memory" value={memoryStatus === "linked" ? "Linked" : "Temporary"} />
            <StatusLine label="Human review" value="Required" />
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
              <TopbarActions compact />
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

          <section className={styles.mobileCards} aria-label="Inklapbare Venture Memory">
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
              aria-label="Vertel AIOW waar je aan wilt bouwen"
              value={input}
              onChange={onInput}
              onKeyDown={onComposerKeyDown}
              placeholder="Vertel me wat je wilt bouwen..."
              rows={1}
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
            {canvasLabels
              .filter((item) => hasCanvasValue(activeCanvas[item.key]))
              .map((item) => (
                <CanvasRow key={String(item.key)} icon={item.icon} label={item.label} value={activeCanvas[item.key]} />
              ))}
            {!canvasLabels.some((item) => hasCanvasValue(activeCanvas[item.key])) ? (
              <div className={styles.emptyCanvas}>
                <strong>Venture Memory wacht op je eerste signaal.</strong>
                <p>Typ één rommelige zin. AIOW haalt er opportunity, risico, missing proof en beste volgende vraag uit.</p>
              </div>
            ) : null}
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


      {userCount > 0 || state === "typing" || state === "thinking" ? (
        <section className={styles.thinkingDock} aria-label="AI thinking analyse">
          {thinkingSteps.map((step, index) => (
            <div key={step} className={styles.thinkingTile}>
              <span>{step}</span>
              <div><i style={{ width: `${thinkingProgress[index]}%` }} /></div>
              <strong>{thinkingProgress[index]}%</strong>
            </div>
          ))}
        </section>
      ) : null}

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
            {portalUrl ? <a href={portalUrl}>Open project workspace</a> : null}
          </form>
        </section>
      ) : null}
    </main>
  );
}


function MobileVentureOs({
  activeTab,
  setActiveTab,
  messages,
  state,
  activeCanvas,
  quickActions,
  input,
  inputRef,
  onInput,
  onComposerKeyDown,
  submitPrompt,
  memoryStatus,
  contactLinked,
  mobileTypingMode,
  setMobileTypingMode,
}: {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  messages: Message[];
  state: IntakeState;
  activeCanvas: Canvas;
  quickActions: string[];
  input: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInput: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  submitPrompt: (prompt?: string) => void;
  memoryStatus: MemoryStatus;
  contactLinked: boolean;
  mobileTypingMode: boolean;
  setMobileTypingMode: (value: boolean) => void;
}) {
  const knownItems = canvasLabels.filter((item) => hasCanvasValue(activeCanvas[item.key])).slice(0, 4);
  const isChatTyping = activeTab === "chat" && mobileTypingMode;
  const mobileThreadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab !== "chat") return;
    const thread = mobileThreadRef.current;
    if (!thread) return;
    const scrollToLatest = () => {
      thread.scrollTop = thread.scrollHeight;
    };
    requestAnimationFrame(scrollToLatest);
    const timer = window.setTimeout(scrollToLatest, 180);
    return () => window.clearTimeout(timer);
  }, [activeTab, messages.length, state, mobileTypingMode]);

  return (
    <section className={`${styles.mobileOs} ${isChatTyping ? styles.mobileTypingMode : ""}`} aria-label="AIOW mobile app shell" data-mobile-tab={activeTab} data-typing-mode={isChatTyping ? "true" : "false"}>
      <header className={styles.mobileTopbar}>
        <Link href="/" className={styles.brand} aria-label="AIOW home">
          <span className={styles.logo}>A</span>
          <span>
            <strong>AIOW.ai</strong>
            <em>{state === "thinking" ? "Thinking" : state === "typing" ? "Listening" : "AI Venture OS"}</em>
          </span>
        </Link>
        <TopbarActions />
      </header>

      {activeTab === "home" ? (
        <section className={styles.mobileScreen} aria-label="AIOW Home">
          <p className={styles.mobileKicker}>Welkom.</p>
          <h1>Laten we vandaag samen bouwen.</h1>
          <div className={styles.mobileBriefingCard}>
            <span>AI briefing</span>
            <strong>{messages.length > 1 ? "Ik heb je eerste signalen verwerkt." : "Vertel me wat je wilt bouwen, automatiseren of laten groeien."}</strong>
            <p>{messages.length > 1 ? "Open Chat om door te gaan of bekijk Workspace voor de eerste Venture Memory." : "Eén rommelige zin is genoeg. AIOW structureert het naar opportunity, risico en volgende stap."}</p>
            <button type="button" onClick={() => setActiveTab("chat")}>Open mijn AI</button>
          </div>
          <div className={styles.mobileDecisionGrid}>
            <MobileDecision title="Memory" value={memoryStatus === "linked" ? "Gekoppeld" : "Tijdelijk"} />
            <MobileDecision title="Review" value="Mens beslist" />
            <MobileDecision title="Deal Card" value={activeCanvas.confidence > 55 ? "In opbouw" : "Nog niet klaar"} />
            <MobileDecision title="Next step" value={activeCanvas.confidence > 55 ? "Missing proof" : "Eerste signaal"} />
          </div>
        </section>
      ) : null}

      {activeTab === "workspace" ? (
        <section className={styles.mobileScreen} aria-label="Workspace">
          <p className={styles.mobileKicker}>Workspace</p>
          <h1>Venture Memory</h1>
          <div className={styles.mobileCardStack}>
            {knownItems.length ? knownItems.map((item) => (
              <article key={String(item.key)} className={styles.mobileVentureCard}>
                <span>{item.label}</span>
                <strong>{formatCanvasValue(activeCanvas[item.key])}</strong>
                <p>{item.key === "collaboration" ? "AI adviseert. Team AIOW beslist." : "Afgeleid uit het gesprek, nog te valideren met bewijs."}</p>
              </article>
            )) : (
              <article className={styles.mobileVentureCard}>
                <span>Nog leeg</span>
                <strong>Je workspace ontstaat vanuit het gesprek.</strong>
                <p>Open Chat en vertel wat je wilt bouwen. We tonen hier alleen wat AIOW weet.</p>
              </article>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "chat" ? (
        <section className={styles.mobileChatScreen} aria-label="Fullscreen AI chat">
          <div className={styles.mobilePresence}>
            <span className={styles.liveDot} />
            <span>{state === "thinking" ? "Reasoning" : state === "typing" ? "Listening" : contactLinked ? "Memory linked" : "Temporary memory"}</span>
          </div>
          <div ref={mobileThreadRef} className={styles.mobileThread} aria-live="polite">
            <div className={styles.mobileThreadInner}>
              {messages.map((message) => (
                <article key={message.id} className={message.role === "ai" ? styles.aiBubble : styles.userBubble}>
                  <p>{message.text}</p>
                  <time>{message.time}</time>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.mobileMemoryStrip}>
            <button type="button" onClick={() => setActiveTab("workspace")}>Memory {knownItems.length || 0}</button>
            <button type="button" onClick={() => setActiveTab("team")}>Team</button>
            <button type="button" onClick={() => setActiveTab("account")}>Privacy</button>
          </div>
          <div className={styles.mobileTypingHint} aria-hidden={!isChatTyping}>
            <span>{knownItems.length ? "Memory actief" : "Ik luister"}</span>
          </div>
          <div className={styles.mobileQuickActions}>
            {quickActions.slice(0, 3).map((action) => <button key={action} type="button" onClick={() => submitPrompt(action)}>{action}</button>)}
          </div>
          <form className={styles.mobileComposer} onSubmit={(event) => { event.preventDefault(); submitPrompt(); }}>
            <button type="button" aria-label="Open tools">+</button>
            <textarea
              ref={inputRef}
              aria-label="Vertel AIOW waar je aan wilt bouwen"
              value={input}
              onChange={onInput}
              onKeyDown={onComposerKeyDown}
              onFocus={() => setMobileTypingMode(true)}
              onBlur={() => window.setTimeout(() => setMobileTypingMode(false), 140)}
              placeholder="Typ één zin..."
              rows={1}
            />
            <button type="submit" disabled={!input.trim()} aria-label="Stuur bericht">➤</button>
          </form>
        </section>
      ) : null}

      {activeTab === "team" ? (
        <section className={styles.mobileScreen} aria-label="AI Team">
          <p className={styles.mobileKicker}>AI Team</p>
          <h1>Experts werken vanuit dezelfde memory.</h1>
          <div className={styles.mobileAgentList}>
            {aiTeam.map((agent, index) => (
              <article key={agent.name}>
                <span>{agent.icon}</span>
                <div>
                  <strong>{agent.name}</strong>
                  <p>{index < 2 && activeCanvas.confidence > 30 ? agent.task : "Waiting for enough context"}</p>
                </div>
                <em>{index < 2 && activeCanvas.confidence > 30 ? "Active" : "Waiting"}</em>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "account" ? (
        <section className={styles.mobileScreen} aria-label="Account">
          <p className={styles.mobileKicker}>Account</p>
          <h1>Controle over memory en privacy.</h1>
          <div className={styles.mobileSettingsList}>
            <Link href="/portal">Log in met magic link</Link>
            <button type="button">Bekijk Venture Memory</button>
            <button type="button">Gegevens exporteren</button>
            <button type="button">Privacy beheren</button>
          </div>
        </section>
      ) : null}

      <nav className={styles.mobileBottomNav} aria-label="Mobiele navigatie">
        <button type="button" aria-label="Home" title="Home" className={activeTab === "home" ? styles.mobileNavActive : ""} onClick={() => setActiveTab("home")}>⌂</button>
        <button type="button" aria-label="Workspace" title="Workspace" className={activeTab === "workspace" ? styles.mobileNavActive : ""} onClick={() => setActiveTab("workspace")}>◈</button>
        <button type="button" aria-label="Chat" title="Chat" className={`${styles.mobileChatAction} ${activeTab === "chat" ? styles.mobileNavActive : ""}`} onClick={() => setActiveTab("chat")}>✦</button>
        <button type="button" aria-label="Team" title="Team" className={activeTab === "team" ? styles.mobileNavActive : ""} onClick={() => setActiveTab("team")}>◎</button>
        <button type="button" aria-label="Account" title="Account" className={activeTab === "account" ? styles.mobileNavActive : ""} onClick={() => setActiveTab("account")}>●</button>
      </nav>
    </section>
  );
}

function MobileDecision({ title, value }: { title: string; value: string }) {
  return (
    <article>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}


function TopbarActions({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? `${styles.topbarActions} ${styles.topbarActionsCompact}` : styles.topbarActions} aria-label="Account en taal">
      <Link href="/portal" aria-label="Log in" title="Log in">👤</Link>
      <Link href="/?lang=nl" aria-label="Nederlands" title="Nederlands">🇳🇱</Link>
      <Link href="/?lang=en" aria-label="English" title="English">🇬🇧</Link>
    </div>
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
        <p>{display}</p>
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

function MobileCard({ title, value, detail, score, defaultOpen = false }: { title: string; value: string; detail: string; score: number; defaultOpen?: boolean }) {
  const shownScore = score > 10 ? `${score}%` : score ? `${score}/10` : "nieuw";
  return (
    <details className={styles.mobileCard} open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <strong>{shownScore}</strong>
      </summary>
      <h3>{value}</h3>
      <p>{detail}</p>
    </details>
  );
}

function mergeCanvas(current: Canvas, text: string, committed = false): Canvas {
  if (!text.trim()) return current;
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


function hasCanvasValue(value: string | number): boolean {
  if (typeof value === "number") return value > 0;
  if (!value) return false;
  const lower = value.toLowerCase();
  return !lower.includes("nog niet") && !lower.includes("nog te weinig");
}

function formatCanvasValue(value: string | number): string {
  if (typeof value === "number") return value > 10 ? `${value}%` : `${value}/10`;
  return value;
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
