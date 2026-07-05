"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./portalGlass.module.css";
import { supabaseBrowser } from "@/lib/supabase-browser";

/*
 * E-mail-first portal-login (zoals Richard het wil, en zoals Cargo al werkt):
 * 1. Klant vult alleen e-mail in → Supabase magic link in de mail.
 * 2. Klant klikt de link → komt hier terug met een geverifieerde sessie.
 * 3. Wij halen de dossiers bij dat e-mailadres op en openen ze zonder toegangscode.
 * Kwijt = gewoon opnieuw je e-mail invullen; volledig self-service.
 * De toegangscode blijft alleen als fallback voor wie de mail niet in kan zien.
 *
 * Vormgeving: clean-glass merk-moment (DESIGN-DNA.md v2.1).
 * - Wachten als verhaal (les A17): één fase-chip op een vaste plek benoemt de
 *   échte fases (link verstuurd → wacht op klik of code → controleren →
 *   dossiers ophalen) en eindigt als uitnodiging of resultaat.
 * - Eén gevulde CTA per fase, morfend label; al het secundaire is tekstlink
 *   (les A16). Rood alleen voor validatie (les A14).
 */

type AccountOption = { accountId: string; companyName: string; projectName: string; status: string; loginToken: string };
type Phase =
  | { name: "email" }
  | { name: "sent"; email: string }
  | { name: "listing" }
  | { name: "choose"; accounts: AccountOption[] }
  | { name: "none"; email: string }
  | { name: "error"; message: string };

function FaseChip({ nr, busy, children }: { nr: string; busy?: boolean; children: React.ReactNode }) {
  return (
    <p className={styles.faseChip} role="status" aria-live="polite">
      <span className={styles.faseDot} data-busy={busy ? "" : undefined} aria-hidden="true" />
      <b>{nr}</b>
      {children}
    </p>
  );
}

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

  /* Fase: dossiers ophalen (na geverifieerde sessie) */
  if (phase.name === "listing") {
    return (
      <section className={`${styles.card} cg-glass`}>
        <FaseChip nr="03" busy>e-mail geverifieerd · dossiers ophalen</FaseChip>
        <h2 className={styles.cardTitle}>Even geduld.</h2>
        <p className={styles.cardBody}>We leggen je dossier klaar.</p>
      </section>
    );
  }

  /* Resultaat: meerdere dossiers, kies er een */
  if (phase.name === "choose") {
    return (
      <section className={`${styles.card} cg-glass`}>
        <FaseChip nr="04">geverifieerd · kies je dossier</FaseChip>
        <h2 className={styles.cardTitle}>Kies je dossier.</h2>
        <div className={styles.dossierList}>
          {phase.accounts.map((account) => (
            <a key={account.accountId}
              href={`/portal/customer/${encodeURIComponent(account.accountId)}?lt=${encodeURIComponent(account.loginToken)}`}>
              <strong>{account.companyName}</strong>
              <span>{account.projectName}</span>
            </a>
          ))}
        </div>
      </section>
    );
  }

  /* Resultaat: geverifieerd, maar nog geen dossier op dit adres */
  if (phase.name === "none") {
    return (
      <section className={`${styles.card} cg-glass`}>
        <FaseChip nr="04">geverifieerd · geen dossier</FaseChip>
        <h2 className={styles.cardTitle}>Nog geen dossier op {phase.email}.</h2>
        <p className={styles.cardBody}>
          Start met je idee. De weging is eerlijk, we zeggen vaker nee dan ja.
        </p>
        <a className={styles.primary} href="/nl/venture-score-aanvragen">Vraag je venture-score aan</a>
      </section>
    );
  }

  /* Fase: link en code onderweg, wachten als verhaal (les A17) */
  if (phase.name === "sent") {
    return (
      <section className={`${styles.card} cg-glass`}>
        <FaseChip nr="02" busy={!busy}>
          {busy ? "code wordt gecontroleerd" : "link onderweg · check je mail"}
        </FaseChip>
        <h2 className={styles.cardTitle}>Check je mail.</h2>
        <p className={styles.cardBody}>
          De link en de code zijn onderweg naar <strong>{phase.email}</strong>.
          Klik op de link, of vul de code hier in.
        </p>
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
              setOtpError(error instanceof Error ? error.message : "Code klopt niet of is verlopen. Vraag zo nodig een nieuwe aan.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className={styles.field}>
            Inlogcode
            <input
              className={styles.codeInput}
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
            />
          </label>
          {otpError && <p className={styles.error}>{otpError}</p>}
          <p className={styles.actionRow}>
            <button className={styles.primary} type="submit" disabled={busy || otpCode.trim().length < 6}>
              {busy ? "Wordt gecontroleerd..." : "Log in met code"}
            </button>
          </p>
        </form>
        <p className={styles.note}>
          Geen mail? Kijk in je spam, of{" "}
          <button type="button" className={styles.quiet} onClick={() => setPhase({ name: "email" })}>
            vraag een nieuwe link aan
          </button>.
        </p>
      </section>
    );
  }

  /* Rust-fase: e-mail invullen, één CTA */
  return (
    <section className={`${styles.card} cg-glass`}>
      {busy && <FaseChip nr="01" busy>link wordt verstuurd</FaseChip>}
      <form onSubmit={sendLink}>
        {phase.name === "error" && <p className={styles.error}>{phase.message}</p>}
        {!supabase && (
          <p className={styles.cardBody}>E-mail-login wordt geactiveerd. Gebruik zolang de toegangscode-route hieronder.</p>
        )}
        <label className={styles.field}>
          E-mailadres
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="jij@bedrijf.nl" required />
        </label>
        <p className={styles.actionRow}>
          <button className={styles.primary} type="submit" disabled={busy || !supabase || !/\S+@\S+\.\S+/.test(email.trim())}>
            {busy ? "Wordt verstuurd..." : "Stuur mijn inloglink"}
          </button>
        </p>
        <p className={styles.note}>Nieuw toestel of link kwijt, gewoon opnieuw je e-mail invullen.</p>
      </form>

      <p className={styles.note}>
        <button type="button" className={styles.quiet} onClick={() => setShowCodeFallback(!showCodeFallback)}>
          Ik heb een accountnummer en toegangscode
        </button>
      </p>

      {showCodeFallback && (
        <form onSubmit={(event) => { event.preventDefault(); if (accountId.trim()) router.push(`/portal/customer/${encodeURIComponent(accountId.trim())}`); }}>
          <label className={styles.field}>
            Accountnummer
            <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="aiow_acct_..." />
          </label>
          <p className={styles.actionRow}>
            <button className={styles.primary} type="submit" disabled={!accountId.trim()}>Open met toegangscode</button>
          </p>
          <p className={styles.note}>Op de volgende pagina vul je je toegangscode in.</p>
        </form>
      )}
    </section>
  );
}
