"use client";

import { useEffect, useMemo, useState } from "react";

type Scene = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  proof: string;
  state: string;
  desktop: string;
  mobile: string;
  motionDesktop?: string;
  nativeLock?: boolean;
  theme: "dark" | "light";
};

const scenes: Scene[] = [
  {
    id: "mess-before-ai",
    kicker: "01 / Locked work",
    title: "Work arrives locked.",
    body: "Chats, mail, docs and decisions land as separate fragments.",
    proof: "Visible slot first. Then the layer wakes.",
    state: "dormant",
    desktop: "/aiow/story-v415/desktop/01-mess-before-ai.png",
    mobile: "/aiow/story-v415/mobile/01-mess-before-ai.png",
    theme: "dark",
  },
  {
    id: "intake-hub",
    kicker: "02 / Intake hub",
    title: "One place to enter.",
    body: "The key turns scattered input into owned, routed work.",
    proof: "The intake slot turns. Channels fold into one queue.",
    state: "listening",
    desktop: "/aiow/story-v415/desktop/02-intake-hub.png",
    mobile: "/aiow/story-v415/mobile/02-intake-hub.png",
    nativeLock: true,
    theme: "light",
  },
  {
    id: "private-boundary",
    kicker: "03 / Private boundary",
    title: "Some work stays inside.",
    body: "AIOW decides what runs local, masked or cloud-safe.",
    proof: "The boundary lock opens. Safe routes light up inside the layer.",
    state: "locked",
    desktop: "/aiow/story-v415/desktop/03-private-boundary.png",
    mobile: "/aiow/story-v415/mobile/03-private-boundary.png",
    nativeLock: true,
    theme: "dark",
  },
  {
    id: "local-hardware",
    kicker: "04 / Local hardware",
    title: "Local when it matters.",
    body: "Private jobs can land on hardware you actually own.",
    proof: "The hardware lock turns. Work drops into the local lane.",
    state: "hardware",
    desktop: "/aiow/story-v415/desktop/04-local-hardware-dock.png",
    mobile: "/aiow/story-v415/mobile/04-local-hardware-dock.png",
    nativeLock: true,
    theme: "light",
  },
  {
    id: "model-router",
    kicker: "05 / Model router",
    title: "Each task meets the right model.",
    body: "Risk, context and capability decide the lane before work moves.",
    proof: "The router lock turns. One model lane activates.",
    state: "routing",
    desktop: "/aiow/story-v415/desktop/05-model-router.png",
    mobile: "/aiow/story-v415/mobile/05-model-router.png",
    nativeLock: true,
    theme: "dark",
  },
  {
    id: "business-agents",
    kicker: "06 / Business agents",
    title: "Agents know their roles.",
    body: "Research, build, QA and ops receive owned work, context and limits.",
    proof: "The role lock clicks. Work lanes assign to the right agent.",
    state: "dispatch",
    desktop: "/aiow/story-v415/desktop/06-business-agents.png",
    mobile: "/aiow/story-v415/mobile/06-business-agents.png",
    nativeLock: true,
    theme: "light",
  },
  {
    id: "personal-home-ai",
    kicker: "07 / Personal AI",
    title: "Private stays private.",
    body: "Personal memory can run beside work without becoming work.",
    proof: "The personal lock opens. Private memory stays in its layer.",
    state: "home",
    desktop: "/aiow/story-v415/desktop/07-personal-home-ai.png",
    mobile: "/aiow/story-v415/mobile/07-personal-home-ai.png",
    theme: "light",
  },
  {
    id: "channel-hub",
    kicker: "08 / Channel hub",
    title: "One answer, many doors.",
    body: "Telegram, web, mail and API stay connected to one decision.",
    proof: "The channel lock turns. Interfaces sync without leaking context.",
    state: "channels",
    desktop: "/aiow/story-v415/desktop/08-channel-hub.png",
    mobile: "/aiow/story-v415/mobile/08-channel-hub.png",
    theme: "dark",
  },
  {
    id: "human-approval",
    kicker: "09 / Human approval",
    title: "Autonomy needs a gate.",
    body: "Sensitive actions wait for approval before they move.",
    proof: "The approval lock holds. Action only moves after the gate opens.",
    state: "approval",
    desktop: "/aiow/story-v415/desktop/09-human-approval.png",
    mobile: "/aiow/story-v415/mobile/09-human-approval.png",
    theme: "dark",
  },
  {
    id: "managed-ops",
    kicker: "10 / Managed ops",
    title: "Ops stays awake.",
    body: "Health, failures, leases and alerts resolve into one surface.",
    proof: "The ops lock opens. Health signals pulse through the layer.",
    state: "heartbeat",
    desktop: "/aiow/story-v415/desktop/10-managed-ops.png",
    mobile: "/aiow/story-v415/mobile/10-managed-ops.png",
    theme: "dark",
  },
  {
    id: "proof-studio",
    kicker: "11 / Proof studio",
    title: "Every action leaves proof.",
    body: "Routes, logs, screenshots and decisions stay attached to the job.",
    proof: "The proof lock turns. Receipts attach before handoff.",
    state: "proof",
    desktop: "/aiow/story-v415/desktop/11-proof-studio.png",
    mobile: "/aiow/story-v415/mobile/11-proof-studio.png",
    theme: "light",
  },
  {
    id: "final-installation",
    kicker: "12 / Installed layer",
    title: "The operating layer stays yours.",
    body: "Models can change. Ownership, routing and proof stay installed.",
    proof: "The final lock seats. The operating layer comes online.",
    state: "installed",
    desktop: "/aiow/story-v415/desktop/12-final-installation.png",
    mobile: "/aiow/story-v415/mobile/12-final-installation.png",
    nativeLock: true,
    theme: "light",
  },
];

const posterCards = [
  ["Runs local", "When privacy, latency or ownership matters."],
  ["Routes frontier", "When judgement deserves the best lane."],
  ["Queues before chaos", "Every task gets state, owner and receipts."],
  ["Agents with memory", "Context survives the chat window."],
  ["Human gate", "Approval where autonomy touches risk."],
  ["Proof by default", "Screenshots, logs and outcomes attached."],
];

