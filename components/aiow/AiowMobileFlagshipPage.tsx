
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AiowMobileFlagshipPage.module.css";

const WHATSAPP_URL = "https://wa.me/31621898039";

const workflows = [
  {
    key: "klantcontact",
    label: "Klantcontact",
    before: ["Inbox en WhatsApp lopen door elkaar", "Antwoorden hangen af van wie tijd heeft", "Opvolging verdwijnt tussen taken"],
    after: ["AI vat de vraag samen", "Conceptantwoord + juiste eigenaar", "Status zichtbaar tot afgerond"],
    metric: "sneller reageren",
  },
  {
    key: "offertes",
    label: "Offertes",
    before: ["Info zoeken in mails en Excel", "Knip-plakwerk in oude documenten", "Te laat opvolgen"],
    after: ["Context automatisch verzameld", "Offerteconcept in huisstijl", "Reminder en status klaar"],
    metric: "meer offertes de deur uit",
  },
  {
    key: "planning",
    label: "Planning",
    before: ["Losse lijstjes, agenda, WhatsApp", "Wijzigingen handmatig doorgeven", "Niemand ziet de laatste status"],
    after: ["Werk wordt gerouteerd", "Wijziging krijgt eigenaar", "Team ziet wat nu moet gebeuren"],
    metric: "rust in operatie",
  },
  {
    key: "documenten",
    label: "Documenten",
    before: ["Documenten verspreid", "Kennis zit in hoofden", "Data gaat naar losse tools"],
    after: ["Zoeken, samenvatten, controleren", "Lokaal/hybride waar nodig", "Approval bij gevoelige acties"],
    metric: "kennis bruikbaar zonder datalek",
  },
] as const;

const tactics = [
  { key: "proces", title: "Proces", text: "We pakken eerst één werkstroom die elke dag tijd kost: offerte, planning, klantvraag of document." },
  { key: "mens", title: "Mens", text: "AI bereidt voor; de mens houdt approval bij gevoelige, externe of belangrijke stappen." },
  { key: "data", title: "Data", text: "Per proces bepalen we wat lokaal, hybride of cloud mag. Geen losse AI-tools zonder grens." },
] as const;

type WorkflowKey = (typeof workflows)[number]["key"];

function FlagshipCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let hover = false;
    const move = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      hover = Boolean((event.target as HTMLElement | null)?.closest?.("a, button, [role='button']"));
      ring.dataset.hover = hover ? "true" : "false";
    };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hover ? 1.55 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return <div className={styles.cursorLayer} aria-hidden="true"><div ref={ringRef} className={styles.cursorRing} /><div ref={dotRef} className={styles.cursorDot} /></div>;
}

function HeroPromiseStack() {
  return (
    <div className={styles.heroPromiseStack} aria-hidden="true">
      <div className={styles.promiseCard} data-tone="chaos">
        <span>Nu</span>
        <strong>Mail + WhatsApp + Excel</strong>
        <em>geen eigenaar</em>
      </div>
      <div className={styles.promiseBridge}>AIOW proceslaag</div>
      <div className={styles.promiseCard} data-tone="calm">
        <span>Straks</span>
        <strong>Eigenaar + status + approval</strong>
        <em>output loopt door</em>
      </div>
    </div>
  );
}

function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);
  return (
    <figure className={styles.heroFilm} aria-label="AIOW laat losse bedrijfsprocessen rustig samenkomen">
      <video className={styles.desktopHeroVideo} ref={videoRef} src="/aiow/video/aiow-before-after-v1-owner-desk-sound.mp4" autoPlay loop muted={muted} playsInline preload="metadata" />
      <video className={styles.mobileHeroVideo} src="/aiow/video/aiow-mobile-portrait-kling-silent.mp4" autoPlay loop muted playsInline preload="metadata" />
      <div className={styles.heroFilmShade} aria-hidden="true" />
      <HeroPromiseStack />
      <div className={styles.processRail} aria-hidden="true">
        <span>intake</span><i /><span>AI concept</span><i /><span>approval</span><i /><span>output</span>
      </div>
      <button type="button" className={styles.soundToggle} onClick={() => setMuted((value) => !value)} aria-pressed={!muted} aria-label={muted ? "Zet videoggeluid aan" : "Zet videoggeluid uit"}>{muted ? "Geluid aan" : "Geluid uit"}</button>
      <figcaption className={styles.filmCaption}>
        <span>Nu</span><strong>losse tools, handwerk, onzichtbare opvolging</strong>
        <em>AIOW</em>
        <span>Straks</span><strong>eigenaar, status, approval, output</strong>
      </figcaption>
    </figure>
  );
}

