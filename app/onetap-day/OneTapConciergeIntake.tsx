"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./onetap-day.module.css";

type IntakeDraft = {
  email: string;
  rawTasks: string;
  fixedAppointments: string;
  workWindow: string;
  priorityContext: string;
  planningBaselineMinutes: string;
  timezone: string;
  consentAccepted: boolean;
  aiTransitAccepted: boolean;
  website: string;
};

type SubmitState = "idle" | "submitting" | "submitted" | "error";
type InterestState = "idle" | "submitting" | "submitted" | "error";

type FoundingInterestDraft = {
  email: string;
  intentLevel: string;
  currentPlanningPain: string;
  premiumFeature: string;
  priceReaction: string;
  day2Value: string;
  day7Value: string;
  day30Value: string;
  website: string;
};

const STORAGE_KEY = "onetap-day-concierge-intake-v1";
const INTEREST_STORAGE_KEY = "onetap-day-founding-interest-v1";
const REQUIRED_FIELDS: Array<keyof IntakeDraft> = [
  "email",
  "rawTasks",
  "fixedAppointments",
  "workWindow",
  "priorityContext",
  "planningBaselineMinutes",
  "consentAccepted",
  "aiTransitAccepted",
];

const initialDraft: IntakeDraft = {
  email: "",
  rawTasks: "",
  fixedAppointments: "",
  workWindow: "",
  priorityContext: "",
  planningBaselineMinutes: "",
  timezone: "Europe/Amsterdam",
  consentAccepted: false,
  aiTransitAccepted: false,
  website: "",
};

const initialInterest: FoundingInterestDraft = {
  email: "",
  intentLevel: "early-access-interest",
  currentPlanningPain: "",
  premiumFeature: "Dag opnieuw ordenen als alles schuift",
  priceReaction: "Misschien, als OneTap vaker echt tijd bespaart",
  day2Value: "",
  day7Value: "",
  day30Value: "",
  website: "",
};

function hasContent(value: string | boolean) {
  return typeof value === "boolean" ? value === true : value.trim().length > 0;
}

function safeParseDraft(raw: string | null): IntakeDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<IntakeDraft>;
    return {
      ...initialDraft,
      ...parsed,
      consentAccepted: parsed.consentAccepted === true,
      aiTransitAccepted: parsed.aiTransitAccepted === true,
      website: "",
    };
  } catch {
    return null;
  }
}

function safeParseInterest(raw: string | null): FoundingInterestDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FoundingInterestDraft>;
    return {
      ...initialInterest,
      ...parsed,
      website: "",
    };
  } catch {
    return null;
  }
}

