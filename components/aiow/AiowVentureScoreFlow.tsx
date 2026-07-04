"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import styles from "./AiowVentureScoreFlow.module.css";

/**
 * Venture-score aanvraagflow (signature-element, zie DESIGN-DNA.md).
 *
 * Drie rustige stappen, een vraaggroep per stap:
 *  1. idee/bedrijf in 3 zinnen + branche
 *  2. fase (idee / eerste klanten / omzet) + doel (bouwen / groeien)
 *  3. naam, e-mail, KvK optioneel
 *
 * HANDOFF(Handsome): er is nog geen backend-endpoint zichtbaar in deze repo.
 * Submit werkt daarom via een mailto-fallback naar jeroen@aiow.io met een nette
 * body. Zodra er een echt endpoint is: vervang `openMailto()` in handleSubmit
 * door een fetch/POST en houd de succes-staat (score-badge) intact. De mailto
 * blijft dan als "of mail ons direct"-alternatief staan.
 */

const CONTACT_EMAIL = "jeroen@aiow.io";
const TOTAL_STEPS = 3;

const STAGE_OPTIONS = [
  { value: "idee", label: "Ik heb een idee", hint: "Nog geen product of klanten" },
  { value: "eerste-klanten", label: "Ik heb eerste klanten", hint: "Product of pilot draait" },
  { value: "omzet", label: "Ik draai omzet", hint: "Bewezen bedrijf, groeikans onbenut" },
] as const;

const GOAL_OPTIONS = [
  { value: "bouwen", label: "Een partner om te bouwen", hint: "Product, AI, software" },
  { value: "groeien", label: "Een partner om te groeien", hint: "Omzet, funnel, schaal" },
] as const;

const STEP_TITLES = ["Je idee", "Waar je staat", "Wie je bent"];

type FormState = {
  idea: string;
  industry: string;
  stage: string;
  goal: string;
  name: string;
  email: string;
  kvk: string;
};

const EMPTY_FORM: FormState = {
  idea: "",
  industry: "",
  stage: "",
  goal: "",
  name: "",
  email: "",
  kvk: "",
};

