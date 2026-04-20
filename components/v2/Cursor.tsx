"use client";
/**
 * Cursor — gold trail cursor replacement for non-touch devices.
 */
import { useEffect, useRef } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch devices — don't mount
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    function move(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
    }
    function over(e: MouseEvent) {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor]");
      ring.classList.toggle("is-hover", !!interactive);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);

    let raf: number;
    function tick() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate3d(${rx - 20}px, ${ry - 20}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    tick();

    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ background: "#FFB820" }}
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] border transition-[width,height,border-color,background-color] duration-200"
        style={{ borderColor: "rgba(255,184,32,0.5)" }}
      />
      <style jsx global>{`
        .cursor-ring.is-hover {
          width: 60px;
          height: 60px;
          margin: -10px 0 0 -10px;
          border-color: rgba(255, 184, 32, 0.9);
          background: rgba(255, 184, 32, 0.1);
          backdrop-filter: blur(4px);
        }
        @media (pointer: coarse) { .cursor-ring, .cursor-ring + div { display: none !important; } }
      `}</style>
    </>
  );
}