export default function OneTapConciergeIntake() {
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<IntakeDraft>(initialDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [interest, setInterest] = useState<FoundingInterestDraft>(initialInterest);
  const [interestState, setInterestState] = useState<InterestState>("idle");
  const [interestId, setInterestId] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    const stored = safeParseDraft(localStorage.getItem(STORAGE_KEY));
    if (stored) setDraft(stored);
    const storedInterest = safeParseInterest(localStorage.getItem(INTEREST_STORAGE_KEY));
    if (storedInterest) setInterest(storedInterest);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify({ ...interest, updatedAt: new Date().toISOString() }));
  }, [interest, hydrated]);

  const missingFields = useMemo(
    () => REQUIRED_FIELDS.filter((field) => !hasContent(draft[field])),
    [draft],
  );

  const canSubmit = hydrated && missingFields.length === 0 && submitState !== "submitting";
  const canSubmitInterest =
    hydrated &&
    interestState !== "submitting" &&
    hasContent(interest.email) &&
    hasContent(interest.currentPlanningPain) &&
    hasContent(interest.day2Value) &&
    hasContent(interest.day7Value) &&
    hasContent(interest.day30Value);

  const summary = useMemo(() => {
    return [
      "OneTap Day Concierge complete intake",
      `Email: ${draft.email}`,
      `Timezone: ${draft.timezone}`,
      `Planning baseline: ${draft.planningBaselineMinutes} minutes`,
      "",
      "Top raw tasks for today:",
      draft.rawTasks,
      "",
      "Fixed appointments / time constraints:",
      draft.fixedAppointments,
      "",
      "Available work window:",
      draft.workWindow,
      "",
      "Priority / deadline context:",
      draft.priorityContext,
      "",
      "Consent: accepted text-only Phase 1, raw intake max 30 days, remove-from-active-workflow on request.",
      "AI transit: accepted human-reviewed, AI-assisted planning/summarisation boundary.",
      "Betaling: niet gestart; dit is alleen een review-aanvraag.",
    ].join("\n");
  }, [draft]);

  const mailtoHref = `mailto:hello@aiow.ai?subject=${encodeURIComponent("OneTap Day complete intake fallback")}&body=${encodeURIComponent(summary)}`;

  function update<K extends keyof IntakeDraft>(field: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setSubmitState("idle");
    setIntakeId(null);
    setSubmitMessage(null);
  }

  function updateInterest<K extends keyof FoundingInterestDraft>(field: K, value: FoundingInterestDraft[K]) {
    setInterest((current) => ({ ...current, [field]: value }));
    setInterestState("idle");
    setInterestId(null);
    setInterestMessage(null);
  }

  async function handleInterestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitInterest) return;

    setInterestState("submitting");
    setInterestId(null);
    setInterestMessage(null);

    try {
      const response = await fetch("/api/onetap/founding-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...interest, source: "onetap-day-early-access" }),
      });
      const result = (await response.json()) as { ok?: boolean; foundingInterestId?: string; message?: string; error?: string };

      if (!response.ok || !result.ok || !result.foundingInterestId) {
        throw new Error(result.error || "Founding interest submit failed");
      }

      setInterestState("submitted");
      setInterestId(result.foundingInterestId);
      setInterestMessage(result.message || "Interesse opgeslagen. Geen betaling gestart.");
    } catch (error) {
      setInterestState("error");
      setInterestMessage(error instanceof Error ? error.message : "Founding interest submit failed");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitState("submitting");
    setSubmitMessage(null);
    setIntakeId(null);

    try {
      const response = await fetch("/api/onetap/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { ok?: boolean; intakeId?: string; message?: string; error?: string };

      if (!response.ok || !result.ok || !result.intakeId) {
        throw new Error(result.error || "Controlled intake submit failed");
      }

      const timestamp = new Date().toLocaleString("nl-NL", { timeZone: draft.timezone || "Europe/Amsterdam" });
      setSavedAt(timestamp);
      setSubmitted(true);
      setSubmitState("submitted");
      setIntakeId(result.intakeId);
      setSubmitMessage(result.message || "Intake ontvangen. Geen betaling gestart.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Controlled intake submit failed");
    }
  }

  return (
    <section id="intake" className={styles.intakeSection} aria-labelledby="intake-title">
      <div className={styles.intakeIntro}>
        <p className={styles.eyebrow}>Vraag je OneTap-review aan</p>
        <h2 id="intake-title">Stuur je dag. Krijg een gecontroleerde intake-receipt.</h2>
        <p>
          Dit is de bruikbare early-access flow: jij stuurt je rommelige dag, Team Handsome legt de intake controleerbaar vast en reviewt welke dagvolgorde waarde zou leveren. Raw intake max 30 dagen.
          Geen calendar OAuth. Geen voice upload. Geen wachtwoorden, medische details, financiële accountgegevens
          of gevoelige data van derden insturen. Delete-on-request via support@aiow.ai of hello@aiow.ai.
          Deze intake is human-reviewed en mag AI-assisted worden samengevat/gepland binnen de Team Handsome data boundary.
        </p>
      </div>

      <section className={styles.foundingPanel} aria-labelledby="founding-interest-title">
        <div>
          <p className={styles.eyebrow}>Early access</p>
          <h3 id="founding-interest-title">Wil je OneTap vaker gebruiken?</h3>
          <p>
            Laat achter welke terugkerende hulp je zou willen. Dit registreert alleen interesse; er wordt niets verkocht,
            gefactureerd of automatisch gestart.
          </p>
          <ul>
            <li>Geen betaling en geen abonnement.</li>
            <li>Geen prijsbelofte of lifetime claim.</li>
            <li>Alleen echte feedback bepaalt wat we daarna bouwen.</li>
          </ul>
        </div>

        <form className={styles.interestForm} onSubmit={handleInterestSubmit} noValidate>
          <label>
            <span>Email voor updates *</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={interest.email}
              onChange={(event) => updateInterest("email", event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className={styles.honeypot} aria-hidden="true">
            <span>Website</span>
            <input
              tabIndex={-1}
              autoComplete="off"
              value={interest.website}
              onChange={(event) => updateInterest("website", event.target.value)}
              placeholder="Leave empty"
            />
          </label>

          <label>
            <span>Waar zou OneTap op day-2 nog waarde leveren? *</span>
            <textarea
              required
              value={interest.day2Value}
              onChange={(event) => updateInterest("day2Value", event.target.value)}
              rows={2}
              placeholder="Bijv. morgen opnieuw plannen zonder alles opnieuw te sorteren."
            />
          </label>

          <label>
            <span>Waar zou OneTap op day-7 waarde leveren? *</span>
            <textarea
              required
              value={interest.day7Value}
              onChange={(event) => updateInterest("day7Value", event.target.value)}
              rows={2}
              placeholder="Bijv. weekritme, routines, gemiste taken terughalen."
            />
          </label>

          <label>
            <span>Waar zou OneTap op day-30 waarde leveren? *</span>
            <textarea
              required
              value={interest.day30Value}
              onChange={(event) => updateInterest("day30Value", event.target.value)}
              rows={2}
              placeholder="Bijv. geschiedenis, recurring templates, betere prioriteiten."
            />
          </label>

          <label>
            <span>Huidige planning-pijn</span>
            <textarea
              value={interest.currentPlanningPain}
              onChange={(event) => updateInterest("currentPlanningPain", event.target.value)}
              rows={2}
              placeholder="Wat kost je nu elke ochtend tijd/energie?"
            />
          </label>

          <div className={styles.twoCol}>
            <label>
              <span>Welke hulp zou je willen?</span>
              <select value={interest.premiumFeature} onChange={(event) => updateInterest("premiumFeature", event.target.value)}>
                <option>Dag opnieuw ordenen als alles schuift</option>
                <option>Reminders en agenda-hulp</option>
                <option>Terugkerende routines/templates</option>
                <option>Snelle voice capture</option>
                <option>Geschiedenis en zoeken</option>
              </select>
            </label>
            <label>
              <span>Zou je ervoor betalen als het werkt?</span>
              <select value={interest.priceReaction} onChange={(event) => updateInterest("priceReaction", event.target.value)}>
                <option>Misschien, als OneTap vaker echt tijd bespaart</option>
                <option>Eerst day-2 waarde zien</option>
                <option>Eerst weekwaarde zien</option>
                <option>Liever maandabonnement dan losse aankoop</option>
                <option>Ik zou alleen gratis gebruiken</option>
              </select>
            </label>
          </div>

          <button className={styles.submitButton} type="submit" disabled={!canSubmitInterest}>
            {interestState === "submitting" ? "Interesse vastleggen…" : "Bewaar interesse — geen betaling"}
          </button>
          {interestId ? <p className={styles.savedStamp}>Interest receipt: {interestId}</p> : null}
          {interestMessage ? <p className={interestState === "error" ? styles.errorNote : styles.savedStamp}>{interestMessage}</p> : null}
        </form>
      </section>

      <form className={styles.intakeForm} onSubmit={handleSubmit} noValidate>
        <label>
          <span>Email/contact address *</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className={styles.honeypot} aria-hidden="true">
          <span>Website</span>
          <input
            tabIndex={-1}
            autoComplete="off"
            value={draft.website}
            onChange={(event) => update("website", event.target.value)}
            placeholder="Leave empty"
          />
        </label>

        <label>
          <span>Top raw tasks for today *</span>
          <textarea
            required
            value={draft.rawTasks}
            onChange={(event) => update("rawTasks", event.target.value)}
            rows={5}
            placeholder="Dump alles: taken, losse gedachten, follow-ups, dingen die blijven hangen."
          />
        </label>

        <label>
          <span>Fixed appointments / time constraints *</span>
          <textarea
            required
            value={draft.fixedAppointments}
            onChange={(event) => update("fixedAppointments", event.target.value)}
            rows={3}
            placeholder="Bijv. calls om 10:00 en 14:30, ophalen kinderen, reistijd. Zet 'geen' als er niets vaststaat."
          />
        </label>

        <div className={styles.twoCol}>
          <label>
            <span>Available work window/timezone *</span>
            <input
              required
              value={draft.workWindow}
              onChange={(event) => update("workWindow", event.target.value)}
              placeholder="Bijv. 09:00–12:00 + 15:00–17:30"
            />
          </label>
          <label>
            <span>Timezone</span>
            <input
              value={draft.timezone}
              onChange={(event) => update("timezone", event.target.value)}
              placeholder="Europe/Amsterdam"
            />
          </label>
        </div>

        <label>
          <span>Priority or deadline context *</span>
          <textarea
            required
            value={draft.priorityContext}
            onChange={(event) => update("priorityContext", event.target.value)}
            rows={3}
            placeholder="Wat moet vandaag echt af? Wat heeft geld/klant/risico-impact?"
          />
        </label>

        <label>
          <span>Current morning planning time baseline in minutes *</span>
          <input
            required
            inputMode="numeric"
            pattern="[0-9]*"
            value={draft.planningBaselineMinutes}
            onChange={(event) => update("planningBaselineMinutes", event.target.value)}
            placeholder="Bijv. 45"
          />
        </label>

        <label className={styles.consentBox}>
          <input
            required
            type="checkbox"
            checked={draft.consentAccepted}
            onChange={(event) => update("consentAccepted", event.target.checked)}
          />
          <span>
            Ik accepteer de text-only Phase 1 data boundary: geen calendar OAuth, geen voice upload, raw intake max
            30 dagen, verwijderverzoeken halen mijn intake uit de actieve workflow en zetten deze klaar voor de mailbox-verwijdercyclus via support@aiow.ai/hello@aiow.ai, en ik stuur geen secrets, wachtwoorden,
            medische details, financiële accountgegevens of gevoelige data van derden.
          </span>
        </label>

        <label className={styles.consentBox}>
          <input
            required
            type="checkbox"
            checked={draft.aiTransitAccepted}
            onChange={(event) => update("aiTransitAccepted", event.target.checked)}
          />
          <span>
            Ik begrijp dat OneTap Day human-reviewed is en dat Team Handsome AI-tools mag gebruiken om mijn text-only intake
            samen te vatten en een dagplan te maken. Geen autonomous betaling, store actie, calendar OAuth of voice upload.
          </span>
        </label>

        {!canSubmit ? (
          <p className={styles.validationNote} role="status">
            Nog nodig: {missingFields.map((field) => String(field)).join(", ") || "hydration"}.
          </p>
        ) : null}

        <button className={styles.submitButton} type="submit" disabled={!canSubmit}>
          {submitState === "submitting" ? "Intake versturen…" : "Vraag OneTap-review aan"}
        </button>
      </form>

      <aside className={styles.resultPanel} aria-live="polite">
        <p className={styles.eyebrow}>Wat gebeurt hierna</p>
        <h3>{submitted ? "Intake ontvangen — je aanvraag staat in de queue" : "Nog niet verzonden"}</h3>
        <p>
          Na verzenden krijg je een receipt-id. Team Handsome heeft dan genoeg context om je dag te reviewen en de OneTap-flow te verbeteren. Betaling blijft dicht: dit is geen checkout en geen abonnement.
        </p>
        {savedAt ? <p className={styles.savedStamp}>Intake receipt: {intakeId} · {savedAt}</p> : null}
        {submitMessage ? <p className={submitState === "error" ? styles.errorNote : styles.savedStamp}>{submitMessage}</p> : null}
        <textarea className={styles.summaryBox} readOnly value={summary} rows={12} aria-label="Intake summary" />
        <a className={submitted ? styles.mailAction : styles.mailActionDisabled} href={submitted ? mailtoHref : undefined} aria-disabled={!submitted}>
          Fallback: mail je intake naar hello@aiow.ai
        </a>
        <p className={styles.paymentNote}>
          Geen betaling gestart. Geen abonnement. Geen automatische agenda- of voice-koppeling.
        </p>
      </aside>
    </section>
  );
}
