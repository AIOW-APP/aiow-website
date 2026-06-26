import Link from "next/link";
import styles from "./AiowAppShell.module.css";

const nav = ["Home", "Workspace", "Chat", "Team", "Account"];

const canvas = [
  ["Project", "Nog niet gekozen"],
  ["Founder", "Venture Memory pending"],
  ["Probleem", "Wordt opgebouwd via intake"],
  ["Doelgroep", "Nog te valideren"],
  ["AI kansen", "Research AI wacht op context"],
  ["Samenwerking", "Project, share, equity of mix"],
];

const agents = [
  ["Strategy AI", "Route en partnership fit", "Live"],
  ["Research AI", "Markt en concurrentie", "Wacht op intake"],
  ["Finance AI", "Dealmodel en marge", "Stand-by"],
  ["Development AI", "Build scope", "Stand-by"],
  ["Marketing AI", "Growth kansen", "Stand-by"],
  ["Legal AI", "Risico en afspraken", "Stand-by"],
];

const activity = [
  "Sprinky intake gestart",
  "Venture Memory aangemaakt na consent",
  "Deal Card klaar voor Team AIOW review",
];

export default function AiowAppPage() {
  return (
    <main className={styles.page} data-aiow-app-shell="venture-os-v1">
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
            <p>Private workspace</p>
            <h1>Je AI Venture OS.</h1>
          </div>
          <Link href="/intake">Open Sprinky Chat</Link>
        </header>

        <section className={styles.grid}>
          <article className={styles.heroCard}>
            <span>Volgende stap</span>
            <h2>Maak je intake compleet</h2>
            <p>Sprinky bouwt je dossier op met founder, probleem, markt, AI-kansen, risico en samenwerkingsadvies.</p>
            <div className={styles.progress}><i style={{ width: "34%" }} /></div>
          </article>

          <article className={styles.scoreCard}>
            <span>Laatst bijgewerkte Venture Score</span>
            <strong>34%</strong>
            <p>Te vroeg voor partnerbesluit. Meer markt, tractie en founder-context nodig.</p>
          </article>

          <article className={styles.canvasCard}>
            <div className={styles.sectionTitle}><span>Live Venture Canvas</span><b>Memory</b></div>
            <div className={styles.canvasList}>
              {canvas.map(([label, value]) => (
                <div key={label}>
                  <strong>{label}</strong>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.teamCard}>
            <div className={styles.sectionTitle}><span>AI Team</span><b>6 agents</b></div>
            {agents.map(([name, task, state]) => (
              <div className={styles.agent} key={name}>
                <i />
                <div>
                  <strong>{name}</strong>
                  <p>{task}</p>
                </div>
                <span>{state}</span>
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
