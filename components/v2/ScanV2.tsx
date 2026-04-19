"use client";
/**
 * ScanV2 — chat with Spunky. Portrait left, chat right.
 * Re-uses /api/scan/* endpoints from V1 build.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Msg = { role: "spunky" | "user"; text: string; typing?: boolean };

const INTAKE_Q = [
  "Wat is je naam?",
  "Wat is de naam van je bedrijf?",
  "Wat is je zakelijk e-mailadres?",
];

const SECTORS = [
  "Ambacht", "Accountancy", "Vastgoed", "Juridisch", "Horeca",
  "Productie", "Zakelijke dienstverlening", "E-commerce",
  "Zorg", "Bouw", "Anders"
];

const TEAM_SIZES = ["ZZP", "2-5", "6-20", "21-50", "51+"];

export function ScanV2() {
  const [stage, setStage] = useState<"intake" | "verify" | "questions" | "running" | "done">("intake");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [session, setSession] = useState("");
  const [err, setErr] = useState("");
  const [report, setReport] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, report]);

  useEffect(() => {
    // greet
    setMessages([{ role: "spunky", text: "Hey 👋 Ik ben Spunky! Klaar om te ontdekken welke AI-kansen jouw bedrijf écht gaan helpen?" }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "spunky", text: INTAKE_Q[0] }]);
    }, 1200);
  }, []);

  const pushSpunky = (text: string, delay = 500) => {
    return new Promise<void>((resolve) => {
      setMessages((m) => [...m, { role: "spunky", text: "", typing: true }]);
      setTimeout(() => {
        setMessages((m) => m.slice(0, -1).concat({ role: "spunky", text }));
        resolve();
      }, delay);
    });
  };

  const pushUser = (text: string) => {
    setMessages((m) => [...m, { role: "user", text }]);
  };

  const handleIntake = async (text: string) => {
    const key = step === 0 ? "name" : step === 1 ? "company" : "email";
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      await pushSpunky("Hmm, dat ziet er niet uit als een geldig e-mailadres. Probeer opnieuw?", 600);
      return;
    }
    pushUser(text);
    const newAnswers = { ...answers, [key]: text };
    setAnswers(newAnswers);
    if (step < INTAKE_Q.length - 1) {
      const next = step + 1;
      setStep(next);
      await pushSpunky(INTAKE_Q[next], 800);
    } else {
      // Send code
      await pushSpunky("Top! Ik stuur je nu even een 6-cijferige code naar je mail ter verificatie. Eenmalige check, beloof 🦎", 900);
      try {
        const r = await fetch("/api/scan/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newAnswers.email, name: newAnswers.name, company: newAnswers.company }),
        });
        if (!r.ok) throw new Error((await r.json()).error || "Kon mail niet sturen");
        setStage("verify");
        setStep(0);
        await pushSpunky("Check je inbox. Plak de code hieronder in:", 700);
      } catch (e: any) {
        await pushSpunky(`Oeps — ${e.message}. Probeer opnieuw?`, 700);
      }
    }
  };

  const handleVerify = async (text: string) => {
    pushUser(text);
    try {
      const r = await fetch("/api/scan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: answers.email, code: text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Code klopt niet");
      setSession(j.session);
      setStage("questions");
      setStep(0);
      await pushSpunky(`Gelukt! Welkom, ${answers.name} 🎉`, 700);
      await pushSpunky("Welke sector past bij jouw bedrijf?", 900);
    } catch (e: any) {
      await pushSpunky(`Die code klopte niet. Probeer opnieuw.`, 600);
    }
  };

  const QUESTIONS = [
    { key: "sector", q: "Welke sector past bij jouw bedrijf?", options: SECTORS },
    { key: "teamSize", q: "Hoe groot is je team?", options: TEAM_SIZES },
    { key: "pain", q: "Waar verlies je nu de meeste tijd mee? (kort beschrijven)", options: null },
    { key: "goals", q: "Wat wil je komend jaar bereiken met AI?", options: null },
  ];

  const handleQuestion = async (text: string) => {
    pushUser(text);
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.key]: text };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      await pushSpunky(QUESTIONS[nextStep].q, 900);
    } else {
      // Run scan
      await pushSpunky("Genoeg info. Ik duik er even in... 🤿", 800);
      await pushSpunky("Ik analyseer je bedrijf met 4 AI-modellen op onze fleet. Dit duurt ~60 seconden. Ga een bakkie halen ☕", 1100);
      setStage("running");
      try {
        const r = await fetch("/api/scan/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session, name: newAnswers.name, company: newAnswers.company,
            sector: newAnswers.sector || "Anders", teamSize: newAnswers.teamSize || "1",
            aiUsage: [], timeLosers: [], website: "", socials: "",
            pain: newAnswers.pain || "", goals: newAnswers.goals || "",
            modules: ["workflow", "geo", "social", "documents"],
          }),
        });
        if (!r.ok || !r.body) throw new Error("Scan kon niet starten");
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setReport(acc);
        }
        // Finalize
        fetch("/api/scan/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session, name: newAnswers.name, company: newAnswers.company,
            sector: newAnswers.sector, email: newAnswers.email, report: acc,
          }),
        });
        setStage("done");
      } catch (e: any) {
        await pushSpunky(`Oeps, er ging iets mis: ${e.message}`, 700);
        setStage("questions");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const val = input.trim();
    setInput("");
    if (stage === "intake") handleIntake(val);
    else if (stage === "verify") handleVerify(val);
    else if (stage === "questions") handleQuestion(val);
  };

  const currentQuestion = stage === "questions" ? QUESTIONS[step] : null;

  return (
    <section id="scan" className="relative py-28 md:py-40 bg-[#0A0618] overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        background: "radial-gradient(ellipse at 50% 50%, #FFB82022 0%, transparent 60%)",
      }} />

      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-4">— AI-scan</p>
          <h2 className="font-display text-white text-4xl md:text-6xl font-medium tracking-tight mb-4">
            Chat met Spunky
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            5 minuten chat. 3 concrete AI-kansen. Gratis, geen verplichtingen. 100% lokaal verwerkt.
          </p>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 max-w-5xl mx-auto items-end">
          {/* Spunky portrait */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-50"
              style={{ background: "radial-gradient(circle, #FFB820 0%, #FF4FD8 50%, transparent 80%)" }} />
            <Image
              src="/spunky/spunky-typing.webp"
              alt="Spunky"
              fill
              sizes="256px"
              className="object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(255,184,32,0.3)]"
            />
          </div>

          {/* Chat */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0F0722]/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6FC043] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                {stage === "running" ? "Spunky analyseert…" : "Spunky"}
              </span>
            </div>

            <div className="h-96 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      m.role === "spunky"
                        ? "bg-white/5 text-white/90 rounded-bl-sm self-start"
                        : "bg-gradient-to-br from-[#FFB820] to-[#FF8A00] text-[#0A0618] rounded-br-sm self-end font-medium"
                    }`}
                  >
                    {m.typing ? (
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0s" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </span>
                    ) : m.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {stage === "running" && report && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-full mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="font-mono text-xs uppercase tracking-wider text-[#FFB820] mb-2">
                    Live rapport
                  </p>
                  <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
                    {report}
                  </div>
                </motion.div>
              )}

              {stage === "done" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-5 rounded-2xl border border-[#FFB820]/40 bg-[#FFB820]/10">
                  <p className="text-sm text-white/90 mb-3">
                    ✓ Rapport is ook naar <strong className="text-[#FFB820]">{answers.email}</strong> gemaild.
                  </p>
                  <a
                    href="https://cal.com/handsomebstrd/aiow-scan"
                    target="_blank"
                    rel="noopener"
                    className="inline-block px-5 py-2.5 rounded-full bg-[#FFB820] text-[#0A0618] font-medium text-sm"
                  >
                    Plan 2-uur strategie-call →
                  </a>
                </motion.div>
              )}
              <div ref={chatEnd} />
            </div>

            {/* Input */}
            {stage !== "running" && stage !== "done" && (
              <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 flex gap-2">
                {currentQuestion?.options ? (
                  <div className="flex flex-wrap gap-2 w-full">
                    {currentQuestion.options.map((o) => (
                      <button
                        type="button"
                        key={o}
                        onClick={() => handleQuestion(o)}
                        className="px-3 py-1.5 rounded-full text-xs border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40 transition-colors"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      type={stage === "intake" && step === 2 ? "email" : "text"}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={stage === "verify" ? "6-cijferige code" : "Typ je antwoord…"}
                      autoFocus
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white placeholder-white/30 focus:border-[#FFB820] focus:outline-none text-sm"
                      maxLength={stage === "verify" ? 6 : 200}
                      inputMode={stage === "verify" ? "numeric" : "text"}
                    />
                    <button type="submit" className="px-5 py-2.5 rounded-full font-medium text-sm"
                      style={{ background: "linear-gradient(135deg, #FFB820, #FF8A00)", color: "#14071F" }}>
                      →
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