function OperatingLayer() {
  return (
    <section className={styles.layerSection} aria-labelledby="layer-title">
      <div className={styles.layerSticky}>
        <p className={styles.eyebrow}>De AIOW proceslaag</p>
        <h2 id="layer-title">Drie dingen moeten direct duidelijk zijn.</h2>
        <p>Proces, mens en data zijn geen bijzaak. Dit is precies waarom AIOW anders voelt dan “we proberen even een AI-tool”.</p>
      </div>
      <div className={styles.layerCards}>
        <article id="proces-principe"><span>01 / Proces</span><h3>Eerst één proces scherp.</h3><p>Mails, offertes, planning of documenten worden geen losse chaos meer maar één zichtbare werkstroom.</p><a href="#workflow-title">Bekijk processen</a></article>
        <article id="mens"><span>02 / Mens</span><h3>AI bereidt voor. Mens beslist.</h3><p>Concepten, samenvattingen en routing zijn snel; risicovolle of externe acties blijven achter approval.</p><a href="#scan">Plan proces-scan</a></article>
        <article id="data"><span>03 / Data</span><h3>Data blijft begrensd.</h3><p>Per proces bepalen we lokaal, hybride of cloud. Geen bedrijfsdata die zomaar in losse tools verdwijnt.</p><a href="#scan">Bespreek datagrens</a></article>
      </div>
    </section>
  );
}

const processSteps = [
  {
    key: "zonder",
    eyebrow: "Stap 1 / Zonder AIOW",
    title: "Een offerte-aanvraag raakt verspreid.",
    text: "Mail, WhatsApp, Excel en oude documenten trekken tegelijk aandacht. Niemand ziet direct wie eigenaar is.",
    nodes: ["Inbox", "WhatsApp", "Excel", "Oude offerte"],
    status: "Status onbekend",
    result: "4 losse plekken",
  },
  {
    key: "proceslaag",
    eyebrow: "Stap 2 / AIOW proceslaag",
    title: "AI maakt er één werkstroom van.",
    text: "AIOW vat samen, haalt context op, maakt een concept en zet de taak klaar voor menselijke approval.",
    nodes: ["Samenvatting", "Context", "Concept", "Approval"],
    status: "Klaar voor check",
    result: "één werkstroom",
  },
  {
    key: "met",
    eyebrow: "Stap 3 / Met AIOW",
    title: "Het werk loopt zichtbaar door.",
    text: "De eigenaar, status en volgende stap zijn duidelijk. De offerte kan sneller en gecontroleerd de deur uit.",
    nodes: ["Eigenaar", "Status", "Volgende stap", "Output"],
    status: "Sanne keurt goed",
    result: "controleerbare output",
  },
] as const;

type ProcessStepKey = (typeof processSteps)[number]["key"];