function optionLabel(options: ReadonlyArray<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function buildMailto(form: FormState) {
  const subject = `Venture-score aanvraag: ${form.name.trim()}`;
  const body = [
    "Venture-score aanvraag via aiow.ai",
    "",
    "Idee of bedrijf (3 zinnen):",
    form.idea.trim(),
    "",
    `Branche: ${form.industry.trim()}`,
    `Fase: ${optionLabel(STAGE_OPTIONS, form.stage)}`,
    `Zoekt: ${optionLabel(GOAL_OPTIONS, form.goal)}`,
    "",
    `Naam: ${form.name.trim()}`,
    `E-mail: ${form.email.trim()}`,
    `KvK: ${form.kvk.trim() || "niet opgegeven"}`,
  ].join("\r\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AiowVentureScoreFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const update = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const validateStep = (current: number): string => {
    if (current === 1) {
      if (form.idea.trim().length < 20) return "Beschrijf je idee of bedrijf in ongeveer 3 zinnen, dan kan Spunky er echt iets van vinden.";
      if (!form.industry.trim()) return "Vul je branche in, een woord is genoeg.";
    }
    if (current === 2) {
      if (!form.stage) return "Kies waar je nu staat, dan weegt de score eerlijk.";
      if (!form.goal) return "Kies wat je zoekt: bouwen of groeien.";
    }
    if (current === 3) {
      if (!form.name.trim()) return "Vul je naam in, we beoordelen founders, geen formulieren.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Dat e-mailadres klopt nog niet helemaal, kijk er even naar.";
    }
    return "";
  };

  const goNext = () => {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validateStep(3);
    if (message) {
      setError(message);
      return;
    }
    // HANDOFF(Handsome): hier komt later de echte POST; nu mailto-fallback.
    window.location.href = buildMailto(form);
    setSent(true);
  };

  if (sent) {
    return (
      <section className={styles.success} aria-live="polite">
        <div className={styles.badge} aria-hidden="true">
          <i />
          <strong>VS</strong>
        </div>
        <p className={styles.eyebrow}>Venture-score</p>
        <h2>Je idee is voorgelegd.</h2>
        <p className={styles.successLead}>
          Je mailapp staat klaar met je aanvraag voor {CONTACT_EMAIL}. Verstuur die mail en je weet
          binnen 48 uur of je idee venture-waardig is. We zeggen vaker nee dan ja, maar altijd
          eerlijk en met een concrete tip.
        </p>
        <div className={styles.successActions}>
          <a className={styles.primary} href={buildMailto(form)}>Mailapp niet geopend? Probeer opnieuw</a>
          <a className={styles.ghost} href={`mailto:${CONTACT_EMAIL}`}>Of mail ons direct: {CONTACT_EMAIL}</a>
        </div>
        <Link className={styles.back} href="/">Terug naar aiow.ai</Link>
      </section>
    );
  }

  return (
    <form className={styles.flow} onSubmit={handleSubmit} noValidate>
      <div className={styles.progress} role="group" aria-label={`Stap ${step} van ${TOTAL_STEPS}: ${STEP_TITLES[step - 1]}`}>
        <p>
          <span>Stap {step} van {TOTAL_STEPS}</span>
          <strong>{STEP_TITLES[step - 1]}</strong>
        </p>
        <div className={styles.progressTrack} aria-hidden="true">
          {STEP_TITLES.map((title, index) => (
            <i key={title} data-active={index < step ? "" : undefined} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <fieldset className={styles.group}>
          <legend>Wat is je idee of bedrijf?</legend>
          <label className={styles.field}>
            <span>Beschrijf het in ongeveer 3 zinnen</span>
            <textarea
              name="idea"
              rows={5}
              value={form.idea}
              onChange={(event) => update("idea")(event.target.value)}
              placeholder="Wat maak je, voor wie, en waarom werkt het?"
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>In welke branche zit je?</span>
            <input
              type="text"
              name="industry"
              value={form.industry}
              onChange={(event) => update("industry")(event.target.value)}
              placeholder="Bijvoorbeeld logistiek, zorg, e-commerce"
              autoComplete="organization-title"
            />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className={styles.group}>
          <legend>Waar sta je nu?</legend>
          <div className={styles.options} role="radiogroup" aria-label="Fase">
            {STAGE_OPTIONS.map((option) => (
              <label key={option.value} className={styles.option} data-checked={form.stage === option.value ? "" : undefined}>
                <input
                  type="radio"
                  name="stage"
                  value={option.value}
                  checked={form.stage === option.value}
                  onChange={() => update("stage")(option.value)}
                />
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </label>
            ))}
          </div>
          <p className={styles.subQuestion}>Wat zoek je bij AIOW?</p>
          <div className={styles.options} role="radiogroup" aria-label="Doel">
            {GOAL_OPTIONS.map((option) => (
              <label key={option.value} className={styles.option} data-checked={form.goal === option.value ? "" : undefined}>
                <input
                  type="radio"
                  name="goal"
                  value={option.value}
                  checked={form.goal === option.value}
                  onChange={() => update("goal")(option.value)}
                />
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className={styles.group}>
          <legend>Wie legt dit voor?</legend>
          <label className={styles.field}>
            <span>Je naam</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(event) => update("name")(event.target.value)}
              placeholder="Voor- en achternaam"
              autoComplete="name"
            />
          </label>
          <label className={styles.field}>
            <span>Je e-mailadres</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => update("email")(event.target.value)}
              placeholder="naam@bedrijf.nl"
              autoComplete="email"
              inputMode="email"
            />
          </label>
          <label className={styles.field}>
            <span>KvK-nummer <em>(optioneel)</em></span>
            <input
              type="text"
              name="kvk"
              value={form.kvk}
              onChange={(event) => update("kvk")(event.target.value)}
              placeholder="Alleen als je al ingeschreven staat"
              autoComplete="off"
              inputMode="numeric"
            />
          </label>
        </fieldset>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        {step > 1 ? (
          <button type="button" className={styles.ghost} onClick={goBack}>Vorige</button>
        ) : (
          <Link className={styles.ghost} href="/">Terug</Link>
        )}
        {step < TOTAL_STEPS ? (
          <button type="button" className={styles.primary} onClick={goNext}>Volgende</button>
        ) : (
          <button type="submit" className={styles.primary}>Vraag je venture-score aan</button>
        )}
      </div>

      <p className={styles.altContact}>
        Liever niet via een formulier? Mail ons direct: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </form>
  );
}