export default function OryzoCloneExperience() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState<"en" | "nl">("en");

  const activeScene = scenes[active] ?? scenes[0];

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const markers = Array.from(document.querySelectorAll<HTMLElement>("[data-aiow-scene]"));
      const center = window.innerHeight * 0.52;
      let next = 0;
      let best = Infinity;
      markers.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height * 0.5 - center);
        if (distance < best) {
          best = distance;
          next = index;
        }
      });
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setProgress(window.scrollY / max);
      setActive(next);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-aiow-scene]"));
    panels.forEach((panel, index) => {
      const videos = Array.from(panel.querySelectorAll<HTMLVideoElement>("video.story-motion"));
      videos.forEach((video) => {
        if (index === active) {
          const play = video.play();
          if (play && typeof play.catch === "function") play.catch(() => undefined);
        } else {
          video.pause();
        }
      });
    });
  }, [active]);

  const labels = useMemo(
    () =>
      lang === "nl"
        ? {
            nav: ["Verhaal", "Mechaniek", "Bewijs", "Contact"],
            eyebrow: "AIOW Operating Layer",
            heroTitle: "Geen AI-tool. Een werkend systeem.",
            heroBody:
              "Een productfilm voor AIOW: één digitale AI Key vindt per probleemlaag het juiste slot en ontgrendelt de oplossing.",
            play: "Bekijk de AI Key werken",
            route: "Routeer een request",
            built: "Custom art gemaakt met GPT Image 2 · motion proof met Kling AI",
            mechanism: "De AI Key is geen decoratie. Elke lock bewijst een oplossing.",
            inputLabel: "Smart route encryption",
            input: "Bouw een private AI workflow voor mijn bedrijf",
            encode: "Route request",
            productTitle: "Kies je operating layer",
            footer: "Als een coaster een hele wereld kan krijgen, krijgt AIOW een systeem dat klopt.",
          }
        : {
            nav: ["Story", "Mechanism", "Proof", "Contact"],
            eyebrow: "AIOW Operating Layer",
            heroTitle: "Not an AI tool. An operating system for work.",
            heroBody:
              "A product film for AIOW: one digital AI Key finds the right lock in every problem layer and unlocks the solution.",
            play: "Watch the AI Key unlock",
            route: "Route a request",
            built: "Custom art made with GPT Image 2 · motion proof by Kling AI",
            mechanism: "The AI Key is not decoration. Every lock proves a solution.",
            inputLabel: "Smart route encryption",
            input: "Build a private AI workflow for my company",
            encode: "Route request",
            productTitle: "Choose your operating layer",
            footer: "If a coaster can get a whole world, AIOW gets a system that earns it.",
          },
    [lang]
  );

  return (
    <main className={`aiow-film aiow-film--${activeScene.theme}`} style={{ ["--scene-progress" as string]: progress }}>
      <header className="aiow-header" aria-label="AIOW navigation">
        <a className="aiow-mark" href="#top" aria-label="AIOW home">
          <span className="aiow-mark__sigil">A</span>
          <span>AIOW</span>
        </a>
        <nav>
          {labels.nav.map((item) => (
            <a key={item} href={item === labels.nav[0] ? "#story" : item === labels.nav[1] ? "#mechanism" : item === labels.nav[2] ? "#proof" : "#contact"}>
              {item}
            </a>
          ))}
        </nav>
        <button type="button" className="aiow-lang" onClick={() => setLang(lang === "en" ? "nl" : "en")}>
          {lang === "en" ? "NL" : "EN"}
        </button>
      </header>

      <section id="top" className="aiow-hero" data-testid="aiow-oryzo-hero">
        <div className="aiow-hero__media" aria-hidden="true">
          <div className="aiow-hero__fallback" />
          <div className="aiow-hero__vignette" />
        </div>
        <div className="aiow-hero__topline">
          <span>Made for operators. Built for ownership.</span>
        </div>
        <div className="aiow-hero__copy">
          <p className="aiow-eyebrow">{labels.eyebrow}</p>
          <h1 aria-label={labels.heroTitle}>
            {lang === "en" ? (
              <>
                <span>Not an AI tool.</span>
                <span>An operating</span>
                <span>system for work.</span>
              </>
            ) : (
              <>
                <span>Geen AI-tool.</span>
                <span>Een operating</span>
                <span>system voor werk.</span>
              </>
            )}
          </h1>
          <p>{labels.heroBody}</p>
          <div className="aiow-actions">
            <a href="#story" className="aiow-btn aiow-btn--primary">{labels.play}</a>
            <a href="#route-demo" className="aiow-btn aiow-btn--ghost">{labels.route}</a>
          </div>
        </div>
        
        <div className="ai-key ai-key--hero" data-state="hero" aria-hidden="true">
          <span className="ai-key__head"><span>AIOW</span></span>
          <span className="ai-key__shaft" />
          <span className="ai-key__tooth ai-key__tooth--a" />
          <span className="ai-key__tooth ai-key__tooth--b" />
        </div>
      </section>

      <section id="story" className="story-stage" aria-label="AIOW scrollytelling story">
        {scenes.map((scene, index) => (
          <article key={scene.id} className="story-panel" data-aiow-scene={scene.id} data-scene-state={scene.state} data-has-motion={scene.motionDesktop ? "true" : "false"}>
            <picture className="story-plate" data-native-lock={scene.nativeLock ? "true" : "false"} data-scene-id={scene.id}>
              <source media="(max-width: 720px)" srcSet={scene.mobile} />
              <img src={scene.desktop} alt={`${scene.kicker} — generated AIOW clean plate`} />
            </picture>
            {scene.motionDesktop && (
              <video className="story-motion" src={scene.motionDesktop} poster={scene.desktop} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
            )}
            <div className="story-scrim" />
            <div className="story-copy" data-theme={scene.theme}>
              <span>{scene.kicker}</span>
              <h2>{scene.title}</h2>
              <p>{scene.body}</p>
            </div>
            <div className="story-proof" data-theme={scene.theme}>
              <span>VISIBLE PROOF</span>
              <strong>{scene.proof}</strong>
            </div>
            {!scene.nativeLock && (
              <>
                <div className={`solution-lock solution-lock--${scene.state}`} aria-hidden="true">
                  <span className="solution-lock__halo" />
                  <span className="solution-lock__ring" />
                  <span className="solution-lock__slot" />
                  <span className="solution-lock__notch" />
                  <span className="solution-lock__label">FIT / UNLOCK</span>
                  <span className="solution-lock__pulse solution-lock__pulse--a" />
                  <span className="solution-lock__pulse solution-lock__pulse--b" />
                  <span className="solution-lock__pulse solution-lock__pulse--c" />
                  <span className="solution-lock__pulse solution-lock__pulse--d" />
                </div>
                <div className={`ai-key ai-key--stage ai-key--${scene.state}`} aria-hidden="true">
                  <span className="ai-key__glow" />
                  <span className="ai-key__head"><span>AIOW</span></span>
                  <span className="ai-key__shaft" />
                  <span className="ai-key__tooth ai-key__tooth--a" />
                  <span className="ai-key__tooth ai-key__tooth--b" />
                  <span className="ai-key__spark ai-key__spark--a" />
                  <span className="ai-key__spark ai-key__spark--b" />
                </div>
              </>
            )}
            <div className={`layer-reaction layer-reaction--${scene.state}`} aria-hidden="true">
              <span className="layer-reaction__slot" />
              <span className="layer-reaction__core" />
              <span className="layer-reaction__ray layer-reaction__ray--a" />
              <span className="layer-reaction__ray layer-reaction__ray--b" />
              <span className="layer-reaction__ray layer-reaction__ray--c" />
              <span className="layer-reaction__node layer-reaction__node--a" />
              <span className="layer-reaction__node layer-reaction__node--b" />
              <span className="layer-reaction__node layer-reaction__node--c" />
            </div>
            <div className="story-count" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}
            </div>
          </article>
        ))}
      </section>

      <section id="mechanism" className="mechanism-section">
        <p className="aiow-eyebrow">AIOW scene grammar</p>
        <h2>{labels.mechanism}</h2>
        <div className="mechanism-grid">
          {scenes.slice(1, 7).map((scene, index) => (
            <article key={scene.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{scene.state}</h3>
              <p>{scene.proof}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="route-demo" className="route-demo">
        <div className="route-demo__copy">
          <span>{labels.inputLabel}</span>
          <h2>Input becomes route, route becomes work.</h2>
        </div>
        <div className="route-console">
          <label htmlFor="route-input">Request</label>
          <textarea id="route-input" defaultValue={labels.input} />
          <button type="button">{labels.encode}</button>
          <div className="route-output" aria-label="Route result">
            <span>Classify</span>
            <span>Local context</span>
            <span>Model lane</span>
            <span>Human gate</span>
            <span>Receipt</span>
          </div>
        </div>
      </section>

      <section id="proof" className="poster-wall">
        <div className="poster-wall__track">
          {posterCards.map(([title, body], index) => (
            <article key={title} style={{ ["--i" as string]: index }}>
              <span>AIOW / {String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <div className="poster-key" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="product-stack">
        <p className="aiow-eyebrow">Product stack</p>
        <h2>{labels.productTitle}</h2>
        <div className="stack-table">
          {[
            ["Core", "One AI key for intake, routing and proof.", "QUEUE: YES", "LOCAL: WHEN NEEDED", "APPROVAL: OPTIONAL"],
            ["Studio", "Build, deploy and improve real product surfaces.", "QUEUE: MULTI-AGENT", "LOCAL + FRONTIER", "QA: REQUIRED"],
            ["Operating System", "Managed private/company AI across channels.", "HEALTH: ALWAYS", "ROUTING: POLICY", "PROOF: DEFAULT"],
          ].map((col) => (
            <article key={col[0]}>
              <span>New</span>
              <h3>{col[0]}</h3>
              <p>{col[1]}</p>
              {col.slice(2).map((row) => <strong key={row}>{row}</strong>)}
            </article>
          ))}
        </div>
      </section>

      <footer id="contact" className="aiow-footer">
        <picture>
          <img src="/aiow/story-v415/final/final-center-master.png" alt="AIOW final operating layer room generated with GPT Image 2" />
        </picture>
        <div>
          <p className="aiow-eyebrow">Open operating layer</p>
          <h2>{labels.footer}</h2>
          <a href="mailto:hello@aiow.nl" className="aiow-btn aiow-btn--primary">Start the installation</a>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --aiow-cream: #ffedd7;
          --aiow-ink: #100904;
          --aiow-brown: #382416;
          --aiow-blue: #7c93b8;
          --aiow-gold: #d8b36a;
          --aiow-line: rgba(255, 237, 215, 0.22);
          --aiow-dark: #100904;
          --aiow-muted: #b9aa97;
          --aiow-grid: 3.125vw;
        }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: var(--aiow-dark); color: var(--aiow-cream); cursor: auto !important; overflow-x: clip; }
        .aiow-film { background: var(--aiow-dark); min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .aiow-header { position: fixed; z-index: 80; inset: 20px var(--aiow-grid) auto; display: flex; align-items: center; justify-content: space-between; mix-blend-mode: difference; color: white; pointer-events: none; }
        .aiow-header a, .aiow-header button { pointer-events: auto; }
        .aiow-mark { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; font-weight: 800; letter-spacing: -.04em; }
        .aiow-mark__sigil { width: 34px; height: 34px; border: 1px solid currentColor; border-radius: 50%; display: grid; place-items: center; font-size: 14px; }
        .aiow-header nav { display: flex; gap: 24px; font-size: 12px; text-transform: uppercase; letter-spacing: .16em; }
        .aiow-header nav a { color: inherit; text-decoration: none; opacity: .9; font-size: 12px; }
        .aiow-lang { color: inherit; background: rgba(255,255,255,.08); border: 1px solid currentColor; border-radius: 999px; padding: 9px 12px; font-weight: 800; }
        .aiow-hero { min-height: 100vh; position: relative; display: grid; align-items: end; padding: 92px var(--aiow-grid) var(--aiow-grid); overflow: hidden; isolation: isolate; }
        .aiow-hero__media { position: absolute; inset: 0; z-index: -2; }
        .aiow-hero__media video { width: 100%; height: 100%; object-fit: cover; filter: saturate(.9) contrast(1.05) brightness(.72); transform: scale(1.02); }
        .aiow-hero__fallback { position: absolute; inset: 0; background: url('/aiow/story-v415/final/final-center-master.png') center / cover no-repeat; filter: saturate(.9) contrast(1.05) brightness(.72); transform: scale(1.02); }
        .aiow-hero__vignette, .story-scrim { position: absolute; inset: 0; background: radial-gradient(circle at 58% 42%, transparent 0 22%, rgba(16,9,4,.2) 42%, rgba(16,9,4,.88) 100%), linear-gradient(90deg, rgba(16,9,4,.85), rgba(16,9,4,.12) 55%, rgba(16,9,4,.65)); }
        .aiow-hero__topline { position: absolute; top: 86px; left: var(--aiow-grid); right: var(--aiow-grid); display: flex; justify-content: space-between; gap: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: .16em; color: rgba(255,237,215,.78); }
        .aiow-hero__copy { max-width: min(780px, 92vw); z-index: 4; }
        .aiow-eyebrow { margin: 0 0 18px; font-size: 12px; text-transform: uppercase; letter-spacing: .18em; color: var(--aiow-gold); font-weight: 800; }
        .aiow-hero h1 { margin: 0; max-width: 1120px; font-size: clamp(60px, 8.7vw, 150px); line-height: .84; letter-spacing: -.085em; text-transform: uppercase; }
        .aiow-hero h1 span { display: block; }
        .aiow-hero__copy > p:not(.aiow-eyebrow) { max-width: 640px; font-size: clamp(17px, 1.25vw, 23px); line-height: 1.35; color: rgba(255,237,215,.84); }
        .story-stage { position: relative; background: #090604; }
        .story-panel { min-height: 100svh; position: relative; overflow: hidden; isolation: isolate; display: grid; align-items: center; }
        .story-panel:before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle at 58% 55%, rgba(216,179,106,.18), transparent 0 19%, transparent 38%, rgba(7,4,2,.78) 88%), linear-gradient(90deg, rgba(7,4,2,.88), rgba(7,4,2,.2) 48%, rgba(7,4,2,.66)); mix-blend-mode: multiply; }
        .story-panel:after { content: ""; position: absolute; z-index: 2; left: 47vw; top: 24vh; width: 30vw; height: 44vh; pointer-events: none; background: radial-gradient(ellipse at center, rgba(255,237,215,.11), rgba(216,179,106,.075) 24%, rgba(124,147,184,.045) 42%, transparent 72%); filter: blur(12px); opacity: .46; }
        .story-plate { position: absolute; inset: 0; z-index: -3; }
        .story-plate img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(1.08) contrast(1.11) brightness(.82); transform: scale(1.012); }
        .story-plate[data-native-lock="true"] img { filter: saturate(1.02) contrast(1.06) brightness(.76); }
        .story-motion { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(1.03) contrast(1.08) brightness(.74); transform: scale(1.012); }
        .story-panel[data-has-motion="true"] .story-plate img { opacity: 0; }
        .story-panel[data-has-motion="true"] .layer-reaction { opacity: 0; }
        .story-panel[data-has-motion="true"] .layer-reaction__slot { opacity: 0; }
        .story-scrim { z-index: -1; background: radial-gradient(circle at 58% 54%, rgba(255,237,215,.06) 0 18%, rgba(16,9,4,.12) 42%, rgba(16,9,4,.82) 100%), linear-gradient(90deg, rgba(16,9,4,.82), rgba(16,9,4,.18) 54%, rgba(16,9,4,.72)); }
        .story-copy { position: relative; z-index: 8; width: min(520px, 40vw); margin-left: var(--aiow-grid); color: var(--aiow-cream); }
        .story-copy[data-theme="light"] { color: #fff4df; text-shadow: 0 2px 22px rgba(0,0,0,.72); }
        .story-copy span, .story-proof span { display: block; margin-bottom: 14px; color: var(--aiow-gold); font-size: 13px; text-transform: uppercase; letter-spacing: .18em; font-weight: 950; text-shadow: 0 0 18px rgba(0,0,0,.62); }
        .story-copy h2 { margin: 0; max-width: 680px; font-size: clamp(56px, 7.1vw, 124px); line-height: .86; letter-spacing: -.078em; text-transform: uppercase; text-wrap: balance; }
        .story-copy p { max-width: 500px; margin: 22px 0 0; color: rgba(255,237,215,.96); font-size: clamp(19px, 1.24vw, 22px); line-height: 1.4; text-wrap: pretty; text-shadow: 0 2px 24px rgba(0,0,0,.88); }
        .story-proof { position: absolute; z-index: 8; right: var(--aiow-grid); bottom: var(--aiow-grid); width: min(420px, 30vw); padding: 18px 20px 18px 22px; color: var(--aiow-cream); border-left: 1px solid rgba(216,179,106,.92); background: linear-gradient(90deg, rgba(8,5,3,.84), rgba(8,5,3,.52), rgba(8,5,3,.22)); backdrop-filter: blur(8px); text-shadow: 0 2px 26px rgba(0,0,0,.92); }
        .story-proof strong { display: block; font-size: clamp(17px, 1.24vw, 22px); line-height: 1.28; letter-spacing: -.02em; color: rgba(255,248,232,1); font-weight: 780; }
        .story-count { position: absolute; z-index: 8; right: var(--aiow-grid); top: 90px; color: rgba(255,237,215,.78); font-size: 12px; letter-spacing: .16em; font-weight: 900; }
        .aiow-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
        .aiow-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 24px; border-radius: 999px; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: .12em; font-weight: 900; border: 1px solid rgba(255,237,215,.34); transition: transform .28s ease, background .28s ease; }
        .aiow-btn:hover { transform: translateY(-2px); }
        .aiow-btn--primary { background: var(--aiow-cream); color: var(--aiow-ink); border-color: var(--aiow-cream); }
        .aiow-btn--ghost { color: var(--aiow-cream); background: rgba(255,237,215,.06); }
        .aiow-hero-card { position: absolute; right: var(--aiow-grid); bottom: var(--aiow-grid); width: min(330px, 32vw); border: 1px dashed rgba(255,237,215,.35); padding: 22px; color: var(--aiow-cream); backdrop-filter: blur(10px); background: rgba(16,9,4,.28); }
        .aiow-hero-card h2 { margin: 0 0 36px; font-size: 24px; line-height: 1; text-transform: uppercase; }
        .aiow-hero-card p { margin: 0; color: rgba(255,237,215,.68); font-size: 13px; line-height: 1.45; }
        .ai-key { --key-size: clamp(150px, 19vw, 310px); position: absolute; width: var(--key-size); height: calc(var(--key-size) * .4); pointer-events: none; transform-style: preserve-3d; filter: drop-shadow(0 34px 58px rgba(0,0,0,.55)) drop-shadow(0 0 34px rgba(216,179,106,.22)); }
        .ai-key__glow { position: absolute; inset: -58% -22%; border-radius: 999px; background: radial-gradient(ellipse at 58% 50%, rgba(255,237,215,.26), rgba(216,179,106,.18) 28%, transparent 68%); filter: blur(14px); opacity: .9; animation: key-glow 2.8s ease-in-out infinite; }
        .ai-key__head { position: absolute; left: 0; top: 50%; width: calc(var(--key-size) * .36); aspect-ratio: 1; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle at 30% 24%, #fff9e6 0 10%, #ffe2a0 24%, #d8b36a 46%, #69471f 73%, #140b05 100%); box-shadow: inset 0 2px 0 rgba(255,255,255,.72), inset 0 -18px 32px rgba(16,9,4,.5), 0 0 58px rgba(216,179,106,.48), 0 12px 50px rgba(0,0,0,.45); display: grid; place-items: center; }
        .ai-key__head:before { content: ""; position: absolute; inset: 22%; border-radius: 50%; border: 2px solid rgba(16,9,4,.54); background: radial-gradient(circle, rgba(16,9,4,.56), rgba(16,9,4,.08)); box-shadow: inset 0 0 18px rgba(255,237,215,.14); }
        .ai-key__head span { position: relative; z-index: 2; color: #160d06; font-weight: 950; font-size: calc(var(--key-size) * .05); letter-spacing: -.08em; transform: translateY(1px); text-shadow: 0 1px 0 rgba(255,237,215,.42); }
        .ai-key__shaft { position: absolute; left: calc(var(--key-size) * .29); right: calc(var(--key-size) * .08); top: 50%; height: calc(var(--key-size) * .118); transform: translateY(-50%); border-radius: 999px; background: linear-gradient(180deg, #fff6da 0%, #e8c472 36%, #bd8d3f 58%, #3a2613 100%); box-shadow: inset 0 2px 0 rgba(255,255,255,.68), inset 0 -8px 14px rgba(16,9,4,.46), 0 0 30px rgba(216,179,106,.32); }
        .ai-key__shaft:after { content: ""; position: absolute; left: 7%; right: 5%; top: 37%; height: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.76), transparent); }
        .ai-key__tooth { position: absolute; right: calc(var(--key-size) * .04); background: linear-gradient(180deg, #ffe4a0, #d8b36a 40%, #4a3015); box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 0 18px rgba(216,179,106,.22); }
        .ai-key__tooth--a { top: 50%; width: calc(var(--key-size) * .14); height: calc(var(--key-size) * .13); transform: translateY(-3%) skewX(-12deg); border-radius: 0 5px 6px 0; }
        .ai-key__tooth--b { top: 63%; right: calc(var(--key-size) * .16); width: calc(var(--key-size) * .115); height: calc(var(--key-size) * .105); transform: skewX(-12deg); border-radius: 0 4px 6px 0; }
        .ai-key__spark { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #fff3d4; box-shadow: 0 0 18px #d8b36a; opacity: .8; animation: key-spark 1.9s ease-in-out infinite; }
        .ai-key__spark--a { right: 2%; top: 28%; }
        .ai-key__spark--b { right: 15%; bottom: 18%; animation-delay: .4s; }
        .ai-key--hero { --key-size: clamp(240px, 31vw, 520px); right: 3.5vw; top: 24vh; transform: rotateX(58deg) rotateZ(-18deg); opacity: .99; }
        .ai-key--hero:before { content: ""; position: absolute; left: 9%; right: 6%; bottom: -48%; height: 58%; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(255,237,215,.18), rgba(216,179,106,.14) 35%, rgba(0,0,0,.22) 58%, transparent 78%); transform: rotateZ(6deg); filter: blur(12px); z-index: -2; }
        .ai-key--hero:after { content: "AI KEY / UNLOCK ROUTE"; position: absolute; right: 4%; top: -22%; color: rgba(255,237,215,.78); font-size: 10px; letter-spacing: .2em; font-weight: 950; text-shadow: 0 0 22px rgba(216,179,106,.72); white-space: nowrap; }
        .solution-lock { --lock-size: clamp(185px, 19vw, 340px); position: absolute; z-index: 3; width: var(--lock-size); aspect-ratio: 1; border-radius: 50%; left: 58vw; top: 53vh; transform: translate(-50%, -50%) rotateX(62deg) rotateZ(-9deg); pointer-events: none; opacity: 1; filter: drop-shadow(0 22px 55px rgba(0,0,0,.44)); }
        .solution-lock__halo { position: absolute; inset: -22%; border-radius: 50%; background: radial-gradient(circle, rgba(255,237,215,.18), rgba(216,179,106,.12) 30%, rgba(124,147,184,.08) 52%, transparent 74%); filter: blur(8px); animation: lock-breathe 2.8s ease-in-out infinite; }
        .solution-lock__ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,237,215,.46); background: radial-gradient(circle at 46% 44%, rgba(255,237,215,.13), rgba(216,179,106,.12) 37%, rgba(16,9,4,.48) 72%, rgba(16,9,4,.7)); box-shadow: 0 0 70px rgba(216,179,106,.28), inset 0 0 40px rgba(255,237,215,.12), inset 0 -26px 42px rgba(0,0,0,.34); }
        .solution-lock__slot { position: absolute; left: 47%; top: 50%; width: 51%; height: 16%; transform: translate(-4%, -50%); border-radius: 999px 10px 10px 999px; background: linear-gradient(90deg, rgba(4,2,1,.98), rgba(16,9,4,.76)); border: 2px solid rgba(255,225,157,.68); box-shadow: inset 0 0 22px rgba(0,0,0,.82), 0 0 44px rgba(216,179,106,.36); }
        .solution-lock__notch { position: absolute; left: 72%; top: 60%; width: 20%; height: 10%; border-radius: 2px 8px 8px 2px; background: rgba(5,3,1,.92); border: 1px solid rgba(255,225,157,.5); box-shadow: inset 0 0 16px rgba(0,0,0,.8); }
        .solution-lock__label { display: none; }
        .solution-lock__pulse { position: absolute; left: 50%; top: 50%; height: 3px; width: min(38vw, 560px); transform-origin: left center; background: linear-gradient(90deg, rgba(255,237,215,1), rgba(216,179,106,.94), rgba(124,147,184,.7), rgba(124,147,184,0)); animation: unlock-pulse 2.35s ease-out infinite; filter: drop-shadow(0 0 14px rgba(216,179,106,.68)); }
        .solution-lock__pulse--a { transform: rotate(0deg); animation-delay: .18s; }
        .solution-lock__pulse--b { transform: rotate(34deg); animation-delay: .34s; }
        .solution-lock__pulse--c { transform: rotate(-36deg); animation-delay: .5s; }
        .solution-lock__pulse--d { transform: rotate(82deg); animation-delay: .7s; width: min(22vw, 320px); }
        .layer-reaction { --reaction-x: 58vw; --reaction-y: 55vh; position: absolute; z-index: 5; left: var(--reaction-x); top: var(--reaction-y); width: min(42vw, 620px); height: min(42vw, 620px); transform: translate(-50%, -50%); pointer-events: none; mix-blend-mode: screen; opacity: .58; }
        .layer-reaction__slot { position: absolute; left: 50%; top: 50%; width: 28%; height: 8%; transform: translate(-50%, -50%) rotate(-8deg); border-radius: 999px; background: linear-gradient(90deg, rgba(5,3,1,.96), rgba(22,12,5,.72)); border: 1px solid rgba(255,225,157,.58); box-shadow: inset 0 0 20px rgba(0,0,0,.86), 0 0 24px rgba(216,179,106,.34); opacity: .34; animation: layer-slot-after-turn 3.1s ease-out infinite; }
        .story-plate[data-native-lock="true"] ~ .layer-reaction .layer-reaction__slot { opacity: .62; border-color: rgba(255,225,157,.72); box-shadow: inset 0 0 22px rgba(0,0,0,.9), 0 0 34px rgba(216,179,106,.48); }
        .layer-reaction__core { position: absolute; left: 50%; top: 50%; width: 22%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,246,219,.74), rgba(216,179,106,.42) 26%, rgba(124,147,184,.2) 48%, transparent 70%); filter: blur(6px); animation: layer-core-after-turn 3.1s ease-out infinite; animation-delay: .72s; }
        .layer-reaction__ray { position: absolute; left: 50%; top: 50%; height: 2px; width: 62%; transform-origin: left center; background: linear-gradient(90deg, rgba(255,246,219,.98), rgba(216,179,106,.7), rgba(124,147,184,.38), transparent); filter: drop-shadow(0 0 12px rgba(216,179,106,.52)); animation: layer-ray-after-turn 3.1s cubic-bezier(.16,1,.3,1) infinite; animation-delay: .86s; }
        .layer-reaction__ray--a { transform: rotate(-8deg); }
        .layer-reaction__ray--b { transform: rotate(28deg); width: 48%; animation-delay: 1.02s; }
        .layer-reaction__ray--c { transform: rotate(-42deg); width: 42%; animation-delay: 1.16s; }
        .layer-reaction__node { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: #fff1c8; box-shadow: 0 0 18px rgba(216,179,106,.92), 0 0 42px rgba(124,147,184,.34); animation: layer-node-after-turn 3.1s ease-in-out infinite; animation-delay: 1.1s; }
        .layer-reaction__node--a { left: 78%; top: 46%; }
        .layer-reaction__node--b { left: 72%; top: 66%; animation-delay: 1.28s; }
        .layer-reaction__node--c { left: 66%; top: 27%; animation-delay: 1.44s; }
        .layer-reaction--dormant { --reaction-x: 59vw; --reaction-y: 58vh; }
        .layer-reaction--listening { --reaction-x: 53vw; --reaction-y: 61vh; }
        .layer-reaction--locked { --reaction-x: 63vw; --reaction-y: 52vh; }
        .layer-reaction--hardware { --reaction-x: 56vw; --reaction-y: 62vh; }
        .layer-reaction--routing { --reaction-x: 52vw; --reaction-y: 54vh; }
        .layer-reaction--dispatch { --reaction-x: 57vw; --reaction-y: 59vh; }
        .layer-reaction--home { --reaction-x: 56vw; --reaction-y: 61vh; }
        .layer-reaction--channels { --reaction-x: 60vw; --reaction-y: 55vh; }
        .layer-reaction--approval { --reaction-x: 53vw; --reaction-y: 62vh; }
        .layer-reaction--approval .layer-reaction__slot { width: 36%; height: 10%; opacity: .82; transform: translate(-50%, -50%) rotate(0deg); }
        .layer-reaction--dispatch .layer-reaction__slot,
        .layer-reaction--home .layer-reaction__slot { opacity: .74; }
        .layer-reaction--dispatch .layer-reaction__ray,
        .layer-reaction--home .layer-reaction__ray,
        .layer-reaction--approval .layer-reaction__ray { filter: drop-shadow(0 0 18px rgba(216,179,106,.68)); }
        .layer-reaction--heartbeat { --reaction-x: 61vw; --reaction-y: 62vh; }
        .layer-reaction--proof { --reaction-x: 56vw; --reaction-y: 58vh; }
        .layer-reaction--installed { --reaction-x: 51vw; --reaction-y: 60vh; }
        .story-plate[data-scene-id="channel-hub"] ~ .story-scrim,
        .story-plate[data-scene-id="human-approval"] ~ .story-scrim,
        .story-plate[data-scene-id="proof-studio"] ~ .story-scrim,
        .story-plate[data-scene-id="final-installation"] ~ .story-scrim { background: radial-gradient(circle at 62% 54%, rgba(255,237,215,.035) 0 14%, rgba(16,9,4,.18) 34%, rgba(16,9,4,.86) 100%), linear-gradient(90deg, rgba(16,9,4,.9), rgba(16,9,4,.24) 54%, rgba(16,9,4,.78)); }
        .layer-reaction--channels,
        .layer-reaction--approval,
        .layer-reaction--proof,
        .layer-reaction--installed { opacity: .42; }
        @keyframes unlock-pulse { 0% { opacity: 0; scale: .1 1; filter: blur(5px); } 24% { opacity: .98; } 100% { opacity: 0; scale: 1.16 1; filter: blur(0); } }
        @keyframes layer-core-after-turn { 0%, 18% { opacity: 0; scale: .18; } 34% { opacity: .95; scale: .92; } 100% { opacity: .08; scale: 2.15; } }
        @keyframes layer-slot-after-turn { 0%, 16% { filter: brightness(.72); } 28% { filter: brightness(1.42); } 100% { filter: brightness(.9); } }
        @keyframes layer-ray-after-turn { 0%, 20% { opacity: 0; scale: .08 1; } 42% { opacity: .92; scale: .74 1; } 100% { opacity: 0; scale: 1.16 1; } }
        @keyframes layer-node-after-turn { 0%, 28% { opacity: 0; scale: .42; } 48% { opacity: 1; scale: 1; } 100% { opacity: .12; scale: .72; } }
        @keyframes key-seat { 0% { translate: -10vw 0; opacity: .42; } 32%, 72% { translate: 0 0; opacity: 1; } 100% { translate: 0 0; opacity: .92; } }
        @keyframes lock-breathe { 0%, 100% { opacity: .62; scale: .94; } 48% { opacity: 1; scale: 1.04; } }
        @keyframes key-glow { 0%, 100% { opacity: .5; } 48% { opacity: .98; } }
        @keyframes key-spark { 0%, 100% { transform: scale(.55); opacity: .25; } 42% { transform: scale(1.1); opacity: 1; } }
        .ai-key--stage { z-index: 4; --key-size: clamp(190px, 19.5vw, 330px); left: calc(58vw - (var(--key-size) * .38)); top: 53vh; transform: translate(-50%, -50%) rotateX(62deg) rotateZ(-9deg); animation: key-seat 2.8s cubic-bezier(.16,1,.3,1) infinite; }
        .solution-lock--dormant, .ai-key--dormant { left: 59vw; top: 58vh; transform: translate(-50%, -50%) rotateX(62deg) rotateZ(-13deg) scale(1.02); }
        .ai-key--dormant { left: calc(59vw - (var(--key-size) * .38)); }
        .solution-lock--listening, .ai-key--listening { left: 53vw; top: 61vh; transform: translate(-50%, -50%) rotateX(62deg) rotateZ(6deg) scale(1.06); }
        .ai-key--listening { left: calc(53vw - (var(--key-size) * .38)); }
        .solution-lock--locked, .ai-key--locked { left: 63vw; top: 52vh; transform: translate(-50%, -50%) rotateX(64deg) rotateZ(0deg) scale(.98); }
        .ai-key--locked { left: calc(63vw - (var(--key-size) * .38)); }
        .solution-lock--hardware, .ai-key--hardware { left: 56vw; top: 62vh; transform: translate(-50%, -50%) rotateX(70deg) rotateZ(11deg) scale(.96); }
        .ai-key--hardware { left: calc(56vw - (var(--key-size) * .38)); }
        .solution-lock--routing, .ai-key--routing { left: 52vw; top: 54vh; transform: translate(-50%, -50%) rotateX(58deg) rotateZ(-24deg) scale(1.02); }
        .ai-key--routing { left: calc(52vw - (var(--key-size) * .38)); }
        .solution-lock--dispatch, .ai-key--dispatch { left: 57vw; top: 59vh; transform: translate(-50%, -50%) rotateX(63deg) rotateZ(-4deg) scale(.98); }
        .ai-key--dispatch { left: calc(57vw - (var(--key-size) * .38)); }
        .solution-lock--home, .ai-key--home { left: 56vw; top: 61vh; transform: translate(-50%, -50%) rotateX(66deg) rotateZ(12deg) scale(.94); }
        .ai-key--home { left: calc(56vw - (var(--key-size) * .38)); }
        .solution-lock--channels, .ai-key--channels { left: 60vw; top: 55vh; transform: translate(-50%, -50%) rotateX(58deg) rotateZ(-10deg) scale(.98); }
        .ai-key--channels { left: calc(60vw - (var(--key-size) * .38)); }
        .solution-lock--approval, .ai-key--approval { left: 53vw; top: 62vh; transform: translate(-50%, -50%) rotateX(68deg) rotateZ(0deg) scale(.94); }
        .ai-key--approval { left: calc(53vw - (var(--key-size) * .38)); }
        .solution-lock--heartbeat, .ai-key--heartbeat { left: 61vw; top: 62vh; transform: translate(-50%, -50%) rotateX(68deg) rotateZ(16deg) scale(.94); }
        .ai-key--heartbeat { left: calc(61vw - (var(--key-size) * .38)); }
        .solution-lock--proof, .ai-key--proof { left: 56vw; top: 58vh; transform: translate(-50%, -50%) rotateX(63deg) rotateZ(-8deg) scale(.92); }
        .ai-key--proof { left: calc(56vw - (var(--key-size) * .38)); }
        .solution-lock--installed, .ai-key--installed { left: 51vw; top: 60vh; transform: translate(-50%, -50%) rotateX(66deg) rotateZ(0deg) scale(.92); }
        .ai-key--installed { left: calc(51vw - (var(--key-size) * .38)); }
        .mechanism-section, .route-demo, .product-stack { padding: clamp(96px, 12vw, 180px) var(--aiow-grid); background: var(--aiow-dark); color: var(--aiow-cream); }
        .mechanism-section h2, .route-demo h2, .product-stack h2 { max-width: 1100px; margin: 0 0 42px; font-size: clamp(48px, 8vw, 132px); line-height: .88; letter-spacing: -.075em; text-transform: uppercase; }
        .mechanism-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; border: 1px solid var(--aiow-line); }
        .mechanism-grid article { min-height: 260px; padding: 22px; background: rgba(255,237,215,.045); display: flex; flex-direction: column; justify-content: space-between; }
        .mechanism-grid span { color: var(--aiow-gold); font-size: 12px; letter-spacing: .14em; }
        .mechanism-grid h3 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: -.05em; }
        .mechanism-grid p { color: rgba(255,237,215,.66); margin: 0; }
        .route-demo { min-height: 100vh; display: grid; grid-template-columns: .9fr 1.1fr; gap: 5vw; align-items: center; position: relative; overflow: hidden; background: radial-gradient(circle at 72% 48%, rgba(216,179,106,.18), transparent 0 20%, transparent 39%), linear-gradient(135deg, #120904 0%, #211006 48%, #080503 100%); color: var(--aiow-cream); border-block: 1px solid rgba(255,237,215,.12); }
        .route-demo:before { content: ""; position: absolute; right: 8vw; top: 50%; width: min(42vw, 620px); aspect-ratio: 1; transform: translateY(-50%) rotateX(62deg) rotateZ(-10deg); border-radius: 50%; background: radial-gradient(circle, rgba(255,237,215,.14), rgba(216,179,106,.13) 28%, rgba(16,9,4,.28) 54%, transparent 72%); border: 1px solid rgba(255,237,215,.16); box-shadow: inset 0 0 80px rgba(216,179,106,.12), 0 0 120px rgba(0,0,0,.32); pointer-events: none; }
        .route-demo:after { content: ""; position: absolute; right: 17vw; top: 50%; width: min(30vw, 460px); height: 2px; transform: rotate(-9deg); background: linear-gradient(90deg, rgba(255,237,215,.92), rgba(216,179,106,.75), rgba(124,147,184,0)); box-shadow: 0 0 24px rgba(216,179,106,.4); pointer-events: none; }
        .route-demo__copy, .route-console { position: relative; z-index: 2; }
        .route-demo__copy span { font-size: 12px; text-transform: uppercase; letter-spacing: .16em; color: var(--aiow-gold); font-weight: 900; }
        .route-console { border: 1px solid rgba(255,237,215,.22); padding: clamp(22px, 3vw, 42px); background: linear-gradient(135deg, rgba(255,237,215,.08), rgba(16,9,4,.58)); box-shadow: 0 34px 100px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(18px); }
        .route-console label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .16em; margin-bottom: 12px; font-weight: 900; color: rgba(255,237,215,.86); }
        .route-console textarea { width: 100%; min-height: 132px; resize: vertical; border: 1px solid rgba(255,237,215,.2); background: rgba(7,4,2,.62); color: var(--aiow-cream); padding: 18px; font: inherit; font-size: 22px; outline: none; box-shadow: inset 0 0 36px rgba(0,0,0,.24); }
        .route-console button { margin: 16px 0 26px; min-height: 46px; border: 0; border-radius: 999px; background: var(--aiow-gold); color: var(--aiow-ink); padding: 0 20px; font-weight: 950; text-transform: uppercase; letter-spacing: .12em; box-shadow: 0 16px 40px rgba(216,179,106,.22); }
        .route-output { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .route-output span { min-height: 88px; display: grid; place-items: center; text-align: center; padding: 10px; border: 1px solid rgba(255,237,215,.16); background: rgba(255,237,215,.06); font-size: 12px; text-transform: uppercase; letter-spacing: .1em; font-weight: 950; color: rgba(255,237,215,.84); }
        .poster-wall { position: relative; overflow: hidden; background: #080604; color: var(--aiow-cream); padding: 10vh 0; }
        .poster-wall__track { display: flex; gap: 24px; width: max-content; padding: 0 var(--aiow-grid); animation: poster-drift 28s linear infinite; }
        @keyframes poster-drift { from { transform: translateX(0); } to { transform: translateX(calc(-50% + 50vw)); } }
        .poster-wall article { width: min(66vw, 560px); aspect-ratio: 4 / 5; padding: 28px; background: linear-gradient(135deg, rgba(255,237,215,.12), rgba(124,147,184,.12)), url('/aiow/story-v415/desktop/11-proof-studio.png') center/cover; border: 1px solid rgba(255,237,215,.14); display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
        .poster-wall article:before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(16,9,4,.25), rgba(16,9,4,.82)); }
        .poster-wall article > * { position: relative; z-index: 1; }
        .poster-wall span { font-size: 12px; text-transform: uppercase; letter-spacing: .16em; color: var(--aiow-gold); font-weight: 900; }
        .poster-wall h3 { margin: auto 0 10px; font-size: clamp(42px, 6vw, 88px); line-height: .85; letter-spacing: -.07em; text-transform: uppercase; }
        .poster-wall p { margin: 0; max-width: 300px; color: rgba(255,237,215,.74); }
        .poster-key { position: absolute; right: 28px; top: 28px; width: 108px; height: 42px; transform: rotate(-16deg); border-radius: 999px; background: linear-gradient(90deg, #d8b36a, #3b2714); box-shadow: 0 15px 35px rgba(0,0,0,.3); }
        .poster-key:before { content: ""; position: absolute; left: 0; top: 50%; width: 42px; height: 42px; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle, transparent 0 30%, #d8b36a 32% 100%); }
        .poster-key:after { content: ""; position: absolute; right: -8px; bottom: -8px; width: 28px; height: 18px; background: #d8b36a; clip-path: polygon(0 0, 100% 0, 72% 100%, 28% 100%); }
        .product-stack { background: var(--aiow-dark); }
        .stack-table { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--aiow-line); }
        .stack-table article { padding: clamp(24px, 3vw, 44px); border-right: 1px solid var(--aiow-line); min-height: 500px; display: flex; flex-direction: column; gap: 22px; }
        .stack-table article:last-child { border-right: 0; }
        .stack-table span { color: var(--aiow-gold); font-size: 12px; text-transform: uppercase; letter-spacing: .18em; }
        .stack-table h3 { margin: 0; font-size: clamp(36px, 4vw, 70px); text-transform: uppercase; letter-spacing: -.07em; line-height: .86; }
        .stack-table p { color: rgba(255,237,215,.72); font-size: 18px; line-height: 1.38; }
        .stack-table strong { border-top: 1px solid var(--aiow-line); padding-top: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,237,215,.78); }
        .aiow-footer { min-height: 100vh; display: grid; grid-template-columns: 1.1fr .9fr; align-items: center; gap: 5vw; padding: var(--aiow-grid); background: var(--aiow-cream); color: var(--aiow-ink); }
        .aiow-footer picture { aspect-ratio: 16/10; overflow: hidden; border: 1px solid rgba(16,9,4,.14); box-shadow: 0 34px 100px rgba(56,36,22,.18); }
        .aiow-footer img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .aiow-footer h2 { margin: 0 0 30px; font-size: clamp(42px, 6vw, 104px); line-height: .88; letter-spacing: -.075em; text-transform: uppercase; }
        @media (max-width: 900px) {
          .aiow-header { inset: 14px 16px auto; }
          .aiow-header nav { display: none; }
          .aiow-hero { padding: 86px 20px 20px; align-items: end; overflow-x: hidden; }
          .aiow-hero__media video { object-position: 66% center; filter: saturate(.95) contrast(1.08) brightness(.58); }
          .aiow-hero__topline { top: 72px; left: 18px; right: 18px; display: block; }
          .aiow-hero__topline span:last-child { display: none; }
          .aiow-hero__copy { max-width: calc(100vw - 40px); overflow: visible; }
          .aiow-hero h1 { max-width: 310px; font-size: clamp(34px, 9.2vw, 44px); line-height: .94; letter-spacing: -.042em; }
          .aiow-hero h1 span { max-width: 100%; }
          .aiow-hero__copy > p:not(.aiow-eyebrow) { max-width: 32ch; font-size: 15px; line-height: 1.35; }
          .aiow-actions { width: 100%; flex-direction: column; align-items: flex-start; gap: 10px; margin-top: 20px; overflow: visible; }
          .aiow-btn { box-sizing: border-box; max-width: calc(100vw - 40px); min-height: 42px; padding: 0 16px; font-size: 11px; letter-spacing: .08em; white-space: normal; }
          .aiow-btn--primary { background: #fff1d4; color: #160d06; border-color: #fff1d4; box-shadow: 0 12px 34px rgba(0,0,0,.34), 0 0 22px rgba(216,179,106,.16); }
          .aiow-btn--ghost { color: #fff1d4; background: rgba(16,9,4,.62); border-color: rgba(255,241,212,.46); box-shadow: inset 0 0 0 1px rgba(255,241,212,.08); }
          .aiow-hero-card { display: none; }
          .ai-key--hero { display: none; }
          .story-panel { min-height: 100dvh; height: 100dvh; }
          .story-copy { left: 18px; right: 18px; top: 12vh; width: auto; max-width: 88vw; }
          .story-copy h2 { font-size: clamp(40px, 12.4vw, 66px); }
          .story-copy p { font-size: 14px; max-width: 300px; margin-top: 14px; color: rgba(255,237,215,.88); }
          .story-proof { left: 18px; right: auto; bottom: max(26px, env(safe-area-inset-bottom)); width: min(300px, calc(100vw - 36px)); padding: 8px 10px 8px 12px; background: linear-gradient(90deg, rgba(8,5,3,.56), rgba(8,5,3,.18), transparent); backdrop-filter: blur(2px); }
          .story-proof span { display: block; margin-bottom: 12px; font-size: 10px; line-height: 1.1; }
          .story-proof strong { display: block; font-size: 14px; line-height: 1.24; color: rgba(255,243,221,.94); }
          .story-count { right: 18px; top: 18px; }
          .story-plate[data-scene-id="mess-before-ai"] img { object-position: 50% 58%; }
          .story-plate[data-scene-id="intake-hub"] img { object-position: 68% 50%; }
          .story-plate[data-scene-id="private-boundary"] img { object-position: 63% 50%; }
          .story-plate[data-scene-id="local-hardware"] img { object-position: 42% 50%; }
          .story-plate[data-scene-id="model-router"] img { object-position: 60% 52%; }
          .story-plate[data-scene-id="business-agents"] img { object-position: 45% 50%; }
          .story-plate[data-scene-id="personal-home-ai"] img { object-position: 50% 56%; }
          .story-plate[data-scene-id="channel-hub"] img { object-position: 50% 68%; }
          .story-plate[data-scene-id="human-approval"] img { object-position: 45% 55%; }
          .story-plate[data-scene-id="managed-ops"] img { object-position: 55% 78%; }
          .story-plate[data-scene-id="proof-studio"] img { object-position: 55% 72%; }
          .story-plate[data-scene-id="final-installation"] img { object-position: center center; }
          .story-motion { display: none; }
          .story-panel[data-has-motion="true"] .story-plate img { opacity: 1; }
          .story-panel[data-has-motion="true"] .layer-reaction { opacity: .52; }
          .story-plate[data-native-lock="true"] img { filter: saturate(1.04) contrast(1.08) brightness(.68); }
          .solution-lock { --lock-size: 104px; left: 56vw !important; top: 60vh !important; transform: translate(-50%, -50%) rotateX(66deg) rotateZ(-7deg) scale(.82) !important; }
          .ai-key--stage { --key-size: 132px; left: calc(56vw - 52px) !important; top: 60vh !important; transform: translate(-50%, -50%) rotateX(66deg) rotateZ(-7deg) scale(.82) !important; }
          .layer-reaction { --reaction-x: 56vw; --reaction-y: 60vh; width: 330px; height: 330px; opacity: .62; }
          .story-plate[data-native-lock="true"] ~ .layer-reaction { opacity: .52; }
          .layer-reaction__slot { opacity: .48; width: 32%; height: 9%; }
          .story-plate[data-native-lock="true"] ~ .layer-reaction .layer-reaction__slot { opacity: .78; }
          .mechanism-section, .route-demo, .product-stack { padding: 90px 18px; }
          .mechanism-grid { grid-template-columns: 1fr; }
          .mechanism-grid article { min-height: 170px; }
          .route-demo, .aiow-footer { grid-template-columns: 1fr; }
          .route-output { grid-template-columns: 1fr; }
          .poster-wall__track { animation: none; overflow-x: auto; width: auto; scroll-snap-type: x mandatory; }
          .poster-wall article { min-width: 82vw; scroll-snap-align: center; }
          .stack-table { grid-template-columns: 1fr; }
          .stack-table article { border-right: 0; border-bottom: 1px solid var(--aiow-line); min-height: auto; }
          .aiow-footer { min-height: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition-duration: 0.01ms !important; }
          .story-panel { min-height: 100svh; }
        }
      `}</style>
    </main>
  );
}
