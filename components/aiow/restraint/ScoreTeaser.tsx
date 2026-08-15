"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ScoreTeaser.module.css";

/**
 * De weging als configurator (KIA-referentie: het model samenstellen en direct
 * de uitkomst zien). Drie assen, drie keuzes per as, één eerlijke indicatie.
 * Native radio's in fieldsets, score via aria-live; de echte weging blijft de
 * aanvraagflow — dit is een indicatie, geen uitslag, en zo staat het er ook.
 */

const AXES = [
  {
    id: "founder",
    label: "As 1 · De founder",
    question: "Hoe goed ken je de markt waarvoor je bouwt?",
    options: [
      { value: 15, label: "Ik begin net" },
      { value: 24, label: "Ik werk er al jaren in" },
      { value: 31, label: "Bewezen: klanten of een eerder bedrijf" },
    ],
    initial: 1,
  },
  {
    id: "hefboom",
    label: "As 2 · De AI-hefboom",
    question: "Wat doet AI in je product?",
    options: [
      { value: 12, label: "AI beschrijft of rapporteert" },
      { value: 22, label: "AI neemt werk uit handen" },
      { value: 31, label: "AI ís het product" },
    ],
    initial: 0,
  },
  {
    id: "fit",
    label: "As 3 · Partner-fit",
    question: "Hoe wil je met ons samenwerken?",
    options: [
      { value: 10, label: "Liever op uurtarief" },
      { value: 24, label: "Omzetdeel is bespreekbaar" },
      { value: 31, label: "Gedeeld risico, gedeelde winst" },
    ],
    initial: 1,
  },
] as const;

const LAT = 70;

export function ScoreTeaser() {
  const [picks, setPicks] = useState<number[]>(AXES.map((axis) => axis.initial));

  const score = AXES.reduce((sum, axis, index) => sum + axis.options[picks[index]].value, 0);
  const aboveLat = score >= LAT;

  return (
    <div className={styles.teaser}>
      <div className={styles.axes}>
        {AXES.map((axis, axisIndex) => (
          <fieldset className={styles.axis} key={axis.id}>
            <legend className={styles.srOnly}>{`${axis.label}: ${axis.question}`}</legend>
            <div className={styles.axisHead} aria-hidden="true">
              <span className="kr-micro">{axis.label}</span>
              <strong>{axis.question}</strong>
            </div>
            <div className={styles.options} role="presentation">
              {axis.options.map((option, optionIndex) => (
                <label className={styles.option} key={option.label}>
                  <input
                    type="radio"
                    name={`kr-axis-${axis.id}`}
                    checked={picks[axisIndex] === optionIndex}
                    onChange={() =>
                      setPicks((prev) => prev.map((pick, i) => (i === axisIndex ? optionIndex : pick)))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className={styles.board}>
        <p className="kr-micro">Indicatie · geen uitslag</p>
        <p className={styles.score} aria-live="polite">
          <b>{score}</b>
          <span>van 100 · de lat ligt op {LAT}</span>
        </p>
        <div
          className={styles.rail}
          role="img"
          aria-label={`Indicatieve score ${score} van 100, de lat ligt op ${LAT}`}
        >
          <i className={styles.fill} style={{ width: `${score}%` }} aria-hidden="true" />
          <i className={styles.lat} style={{ left: `${LAT}%` }} aria-hidden="true" />
        </div>
        <p className={styles.readout}>
          {aboveLat
            ? "Boven de lat. Dit is het gesprek waard — de echte weging duurt 48 uur."
            : "Onder de lat. Zo weeg je eerlijk: de meeste ideeën halen de lat nog niet."}
        </p>
        <Link className={styles.cta} href="/nl/venture-score-aanvragen">
          Weeg je idee echt
        </Link>
      </div>
    </div>
  );
}
