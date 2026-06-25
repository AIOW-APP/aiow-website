"use client";

import { FormEvent, useState } from "react";
import styles from "./Portal.module.css";

export function PortalLogin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [portalUrl, setPortalUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    setPortalUrl("");
    const response = await fetch("/api/venture-account/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { portalUrl?: string; error?: string; message?: string };
    if (!response.ok || !data.portalUrl) {
      setState("error");
      setMessage(data.error || "Geen project gevonden voor dit e-mailadres.");
      return;
    }
    setState("done");
    setPortalUrl(data.portalUrl);
    setMessage(data.message || "Login-link aangemaakt.");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input className={styles.input} type="email" placeholder="Zakelijke e-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
      <button className={styles.button} type="submit" disabled={state === "loading" || !email.trim()}>
        {state === "loading" ? "Zoekt project..." : "Login naar mijn project"}
      </button>
      {message ? <p className={state === "error" ? styles.error : styles.success}>{message}</p> : null}
      {portalUrl ? <a className={styles.secondaryButton} href={portalUrl}>Open project workspace</a> : null}
      <p className={styles.muted}>Preview: we tonen de link direct. Productie: deze link gaat als Magic Link naar je e-mail.</p>
    </form>
  );
}
