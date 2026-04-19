"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0, ease: "none" });
    };

    const onHoverInteractive = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor='interactive']");
      if (interactive) {
        gsap.to(follower, { scale: 2.5, borderColor: "var(--color-accent)", backgroundColor: "transparent", duration: 0.3 });
      } else {
        gsap.to(follower, { scale: 1, borderColor: "var(--color-ink-faint)", backgroundColor: "var(--color-ink)", duration: 0.3 });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onHoverInteractive);

    // smooth follower
    let rafId = 0;
    const tick = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      gsap.set(follower, { x: followerX, y: followerY });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onHoverInteractive);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 bg-[var(--color-accent)] rounded-full"
        style={{ transform: "translate(-50%, -50%)", zIndex: 9999, mixBlendMode: "difference" }}
      />
      <div
        ref={followerRef}
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border-2"
        style={{
          transform: "translate(-50%, -50%)",
          background: "var(--color-ink)",
          borderColor: "var(--color-ink-faint)",
          zIndex: 9998,
          mixBlendMode: "difference",
          transition: "all 0.3s ease",
        }}
      />
    </>
  );
}
