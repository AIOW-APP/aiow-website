"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./ThreeWorldsBlueprint.module.css";

type World = "all" | "process" | "property" | "private";
type Locale = "nl" | "en";

const content = {
  nl: {
    proof: "Publieke systeemillustratie · geen klantcase",
    authorityLabel: "Vast anker",
    authority: "U houdt de bevoegdheid",
    aria: "Werkproces, bedrijfspand en privéleven verbonden door één beheerde AIOW-ruggengraat",
    group: "Benadruk een AIOW-wereld",
    controls: [
      { id: "process" as const, title: "Werk", body: "Van signaal naar gecontroleerde uitvoering", href: "/ai-automatisering", link: "AI voor werkprocessen" },
      { id: "property" as const, title: "Pand", body: "Van afwijking naar beheerde actie", href: "/smart-office", link: "AI voor uw pand" },
      { id: "private" as const, title: "Privé", body: "Van wens naar hulp binnen uw grenzen", href: "/home", link: "AI voor thuis" },
    ],
  },
  en: {
    proof: "Public system illustration · not a customer case",
    authorityLabel: "Fixed anchor",
    authority: "You retain authority",
    aria: "Work process, commercial property and private life connected by one managed AIOW spine",
    group: "Emphasise an AIOW world",
    controls: [
      { id: "process" as const, title: "Work", body: "From signal to controlled execution", href: "/en/ai-automation", link: "AI for work processes" },
      { id: "property" as const, title: "Property", body: "From deviation to managed action", href: "/en/smart-office", link: "AI for your property" },
      { id: "private" as const, title: "Private", body: "From intent to help within your boundaries", href: "/en/home", link: "AI for home" },
    ],
  },
} as const;

function DesktopWorld() {
  return <svg className={styles.desktopSvg} viewBox="0 0 980 720" aria-hidden="true" focusable="false">
    <g className={`${styles.zone} ${styles.process}`} data-zone="process">
      <polygon className={styles.paper} points="35,285 300,148 485,246 216,386"/><polygon className={styles.dark} points="35,285 216,386 216,514 35,410"/><polygon className={styles.mid} points="216,386 485,246 485,368 216,514"/><polygon className={styles.warm} points="91,289 190,238 270,280 170,333"/>
      <path className={styles.detail} d="M112 286l61-31 47 24-62 32zM264 239l78-41 58 31-79 41zM118 276l50-25 41 21-50 26zm143-10 32-17 28 15-33 17m-205 73 27 15m21-38 27 15"/><path className={styles.fine} d="M68 350h119m-119 18h119m-119 18h119M246 355l196-102m-196 128 196-102"/><circle className={styles.dark} cx="96" cy="335" r="12"/><circle className={styles.dark} cx="151" cy="321" r="12"/><circle className={styles.node} cx="118" cy="300" r="8"/><circle className={styles.node} cx="322" cy="254" r="8"/>
    </g>
    <g className={`${styles.zone} ${styles.property}`} data-zone="property">
      <polygon className={styles.paper} points="342,175 590,45 801,157 550,291"/><polygon className={styles.dark} points="550,291 801,157 801,406 550,542"/><polygon className={styles.mid} points="342,175 550,291 550,542 342,419"/><path className={styles.glass} d="M575 294l199-106v72L575 368zM575 385l199-106v72L575 459z"/><path className={styles.detail} d="M370 194l156 86v74l-156-90zm0 93 156 90v74l-156-94zM612 137v82m68-118v82m68-118v82"/><polygon className={styles.green} points="560,532 814,395 908,446 652,586"/><circle className={styles.node} cx="548" cy="430" r="8"/>
    </g>
    <g className={`${styles.zone} ${styles.private}`} data-zone="private">
      <polygon className={styles.paper} points="535,508 726,409 934,520 738,622"/><polygon className={styles.warm} points="596,462 728,394 872,471 738,541"/><path className={styles.dark} d="M596 462l142 79v81l-142-79z"/><path className={styles.mid} d="M738 541l134-70v80l-134 71z"/><path className={styles.detail} d="M590 461l139-115 151 125M625 485l101-52 112 59M642 522l48 26v42l-48-27zm142-31l47-25v49l-47 25zM839 414v-48h22v65"/><path className={styles.fine} d="M682 438v-47m55 19v-49m63 83v-47"/><circle className={styles.green} cx="902" cy="464" r="24"/><path className={styles.detail} d="M902 486v35"/><circle className={styles.node} cx="746" cy="548" r="8"/><circle className={styles.node} cx="894" cy="533" r="8"/>
    </g>
    <path className={styles.spineBase} d="M70 435C184 479 229 393 322 254S480 234 548 430 672 596 746 548 858 535 930 486" pathLength="1"/><path className={styles.spine} d="M70 435C184 479 229 393 322 254S480 234 548 430 672 596 746 548 858 535 930 486" pathLength="1"/><circle className={styles.node} cx="70" cy="435" r="9"/><circle className={styles.node} cx="322" cy="254" r="9"/><circle className={styles.human} cx="548" cy="430" r="13"/><circle className={styles.node} cx="746" cy="548" r="9"/><circle className={styles.node} cx="930" cy="486" r="9"/>
  </svg>;
}

