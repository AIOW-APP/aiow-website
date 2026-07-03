"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../civicPortal.module.css";

/* Civic gateway voor het klantportaal: dossier openen met accountnummer + toegangscode
   (de link/code uit je bevestiging), of een nieuw dossier starten via de intake. */

export function CivicPortalGateway() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [known, setKnown] = useState(false);

  useEffect(() => {
    try {
      const lastId = localStorage.getItem("aiow:lastAccountId") || "";
      const lastCode = localStorage.getItem("aiow:lastAccessCode") || "";
      if (lastId) { setAccountId(lastId); setKnown(true); }
      if (lastCode) setAccessCode(lastCode);
    } catch { /* privé-modus */ }
  }, []);

  function open(event: React.FormEvent) {
    event.preventDefault();
    const id = accountId.trim();
    if (!id) return;
    try {
      if (accessCode.trim()) localStorage.setItem("aiow:lastAccessCode", accessCode.trim());
      localStorage.setItem("aiow:lastAccountId", id);
    } catch { /* privé-modus */ }
    router.push(`/portal/customer/${encodeURIComponent(id)}`);
  }

  return (
    <form className={styles.card} onSubmit={open}>
      {known && <p className={styles.meta}>welkom terug · je laatste dossier staat hieronder klaar</p>}
      <div className={styles.grid2}>
        <label className={styles.field}>Accountnummer
          <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="ACC-XXXXXX" required />
        </label>
        <label className={styles.field}>Toegangscode
          <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="AIOW-XXXXXX-XXXXXX" />
        </label>
      </div>
      <button className={styles.submit} type="submit" disabled={!accountId.trim()}>Open mijn dossier</button>
      <p className={styles.note}>
        Je accountnummer en toegangscode staan in je bevestiging en in de link die je bij je aanmelding kreeg.
        Kwijt? Stuur een bericht via <a href="https://wa.me/31621898039">WhatsApp</a>, dan zetten we hem opnieuw klaar.
      </p>
    </form>
  );
}
