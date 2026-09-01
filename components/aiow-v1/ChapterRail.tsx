"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import styles from "./AiowV1Homepage.module.css";

export type Chapter = { id: string; label: string };

/**
 * Chapter rail: the homepage reads as numbered chapters (the statement rail
 * already counts 01 — 04). On wide viewports a fixed hairline rail on the
 * right mirrors that: one engraved progress line that settles with a spring,
 * chapter indices as anchors, and only the active chapter carries its label.
 * It is real navigation (a nav with in-page links), stays out of the hero
 * (the instrument plate owns that viewport) and never scroll-jacks. Reduced
 * motion keeps the rail and the active state; the line simply tracks scroll.
 */
export function ChapterRail({ chapters, label }: { chapters: Chapter[]; label: string }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.8 });

  useEffect(() => {
    const nodes = chapters.map((chapter) => document.getElementById(chapter.id)).filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      let best = -1; let index = active;
      nodes.forEach((node, i) => { const ratio = ratios.get(node) ?? 0; if (ratio > best) { best = ratio; index = i; } });
      if (best > 0) setActive(index);
    }, { rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.05, 0.2, 0.5, 0.8, 1] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  return (
    <nav className={styles.chapterRail} aria-label={label} data-active={active > 0 ? "true" : "false"}>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id} data-on={index === active ? "true" : "false"}>
            <a href={`#${chapter.id}`} aria-current={index === active ? "location" : undefined}>
              <b>{chapter.label}</b>
              <span>0{index + 1}</span>
            </a>
          </li>
        ))}
      </ol>
      <i className={styles.chapterTrack} aria-hidden="true">
        <motion.b style={reduced ? { scaleY: scrollYProgress } : { scaleY: progress }} />
      </i>
    </nav>
  );
}