function ProcessSimulator() {
  const [activeStep, setActiveStep] = useState<ProcessStepKey>("zonder");
  const active = processSteps.find((step) => step.key === activeStep) ?? processSteps[0];

  return (
    <section id="proces" className={styles.simSection} aria-labelledby="workflow-title">
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>Interactieve processcan</p>
        <h2 id="workflow-title">Volg één offerte-aanvraag van chaos naar controle.</h2>
        <p>Niet vier losse lijstjes. Eén herkenbaar scenario dat laat voelen wat AIOW in je bedrijf verandert.</p>
      </div>

      <div className={styles.simShell}>
        <div className={styles.simIntro}>
          <strong>Tik door de transformatie</strong>
          <span>1 chaos → 2 proceslaag → 3 controle</span>
        </div>
        <div className={styles.simControls} role="tablist" aria-label="Processtappen">
          {processSteps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              role="tab"
              aria-selected={step.key === activeStep}
              onClick={() => setActiveStep(step.key)}
            >
              <span>{index + 1}</span>
              <strong>{step.key === "zonder" ? "Zonder" : step.key === "proceslaag" ? "AIOW" : "Met"}</strong>
              <small>{step.result}</small>
            </button>
          ))}
        </div>

        <div className={styles.simStage} data-step={active.key}>
          <div className={styles.simPhone} aria-label="Procesvisualisatie offerte-aanvraag">
            <div className={styles.phoneTop}><i /><span>Nieuwe offerte-aanvraag</span></div>
            <div className={styles.nodeField}>
              {active.nodes.map((node, index) => <span key={node} style={{ "--i": index } as React.CSSProperties}>{node}</span>)}
              <strong>AIOW</strong>
              <em>{active.status}</em>
            </div>
            <div className={styles.approvalBar}>
              <span>{active.key === "zonder" ? "Wie pakt dit op?" : active.key === "proceslaag" ? "Menselijke check nodig" : "Goedgekeurd voor opvolging"}</span>
              <button type="button" disabled={active.key === "zonder"}>{active.key === "zonder" ? "Wacht" : "Approve"}</button>
            </div>
          </div>

          <article className={styles.simCopy}>
            <span>{active.eyebrow}</span>
            <h3>{active.title}</h3>
            <p>{active.text}</p>
            <div className={styles.simOutcome}><b>Resultaat</b><strong>{active.result}</strong></div>
          </article>
        </div>

        <div className={styles.mobileStepHint}>Tik 1, 2 of 3. De visual verandert mee.</div>
      </div>
    </section>
  );
}

export function AiowMobileFlagshipPage() {
  return (
    <main className={styles.page}>
      <FlagshipCursor />
      <header className={styles.header}>
        <Link href="/nl" className={styles.brand} aria-label="AIOW live pagina"><span className={styles.mark}>A</span><span className={styles.word}>AIOW</span></Link>
        <nav className={styles.nav} aria-label="Preview navigatie"><a href="#proces">Proces</a><a href="#scan">Scan</a></nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>AI die je bedrijf merkbaar rustiger maakt</p>
          <h1>Van dagelijkse chaos naar een bedrijf dat doorloopt.</h1>
          <p className={styles.lede}>Wij maken één vastlopend proces rustig, zichtbaar en veilig met AI.</p>
          <div className={styles.tacticSwitch} aria-label="AIOW kernprincipes">
            {tactics.map((tactic) => (
              <a key={tactic.key} href={`#${tactic.key}`} className={styles.tacticPill}>
                <span>{tactic.title}</span>
                <small>{tactic.text}</small>
              </a>
            ))}
          </div>
          <div className={styles.heroActions}><a className={styles.primary} href={WHATSAPP_URL} target="_blank" rel="noopener">Plan proces-scan</a><a className={styles.secondary} href="#proces">Zie hoe het werkt</a></div>
        </div>
        <HeroFilm />
      </section>

      <section className={styles.convictionStrip} aria-label="AIOW kernbelofte">
        <strong>Geen losse AI-tool.</strong>
        <span>Één proces scherp → AI bereidt voor → mens keurt goed → output loopt door.</span>
      </section>

      <OperatingLayer />
      <ProcessSimulator />

      <section className={styles.guardSection} aria-label="AIOW veiligheidsprincipes">
        <article><span>Controle</span><strong>Mens voor risicovolle acties</strong><p>Externe, gevoelige of financiële stappen gaan niet blind automatisch.</p></article>
        <article><span>Data</span><strong>Lokaal, hybride of cloud per proces</strong><p>We bepalen vooraf wat waar mag draaien en wat niet naar losse tools gaat.</p></article>
        <article><span>Bewijs</span><strong>Status, eigenaar en output</strong><p>Niet alleen een AI-antwoord, maar een werkstroom die te controleren is.</p></article>
      </section>

      <section id="scan" className={styles.scanCta}>
        <p className={styles.eyebrow}>Gratis eerste stap</p>
        <h2>Laat één proces doorlichten.</h2>
        <p>We kiezen samen klantcontact, offertes, planning of documenten — en laten zien waar AI veilig tijd terugwint.</p>
        <a className={styles.primary} href={WHATSAPP_URL} target="_blank" rel="noopener">Plan de AI-systeemscan via WhatsApp</a>
      </section>
    </main>
  );
}
