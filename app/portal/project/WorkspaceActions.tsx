"use client";

import { FormEvent, useState } from "react";
import styles from "../Portal.module.css";

type WorkspaceActionsProps = {
  accountId: string;
  accessToken: string;
  initial: {
    website?: string;
    goals?: string;
    budget?: string;
    timeline?: string;
    extraContext?: string;
    status: string;
    proposalReady: boolean;
  };
};

export function WorkspaceActions({ accountId, accessToken, initial }: WorkspaceActionsProps) {
  const [website, setWebsite] = useState(initial.website || "");
  const [goals, setGoals] = useState(initial.goals || "");
  const [budget, setBudget] = useState(initial.budget || "");
  const [timeline, setTimeline] = useState(initial.timeline || "");
  const [extraContext, setExtraContext] = useState(initial.extraContext || "");
  const [signatureName, setSignatureName] = useState("");
  const [status, setStatus] = useState(initial.status);
  const [proposalReady, setProposalReady] = useState(initial.proposalReady);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/venture-account/project", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId, accessToken, website, goals, budget, timeline, extraContext, readyForProposal: true }),
    });
    const data = await response.json() as { message?: string; account?: { status?: string } };
    setBusy(false);
    if (response.ok) {
      setStatus(data.account?.status || "proposal_review");
      setMessage(data.message || "Projectinformatie opgeslagen.");
    } else {
      setMessage("Opslaan lukt niet. Open je workspace opnieuw via je login-link.");
    }
  }

  async function prepareProposal() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/venture-account/proposal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId, accessToken }),
    });
    const data = await response.json() as { account?: { status?: string } };
    setBusy(false);
    if (response.ok) {
      setStatus(data.account?.status || "proposal_ready");
      setProposalReady(true);
      setMessage("Voorstel is klaargezet voor akkoord en ondertekening.");
    } else {
      setMessage("Voorstel klaarzetten lukt niet met deze link.");
    }
  }

  async function signProposal() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/venture-account/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId, accessToken, signatureName }),
    });
    const data = await response.json() as { message?: string; account?: { status?: string } };
    setBusy(false);
    if (response.ok) {
      setStatus(data.account?.status || "build_ready");
      setMessage(data.message || "Voorstel ondertekend.");
    } else {
      setMessage("Ondertekenen lukt nog niet. Controleer je naam of login-link.");
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={save}>
        <input className={styles.input} placeholder="Website of voorbeeldlink" value={website} onChange={(event) => setWebsite(event.target.value)} />
        <textarea className={styles.textarea} placeholder="Wat wil je bereiken? Welke info moet AIOW absoluut weten?" value={goals} onChange={(event) => setGoals(event.target.value)} />
        <input className={styles.input} placeholder="Budgetindicatie of bandbreedte" value={budget} onChange={(event) => setBudget(event.target.value)} />
        <input className={styles.input} placeholder="Gewenste timing" value={timeline} onChange={(event) => setTimeline(event.target.value)} />
        <textarea className={styles.textarea} placeholder="Extra context, concurrenten, systemen, documenten of beslissingen" value={extraContext} onChange={(event) => setExtraContext(event.target.value)} />
        <button className={styles.button} type="submit" disabled={busy}>Info opslaan en voorstel laten voorbereiden</button>
      </form>

      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" onClick={prepareProposal} disabled={busy || status === "intake"}>
          Voorstel klaarzetten
        </button>
      </div>

      {proposalReady || status === "proposal_ready" || status === "build_ready" ? (
        <div className={styles.notice}>
          <strong>Voorstel klaar.</strong> Controleer de scope en teken digitaal als je akkoord bent. Daarna zetten wij het project klaar voor build-start.
          <div className={styles.form}>
            <input className={styles.input} placeholder="Naam voor akkoord" value={signatureName} onChange={(event) => setSignatureName(event.target.value)} />
            <button className={styles.button} type="button" onClick={signProposal} disabled={busy || !signatureName.trim() || status === "build_ready"}>Voorstel ondertekenen</button>
          </div>
        </div>
      ) : null}

      {message ? <p className={message.includes("lukt") ? styles.error : styles.success}>{message}</p> : null}
      <p className={styles.muted}>Huidige status: {status}</p>
    </>
  );
}
