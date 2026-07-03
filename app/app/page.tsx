"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./AiowAppShell.module.css";

const nav = ["Home", "Workspace", "Chat", "Team", "Account"];

type VentureCanvas = {
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
  memoryEventCount: number;
};

type MemoryEvent = {
  id: string;
  role: "user" | "ai" | "system";
  type: string;
  content: string;
  createdAt: string;
};

type SessionSnapshot = {
  ok?: boolean;
  storageMode?: string;
  memorySessionId?: string;
  canvas?: VentureCanvas;
  dealCard?: { title?: string; likelyRoute?: string; nextStep?: string; confidence?: number } | null;
  events?: MemoryEvent[];
};

type AccountSnapshot = {
  ok?: boolean;
  account?: {
    accountId: string;
    status: string;
    companyName: string;
    contactName: string;
    projectName: string;
    projectType: string;
    onboardingId?: string;
    analysisReadinessScore?: number;
    customerNextSteps?: string[];
    aiowNextSteps?: string[];
  };
};

const emptyCanvas: VentureCanvas = {
  project: "Nog niet gekozen",
  founder: "Venture Memory pending",
  problem: "Wordt opgebouwd via intake",
  solution: "Nog niet ingevuld",
  businessModel: "Nog niet ingevuld",
  audience: "Nog te valideren",
  aiOpportunities: "Research AI wacht op context",
  risk: "Nog niet beoordeeld",
  automation: "Nog niet beoordeeld",
  growth: "Nog niet beoordeeld",
  collaboration: "Project, share, equity of mix",
  confidence: 10,
  marketScore: 0,
  riskScore: 0,
  aiScore: 0,
  automationScore: 0,
  memoryEventCount: 0,
};

