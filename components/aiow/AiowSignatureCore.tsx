"use client";

import { useEffect, useRef } from "react";
import styles from "./AiowSignatureCore.module.css";

type Lang = "nl" | "en";

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  phase: number;
};

const labels = {
  nl: {
    badge: "Live prototype",
    title: "AIOW Policy Core",
    subtitle: "Data, modellen, agents en approvals bewegen volgens beleid.",
    nodes: ["Bedrijf", "Lokaal", "Cloud", "Agents", "Approval"],
  },
  en: {
    badge: "Live prototype",
    title: "AIOW Policy Core",
    subtitle: "Data, models, agents and approvals move by policy.",
    nodes: ["Company", "Local", "Cloud", "Agents", "Approval"],
  },
} as const;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function AiowSignatureCore({ lang = "nl" }: { lang?: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const copy = labels[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const nodes: Node[] = [
      { id: "company", label: copy.nodes[0], x: 0.18, y: 0.24, r: 0.078, phase: 0.0 },
      { id: "local", label: copy.nodes[1], x: 0.78, y: 0.25, r: 0.074, phase: 1.1 },
      { id: "cloud", label: copy.nodes[2], x: 0.80, y: 0.74, r: 0.074, phase: 2.2 },
      { id: "agents", label: copy.nodes[3], x: 0.20, y: 0.73, r: 0.076, phase: 3.1 },
      { id: "approval", label: copy.nodes[4], x: 0.50, y: 0.84, r: 0.07, phase: 4.0 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pointer = pointerRef.current;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const draw = (timeMs = 0) => {
      const t = reduced ? 0.25 : timeMs / 1000;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.querySelector("main")?.getAttribute("data-theme") === "dark";
      const ink = isDark ? "248,242,232" : "17,19,15";
      const bg = isDark ? "15,17,14" : "245,239,228";
      const accent = isDark ? "119,217,170" : "31,122,91";
      const gold = isDark ? "217,164,99" : "185,133,76";

      const cx = width * 0.5;
      const cy = height * 0.52;
      const coreR = Math.min(width, height) * 0.145;
      const pulse = 0.5 + Math.sin(t * 1.25) * 0.5;

      const grad = ctx.createRadialGradient(cx - coreR * 0.45, cy - coreR * 0.55, coreR * 0.2, cx, cy, coreR * 1.45);
      grad.addColorStop(0, `rgba(255,255,255,${isDark ? 0.18 : 0.42})`);
      grad.addColorStop(0.45, `rgba(${ink},${isDark ? 0.50 : 0.78})`);
      grad.addColorStop(1, `rgba(${bg},${isDark ? 0.78 : 0.62})`);

      // ambient field
      ctx.fillStyle = `rgba(${accent},${0.035 + pulse * 0.018})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.39, height * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      // routing lines
      const points = nodes.map((node) => {
        const wobble = reduced ? 0 : Math.sin(t * 0.8 + node.phase) * 4;
        const px = node.x * width + wobble;
        const py = node.y * height + Math.cos(t * 0.7 + node.phase) * (reduced ? 0 : 4);
        return { ...node, px, py };
      });

      for (const node of points) {
        const influence = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - node.x, pointer.y - node.y) * 2.2) : 0;
        ctx.strokeStyle = `rgba(${accent},${0.22 + influence * 0.28})`;
        ctx.lineWidth = 1.1 + influence * 1.2;
        ctx.beginPath();
        ctx.moveTo(node.px, node.py);
        const midX = (node.px + cx) / 2;
        const midY = (node.py + cy) / 2 - Math.sin(t + node.phase) * 18;
        ctx.quadraticCurveTo(midX, midY, cx, cy);
        ctx.stroke();

        const particleProgress = (t * 0.16 + node.phase * 0.13) % 1;
        const qx = (1 - particleProgress) * (1 - particleProgress) * node.px + 2 * (1 - particleProgress) * particleProgress * midX + particleProgress * particleProgress * cx;
        const qy = (1 - particleProgress) * (1 - particleProgress) * node.py + 2 * (1 - particleProgress) * particleProgress * midY + particleProgress * particleProgress * cy;
        ctx.fillStyle = `rgba(${gold},${0.42 + influence * 0.28})`;
        ctx.beginPath();
        ctx.arc(qx, qy, 2.4 + influence * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // core badge
      ctx.shadowColor = "rgba(0,0,0,.24)";
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = `rgba(${gold},.42)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR + 8 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isDark ? "#f8f2e8" : "#fff7e8";
      ctx.font = `900 ${Math.max(20, coreR * 0.27)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AIOW", cx, cy - coreR * 0.05);
      ctx.fillStyle = `rgba(${gold},.78)`;
      ctx.font = `800 ${Math.max(8, coreR * 0.105)}px Inter, system-ui, sans-serif`;
      ctx.fillText("POLICY", cx, cy + coreR * 0.32);

      // nodes
      for (const node of points) {
        const influence = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - node.x, pointer.y - node.y) * 2.2) : 0;
        const nr = Math.min(width, height) * node.r * (1 + influence * 0.12);
        ctx.fillStyle = `rgba(${bg},${isDark ? 0.60 : 0.72})`;
        ctx.strokeStyle = `rgba(${accent},${0.22 + influence * 0.38})`;
        ctx.lineWidth = 1.1 + influence;
        drawRoundedRect(ctx, node.px - nr * 1.7, node.py - nr * 0.52, nr * 3.4, nr * 1.04, nr * 0.52);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(${ink},${isDark ? 0.92 : 0.86})`;
        ctx.font = `900 ${Math.max(10, nr * 0.34)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.px, node.py + 0.5);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    draw();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, [copy.nodes]);

  return (
    <figure className={styles.signatureCore} aria-label={copy.title}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <figcaption>
        <span>{copy.badge}</span>
        <strong>{copy.title}</strong>
        <small>{copy.subtitle}</small>
      </figcaption>
    </figure>
  );
}
