"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Floating mute-toggle button.
 * Audio is DEFAULT MUTED (respects user + Chrome autoplay policy).
 * User must click once to unmute; choice persists in localStorage.
 */
export default function AmbientAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("aiow_audio_muted") : null;
    const startMuted = stored === null ? true : stored === "1";
    setMuted(startMuted);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.22;
    el.muted = muted;
    if (!muted) {
      el.play().catch(() => { /* autoplay blocked */ });
    } else {
      el.pause();
    }
    localStorage.setItem("aiow_audio_muted", muted ? "1" : "0");
  }, [muted, ready]);

  const toggle = () => setMuted((m) => !m);

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={muted ? "Geluid aanzetten" : "Geluid uitzetten"}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/20 text-white hover:bg-black/60 hover:ring-[#FFB820]/60 transition-all flex items-center justify-center"
      >
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
        )}
      </button>
    </>
  );
}