function MobileWorld() {
  return <svg className={styles.mobileSvg} viewBox="0 0 390 510" aria-hidden="true" focusable="false">
    <g className={`${styles.zone} ${styles.process}`}><polygon className={styles.paper} points="18,112 123,58 207,102 101,158"/><polygon className={styles.dark} points="18,112 101,158 101,216 18,168"/><polygon className={styles.mid} points="101,158 207,102 207,158 101,216"/><path className={styles.fine} d="M36 137h51m-51 13h51m34 25 70-37m-70 53 70-37"/><path className={styles.detail} d="M59 112l40-21 34 18-41 21m42-6 31-16 24 13-31 16"/><circle className={styles.dark} cx="49" cy="153" r="7"/><circle className={styles.dark} cx="94" cy="143" r="7"/><circle className={styles.node} cx="69" cy="128" r="6"/></g>
    <g className={`${styles.zone} ${styles.property}`}><polygon className={styles.paper} points="178,46 284,0 376,49 269,99"/><polygon className={styles.dark} points="269,99 376,49 376,211 269,263"/><polygon className={styles.mid} points="178,46 269,99 269,263 178,207"/><path className={styles.glass} d="M281 105l82-39v45l-82 40zm0 60 82-40v44l-82 41"/><path className={styles.detail} d="M192 65l62 36v44l-62-38m0 53 62 38v43l-62-39"/><circle className={styles.node} cx="270" cy="222" r="6"/></g>
    <g className={`${styles.zone} ${styles.private}`}><polygon className={styles.paper} points="82,318 190,263 329,338 218,395"/><polygon className={styles.warm} points="120,287 195,249 285,296 208,336"/><path className={styles.dark} d="M120 287l88 49v59l-88-50z"/><path className={styles.mid} d="M208 336l77-40v59l-77 40z"/><path className={styles.detail} d="M113 286l81-67 97 77M142 308l50-26 62 33m-108 23 28 15v27l-28-15m75-63 28-15v30l-28 15"/><circle className={styles.green} cx="309" cy="304" r="13"/><path className={styles.detail} d="M309 317v19"/><circle className={styles.node} cx="216" cy="359" r="6"/></g>
    <path className={styles.spineBase} d="M42 205C86 239 116 185 150 170S219 190 270 222 259 323 216 359 213 420 333 443" pathLength="1"/><path className={styles.spine} d="M42 205C86 239 116 185 150 170S219 190 270 222 259 323 216 359 213 420 333 443" pathLength="1"/><circle className={styles.node} cx="42" cy="205" r="7"/><circle className={styles.node} cx="150" cy="170" r="7"/><circle className={styles.human} cx="270" cy="222" r="11"/><circle className={styles.node} cx="216" cy="359" r="7"/><circle className={styles.node} cx="333" cy="443" r="7"/>
  </svg>;
}

export function ThreeWorldsBlueprint({ locale = "nl" }: { locale?: Locale }) {
  const [active, setActive] = useState<World>("all");
  const c = content[locale];
  function select(world: Exclude<World, "all">) { setActive((current) => current === world ? "all" : world); }
  return <section className={styles.world} data-active={active} aria-label={c.aria}>
    <p className={styles.proof}>{c.proof}</p>
    <div className={styles.approval}><small>{c.authorityLabel}</small><b>{c.authority}</b></div>
    <DesktopWorld/><MobileWorld/>
    <div className={styles.controls} role="group" aria-label={c.group}>
      {c.controls.map((item) => <button type="button" key={item.id} aria-pressed={active === item.id} onClick={() => select(item.id)}><b>{item.title}</b><span>{item.body}</span></button>)}
    </div>
    <div className={styles.detailPanel} aria-live="polite">
      {active === "all" ? <p>{locale === "en" ? "One build discipline. Three worlds. Always under your authority." : "Eén bouwdiscipline. Drie werelden. Altijd onder uw gezag."}</p> : (() => { const item = c.controls.find((candidate) => candidate.id === active)!; return <><p>{item.body}</p><Link href={item.href}>{item.link} ↗</Link></>; })()}
    </div>
  </section>;
}
