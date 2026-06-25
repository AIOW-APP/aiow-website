import { listVentureAccounts, type VentureAccount } from "@/lib/aiow-venture-accounts";
import styles from "../Portal.module.css";

export default async function AdminPage() {
  const accounts = await listVentureAccounts();
  const stats = summarize(accounts);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Team Richard Admin</p>
            <h1>Client Command Center.</h1>
            <p className={styles.lead}>Zie welke Venture Memories binnenkomen, welke Deal Cards review nodig hebben, welke voorstellen klaarstaan en welke projecten build-ready zijn.</p>
          </div>
          <span className={styles.statusPill}><i /> {stats.buildReady} build ready</span>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h1>Pipeline</h1>
            <div className={styles.timeline}>
              <Step n={String(stats.intake)} title="Intake" text="Nieuwe klantcontext en Venture Memory." />
              <Step n={String(stats.review)} title="Voorstelreview" text="Klant heeft info gedeeld en wacht op voorstel." />
              <Step n={String(stats.proposal)} title="Voorstel klaar" text="Voorstel staat klaar voor akkoord." />
              <Step n={String(stats.buildReady)} title="Build ready" text="Ondertekend en klaar voor AIOW bouwfase." />
            </div>
            <p className={styles.notice}>Voor volledige productie moet deze admin op Supabase draaien. De huidige preview-store toont accounts wanneer de runtime dezelfde store kan lezen.</p>
          </section>

          <aside className={styles.panel}>
            <h2>Beslissingen nodig</h2>
            <div className={styles.kv}>
              <Row label="Accounts" value={String(accounts.length)} />
              <Row label="Voorstelreview" value={String(stats.review)} />
              <Row label="Voorstel klaar" value={String(stats.proposal)} />
              <Row label="Build ready" value={String(stats.buildReady)} />
            </div>
          </aside>
        </div>

        <section className={styles.card}>
          <h1>Deal Cards</h1>
          {accounts.length ? (
            <div className={styles.timeline}>
              {accounts.map((account) => <AccountCard key={account.accountId} account={account} />)}
            </div>
          ) : (
            <p className={styles.notice}>Nog geen accounts zichtbaar in deze runtime. Zodra Supabase persistentie aan staat, wordt dit de centrale queue voor Team Richard.</p>
          )}
        </section>
      </section>
    </main>
  );
}

function AccountCard({ account }: { account: VentureAccount }) {
  return (
    <article className={styles.panel}>
      <p className={styles.eyebrow}>{account.status}</p>
      <h2>{account.projectName}</h2>
      <div className={styles.kv}>
        <Row label="Klant" value={`${account.name} · ${account.company || account.email}`} />
        <Row label="Probleem" value={account.dealCard?.problem || "Nog aanscherpen"} />
        <Row label="AI-kans" value={account.dealCard?.opportunity || "Nog aanscherpen"} />
        <Row label="Route" value={account.dealCard?.likelyRoute || "Private intake"} />
        <Row label="Mist nog" value={account.dealCard?.missing?.join(", ") || "Geen checklist"} />
        <Row label="Voorstel" value={account.proposal?.signedAt ? `Getekend door ${account.proposal.signatureName}` : account.proposal?.title || "Nog niet klaar"} />
      </div>
    </article>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className={styles.step}><b>{n}</b><p><strong>{title}</strong>{text}</p></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><p>{value}</p></div>;
}

function summarize(accounts: VentureAccount[]) {
  return {
    intake: accounts.filter((account) => account.status === "intake").length,
    review: accounts.filter((account) => account.status === "proposal_review").length,
    proposal: accounts.filter((account) => account.status === "proposal_ready").length,
    buildReady: accounts.filter((account) => account.status === "build_ready").length,
  };
}