export default function AiowAppPage() {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    const sessionId = window.localStorage.getItem("aiow:ventureSessionId");
    const accountId = window.localStorage.getItem("aiow:lastAccountId");
    const accessCode = window.localStorage.getItem("aiow:lastAccessCode");

    if (accountId && accessCode) {
      fetch(`/api/customer-accounts?accountId=${encodeURIComponent(accountId)}&accessCode=${encodeURIComponent(accessCode)}`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((data: AccountSnapshot | null) => {
          setAccountSnapshot(data);
          const linkedSession = data?.account?.onboardingId || sessionId;
          if (!linkedSession) {
            setStatus(data?.ok ? "ready" : "empty");
            return;
          }
          return fetch(`/api/venture-memory/session?sessionId=${encodeURIComponent(linkedSession)}`, { cache: "no-store" })
            .then((response) => response.ok ? response.json() : null)
            .then((memory: SessionSnapshot | null) => {
              setSnapshot(memory);
              setStatus(memory?.ok || data?.ok ? "ready" : "empty");
            });
        })
        .catch(() => loadSessionOnly(sessionId));
      return;
    }

    loadSessionOnly(sessionId);

    function loadSessionOnly(currentSessionId: string | null) {
      if (!currentSessionId) {
        setStatus("empty");
        return;
      }
      fetch(`/api/venture-memory/session?sessionId=${encodeURIComponent(currentSessionId)}`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((data: SessionSnapshot | null) => {
          setSnapshot(data);
          setStatus(data?.ok ? "ready" : "empty");
        })
        .catch(() => setStatus("empty"));
    }
  }, []);

  const account = accountSnapshot?.account;
  const portalHref = account ? `/portal/customer/${account.accountId}` : "/portal";
  const canvas = snapshot?.canvas || emptyCanvas;
  const agents = useMemo(() => buildAgents(canvas), [canvas]);
  const activity = useMemo(() => buildActivity(snapshot?.events || [], snapshot), [snapshot]);
  const scoreText = canvas.confidence >= 70
    ? "Genoeg context voor Team AIOW review. Scope, bewijs en afspraak blijven verplicht."
    : canvas.confidence >= 40
      ? "Eerste richting zichtbaar. Meer markt, budget en bewijs maken de Deal Card sterker."
      : "Te vroeg voor partnerbesluit. Start of hervat de Spunky intake.";

  return (
    <main className={styles.page} data-aiow-app-shell="venture-os-live-memory-v1">
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <span>A</span>
          <div>
            <strong>AIOW</strong>
            <em>Venture OS</em>
          </div>
        </Link>
        <nav>
          {nav.map((item) => (
            <Link key={item} href={item === "Chat" ? "/intake" : "/app"} className={item === "Home" ? styles.active : ""}>{item}</Link>
          ))}
        </nav>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>{account ? `${account.status}, ${snapshot?.storageMode || "workspace"}` : status === "ready" ? `Live memory, ${snapshot?.storageMode || "store"}` : "Private workspace"}</p>
            <h1>{account?.projectName || "Je AI Venture OS."}</h1>
          </div>
          <div className={styles.topActions}>
            <Link href="/intake">Open Spunky Chat</Link>
            <Link href={portalHref}>Open klantportaal</Link>
          </div>
        </header>

        <section className={styles.grid}>
          <article className={styles.heroCard}>
            <span>Volgende stap</span>
            <h2>{snapshot?.dealCard?.nextStep || nextStep(canvas, status)}</h2>
            <p>{account?.customerNextSteps?.[0] || canvas.collaboration}</p>
            {account ? <Link className={styles.inlineAction} href={portalHref}>Ga verder in je klantportaal</Link> : null}
            <div className={styles.progress}><i style={{ width: `${Math.max(8, canvas.confidence)}%` }} /></div>
          </article>

          <article className={styles.scoreCard}>
            <span>Laatst bijgewerkte Venture Score</span>
            <strong>{Math.max(10, canvas.confidence)}%</strong>
            <p>{scoreText}</p>
          </article>

          <article className={styles.canvasCard}>
            <div className={styles.sectionTitle}><span>Live Venture Canvas</span><b>{canvas.memoryEventCount || 0} events</b></div>
            <div className={styles.canvasList}>
              {canvasRows(canvas).map(([label, value]) => (
                <div key={label}>
                  <strong>{label}</strong>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.teamCard}>
            <div className={styles.sectionTitle}><span>AI Team</span><b>{agents.filter((agent) => agent.state !== "Stand-by").length} actief</b></div>
            {agents.map((agent) => (
              <div className={styles.agent} key={agent.name}>
                <i />
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.task}</p>
                </div>
                <span>{agent.state}</span>
              </div>
            ))}
          </article>

          <article className={styles.activityCard}>
            <div className={styles.sectionTitle}><span>Activity Timeline</span><b>Live</b></div>
            {activity.map((item) => (
              <div className={styles.timeline} key={item}>
                <i />
                <p>{item}</p>
              </div>
            ))}
          </article>
        </section>
      </section>

      <nav className={styles.mobileNav} aria-label="Mobile AIOW navigation">
        <Link href="/app">Home</Link>
        <Link href="/app">Workspace</Link>
        <Link className={styles.chatButton} href="/intake">Chat</Link>
        <Link href="/app">Team</Link>
        <Link href="/app">Account</Link>
      </nav>
    </main>
  );
}

function canvasRows(canvas: VentureCanvas): Array<[string, string]> {
  return [
    ["Project", canvas.project],
    ["Founder", canvas.founder],
    ["Probleem", canvas.problem],
    ["Oplossing", canvas.solution],
    ["Businessmodel", canvas.businessModel],
    ["Doelgroep", canvas.audience],
    ["AI kansen", canvas.aiOpportunities],
    ["Risico", canvas.risk],
    ["Groei", canvas.growth],
    ["Samenwerking", canvas.collaboration],
  ];
}

function buildAgents(canvas: VentureCanvas) {
  return [
    { name: "Strategy AI", task: canvas.problem !== "Wordt opgebouwd via intake" ? "Route en fit aangescherpt" : "Wacht op probleem", state: canvas.confidence > 20 ? "Live" : "Stand-by" },
    { name: "Research AI", task: canvas.audience !== "Nog te valideren" ? "Markt en doelgroep zichtbaar" : "Wacht op doelgroep", state: canvas.marketScore >= 4 ? "Live" : "Wacht" },
    { name: "Finance AI", task: canvas.businessModel !== "Nog niet ingevuld" ? "Dealmodel in opbouw" : "Wacht op model", state: canvas.confidence >= 45 ? "Live" : "Stand-by" },
    { name: "Development AI", task: canvas.solution !== "Nog niet ingevuld" ? "Build scope inschatten" : "Wacht op oplossing", state: canvas.aiScore >= 5 ? "Live" : "Stand-by" },
    { name: "Marketing AI", task: canvas.growth !== "Nog niet beoordeeld" ? "Growth kansen zichtbaar" : "Wacht op kanaal", state: canvas.confidence >= 35 ? "Live" : "Stand-by" },
    { name: "Legal AI", task: canvas.risk !== "Nog niet beoordeeld" ? "Risico en afspraken checken" : "Wacht op context", state: canvas.riskScore >= 4 ? "Live" : "Stand-by" },
  ];
}

function buildActivity(events: MemoryEvent[], snapshot: SessionSnapshot | null): string[] {
  if (!events.length) return ["Nog geen Venture Memory in deze browser. Start met Spunky Chat."];
  const latest = events.slice(-5).map((event) => {
    if (event.type === "contact_linked") return "Contact en toestemming gekoppeld aan Venture Memory";
    if (event.type === "deal_card") return "Deal Card aangemaakt voor Team AIOW review";
    if (event.role === "user") return `Founder input: ${event.content.slice(0, 72)}`;
    if (event.role === "ai") return `Spunky antwoordde: ${event.content.slice(0, 72)}`;
    return `Systeem event: ${event.type}`;
  });
  if (snapshot?.dealCard?.title) latest.push(`Laatste Deal Card: ${snapshot.dealCard.title}`);
  return latest;
}

function nextStep(canvas: VentureCanvas, status: "loading" | "ready" | "empty"): string {
  if (status === "loading") return "Venture Memory laden";
  if (status === "empty") return "Start je Spunky intake";
  if (canvas.confidence >= 70) return "Vraag Team AIOW om review";
  if (canvas.confidence >= 40) return "Maak je intake compleet";
  return "Geef Spunky meer context";
}
