import Link from "next/link";
import { decodeVentureAccountState, getVentureAccount } from "@/lib/aiow-venture-accounts";
import styles from "../../Portal.module.css";
import { WorkspaceActions } from "../WorkspaceActions";

type ProjectPageProps = {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ token?: string; state?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { accountId } = await params;
  const { token = "", state = "" } = await searchParams;
  const storedAccount = await getVentureAccount(accountId, token);
  const stateAccount = state ? decodeVentureAccountState(state) : null;
  const account = storedAccount || (stateAccount?.accountId === accountId ? stateAccount : null);

  if (!account) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.card}>
            <p className={styles.eyebrow}>Project link verlopen</p>
            <h1>Open je project opnieuw.</h1>
            <p className={styles.lead}>Deze link is ongeldig of verlopen. Log opnieuw in met je e-mailadres.</p>
            <div className={styles.actions}><Link className={styles.button} href="/portal">Naar login</Link></div>
          </div>
        </section>
      </main>
    );
  }

  const proposalReady = Boolean(account.proposal);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Private Venture Workspace</p>
            <h1>{account.projectName}</h1>
            <p className={styles.lead}>Welkom {account.name}. AIOW gebruikt je Venture Memory als centrale context. Vul aan wat nodig is. Zodra jij klaar bent, maken wij een voorstel. Na akkoord en ondertekening kan de bouwfase starten.</p>
          </div>
          <span className={styles.statusPill}><i /> {label(account.status)}</span>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h1>Projectinfo aanvullen</h1>
            <WorkspaceActions
              accountId={account.accountId}
              accessToken={token}
              initial={{
                website: account.projectInfo.website,
                goals: account.projectInfo.goals,
                budget: account.projectInfo.budget,
                timeline: account.projectInfo.timeline,
                extraContext: account.projectInfo.extraContext,
                status: account.status,
                proposalReady,
              }}
            />
          </section>

          <aside className={styles.panel}>
            <h2>Deal Card</h2>
            <div className={styles.kv}>
              <Row label="Founder" value={account.dealCard?.founder || account.name} />
              <Row label="Bedrijf" value={account.dealCard?.company || account.company || "Nog onbekend"} />
              <Row label="Probleem" value={account.dealCard?.problem || "Nog verder aanscherpen"} />
              <Row label="AI-kans" value={account.dealCard?.opportunity || "Nog verder aanscherpen"} />
              <Row label="Route" value={account.dealCard?.likelyRoute || "Private intake"} />
              <Row label="Mist nog" value={account.dealCard?.missing?.join(", ") || "AIOW beoordeelt dit na je aanvulling"} />
            </div>

            {account.proposal ? (
              <div className={styles.notice}>
                <strong>{account.proposal.title}</strong>
                <p>{account.proposal.scope}</p>
                <p>{account.proposal.commercialModel}</p>
                {account.proposal.signedAt ? <p>Ondertekend door {account.proposal.signatureName}.</p> : null}
              </div>
            ) : (
              <p className={styles.notice}>Nog geen voorstel. Deel eerst de context die jij belangrijk vindt en zet het project klaar voor voorstelreview.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><p>{value}</p></div>;
}

function label(status: string): string {
  if (status === "proposal_review") return "Voorstelreview";
  if (status === "proposal_ready") return "Voorstel klaar";
  if (status === "proposal_signed") return "Ondertekend";
  if (status === "build_ready") return "Build ready";
  return "Intake";
}
