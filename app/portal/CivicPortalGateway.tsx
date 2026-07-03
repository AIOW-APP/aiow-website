"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../civicPortal.module.css";
import { supabaseBrowser } from "@/lib/supabase-browser";

/*
 * E-mail-first portal-login (zoals Richard het wil, en zoals Cargo al werkt):
 * 1. Klant vult alleen e-mail in → Supabase magic link in de mail.
 * 2. Klant klikt de link → komt hier terug met een geverifieerde sessie.
 * 3. Wij halen de dossiers bij dat e-mailadres op en openen ze zonder toegangscode.
 * Kwijt = gewoon opnieuw je e-mail invullen; volledig self-service, geen WhatsApp nodig.
 * De toegangscode blijft alleen als fallback voor wie de mail niet in kan zien.
 */

type AccountOption = { accountId: string; companyName: string; projectName: string; status: string; loginToken: string };
type Phase =
  | { name: "email" }
  | { name: "sent"; email: string }
  | { name: "listing" }
  | { name: "choose"; accounts: AccountOption[] }
  | { name: "none"; email: string }
  | { name: "error"; message: string };

export function CivicPortalGateway() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>({ name: "email" });
  const [busy, setBusy] = useState(false);
  const [showCodeFallback, setShowCodeFallback] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  /* Terugkomst via magic link: sessie aanwezig → dossiers ophalen en direct door. */
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    async function resolveSession() {
      const { data } = await supabase!.auth.getSession();
      const session = data.session;
      if (!session || cancelled) return;
      setPhase({ name: "listing" });
      try {
        const response = await fetch("/api/portal/my-accounts", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw new Error(payload.error || "Dossiers ophalen mislukte.");
        const accounts: AccountOption[] = payload.accounts || [];
        if (cancelled) return;
        if (accounts.length === 0) setPhase({ name: "none", email: payload.email });
        else if (accounts.length === 1) router.push(`/portal/customer/${encodeURIComponent(accounts[0].accountId)}?lt=${encodeURIComponent(accounts[0].loginToken)}`);
        else setPhase({ name: "choose", accounts });
      } catch (error) {
        if (!cancelled) setPhase({ name: "error", message: error instanceof Error ? error.message : "Er ging iets mis." });
      }
    }
    void resolveSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      if (session) void resolveSession();
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const redirectOrigin = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".local")
        ? "https://aiow.ai"
        : window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${redirectOrigin}/portal` },
      });
      if (error) throw error;
      setPhase({ name: "sent", email: email.trim() });
    } catch (error) {
      setPhase({ name: "error", message: error instanceof Error ? error.message : "Versturen mislukte." });
    } finally {
      setBusy(false);
    }
  }

  if (phase.name === "listing") {
    return <section className={styles.card}><p className={styles.meta}>e-mail geverifieerd · dossiers ophalen…</p></section>;
  }

  if (phase.name === "choose") {
    return (
      <section className={styles.card}>
        <p className={styles.meta}>e-mail geverifieerd · kies je dossier</p>
        <div className={styles.ctaRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
          {phase.accounts.map((account) => (
            <a key={account.accountId} className={styles.ctaLine}
              href={`/portal/customer/${encodeURIComponent(account.accountId)}?lt=${encodeURIComponent(account.loginToken)}`}>
              <strong>{account.companyName}</strong> · {account.projectName}
            </a>
          ))}
        </div>
      </section>
    );
  }

  if (phase.name === "none") {
    return (
      <section className={styles.card}>
        <p className={styles.lead}>Er staat nog geen dossier op {phase.email}.</p>
        <div className={styles.ctaRow}><a className={styles.ctaSolid} href="/intake">Start je venture intake</a></div>
      </section>
    );
  }

  if (phase.name === "sent") {
    return (
      <section className={styles.card} aria-live="polite">
        <span className={styles.stamp}>CHECK JE MAIL</span>
        <p className={styles.lead}>We hebben een inlogcode en -link gestuurd naar <strong>{phase.email}</strong>. Klik op de link, of vul hier de code uit de mail in.</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!supabase || busy) return;
            setBusy(true);
            setOtpError("");
            try {
              const { error } = await supabase.auth.verifyOtp({ email: phase.email, token: otpCode.trim(), type: "email" });
              if (error) throw error;
              /* sessie is nu actief; onAuthStateChange haalt de dossiers op en stuurt door */
            } catch (error) {
              setOtpError(error instanceof Error ? error.message : "Code klopt niet of is verlopen.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className={styles.field}>Inlogcode
            <input
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
            />
          </label>
          {otpError && <p className={styles.error}>{otpError}</p>}
          <button className={styles.submit} type="submit" disabled={busy || otpCode.trim().length < 6}>
            {busy ? "Controleren..." : "Log in met code"}
          </button>
        </form>
        <p className={styles.note}>Geen mail? Kijk in je spam, of <button type="button" onClick={() => setPhase({ name: "email" })} style={{ background: "none", border: 0, color: "#B05C34", fontWeight: 700, cursor: "pointer", padding: 0 }}>probeer opnieuw</button>.</p>
      </section>
    );
  }

  return (
    <>
      <form className={styles.card} onSubmit={sendLink}>
        {phase.name === "error" && <p className={styles.error}>{phase.message}</p>}
        {!supabase && (
          <p className={styles.error}>E-mail-login wordt geactiveerd. Gebruik zolang de toegangscode-route hieronder.</p>
        )}
        <label className={styles.field}>E-mailadres
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="jij@bedrijf.nl" required />
        </label>
        <button className={styles.submit} type="submit" disabled={busy || !supabase || !/\S+@\S+\.\S+/.test(email.trim())}>
          {busy ? "Versturen..." : "Stuur mij een inloglink"}
        </button>
        <p className={styles.note}>Je krijgt een e-mail met een link; daarmee log je zonder wachtwoord in. Code kwijt of nieuw toestel? Gewoon opnieuw je e-mail invullen.</p>
      </form>

      <p className={styles.note} style={{ marginTop: -40, marginBottom: 40 }}>
        <button type="button" onClick={() => setShowCodeFallback(!showCodeFallback)} style={{ background: "none", border: 0, color: "rgba(33,28,22,.55)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>
          Ik heb een accountnummer en toegangscode
        </button>
      </p>

      {showCodeFallback && (
        <form className={styles.card} style={{ marginTop: -30 }} onSubmit={(event) => { event.preventDefault(); if (accountId.trim()) router.push(`/portal/customer/${encodeURIComponent(accountId.trim())}`); }}>
          <label className={styles.field}>Accountnummer
            <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="aiow_acct_..." />
          </label>
          <button className={styles.submit} type="submit" disabled={!accountId.trim()}>Open met toegangscode</button>
          <p className={styles.note}>Op de volgende pagina vul je je toegangscode in.</p>
        </form>
      )}
    </>
  );
}
