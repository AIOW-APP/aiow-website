"use client";
/**
 * ScanDebbie — chat with Debbie (replaces ScanV2).
 * Same flow as ScanV2 but Debbie-branded, Dutch "ik".
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Msg = { role: "debbie" | "user"; text: string; typing?: boolean };

const INTAKE_Q = [
  "Wat is je naam?",
  "Wat is de naam van je bedrijf?",
  "Wat is je zakelijk e-mailadres?",
];

const SECTORS = [
  "Accountancy", "Juridisch", "Bouw", "Horeca", "Productie",
  "Zakelijke diensten", "E-commerce", "Zorg", "Ambacht", "Anders"
];
const TEAM_SIZES = ["ZZP", "2-5", "6-20", "21-50", "51+"];

export function ScanDebbie() {
  const [stage, setStage] = useState<"intake" | "verify" | "questions" | "running" | "done">("intake");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [session, setSession] = useState("");
  const [report, setReport] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, report]);

  useEffect(() => {
    setMessages([{ role: "debbie", text: "Hee! 👋 Leuk dat je er bent. Ik ben Debbie. Zullen we eens kijken waar AI jouw bedrijf kan helpen?" }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "debbie", text: INTAKE_Q[0] }]);
    }, 1400);
  }, []);

  const pushDebbie = (text: string, delay = 500) => {
    return new Promise<void>((resolve) => {
      setMessages((m) => [...m, { role: "debbie", text: "", typing: true }]);
      setTimeout(() => {
        setMessages((m) => m.slice(0, -1).concat({ role: "debbie", text }));
        resolve();
      }, delay);
    });
  };
  const pushUser = (text: string) => setMessages((m) => [...m, { role: "user", text }]);

  const handleIntake = async (text: string) => {
    const key = step === 0 ? "name" : step === 1 ? "company" : "email";
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      await pushDebbie("Hmm, dat ziet er niet uit als een geldig mailadres. Probeer opnieuw?", 600);
      return;
    }
    pushUser(text);
    const newAnswers = { ...answers, [key]: text };
    setAnswers(newAnswers);
    if (step < INTAKE_Q.length - 1) {
      const next = step + 1;
      setStep(next);
      await pushDebbie(INTAKE_Q[next], 800);
    } else {
      await pushDebbie("Top! Ik stuur je nu even een 6-cijferige code naar je mail. Eenmalige check ✨", 900);
      try {
        const r = await fetch("/api/scan/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newAnswers.email, name: newAnswers.name, company: newAnswers.company }),
        });
        if (!r.ok) throw new Error((await r.json()).error || "Kon mail niet sturen");
        setStage("verify"); setStep(0);
        await pushDebbie("Check je inbox. Plak de code hieronder:", 700);
      } catch (e: any) {
        await pushDebbie(`Oeps — ${e.message}. Probeer opnieuw?`, 700);
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
      setStage("questions"); setStep(0);
      await pushDebbie(`Gelukt! Welkom, ${answers.name} 🎉`, 700);
      await pushDebbie("Welke sector past bij jouw bedrijf?", 900);
    } catch {
      await pushDebbie(`Die code klopte niet. Probeer opnieuw.`, 600);
    }
  };

  const QUESTIONS = [
    { key: "sector", q: "Welke sector past bij jouw bedrijf?", options: SECTORS },
    { key: "teamSize", q: "Hoe groot is je team?", options: TEAM_SIZES },
    { key: "pain", q: "Waar verlies je de meeste tijd mee? Vertel het me in je eigen woorden.", options: null },
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
      await pushDebbie(QUESTIONS[nextStep].q, 900);
    } else {
      await pushDebbie("Genoeg info. Ik duik er even in... 🤿", 800);
      await pushDebbie("Ik analyseer je bedrijf nu met 4 AI-modellen op onze eigen machines. Duurt ongeveer een minuut.", 1100);
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
        await pushDebbie(`Oeps — ${e.message}`, 700);
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
    <section id="scan" className="relative py-28 md:py-40 overflow-hidden" style={{ background: "#0A0618" }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 50%, #FFB82020 0%, transparent 60%)",
      }} />
      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            · Chat met mij
          </p>
          <h2 className="font-display text-white text-4xl md:text-6xl font-medium tracking-tight mb-4">
            Vijf minuten. Drie kansen.
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Geen formulier. Gewoon een gesprek met mij. Je krijgt een rapport in je inbox.
          </p>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 max-w-5xl mx-auto items-end">
          {/* Debbie portrait */}
          <div className="relative w-56 h-72 md:w-64 md:h-80 mx-auto md:mx-0">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-50"
              style={{ background: "radial-gradient(circle, #FFB820 0%, #FF4FD8 50%, transparent 80%)" }} />
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10">
              <Image
                src="/debbie/laptop.webp"
                alt="Debbie"
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, transparent 40%, rgba(10,6,24,0.6) 100%)",
              }} />
            </div>
            {/* typing indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FC043] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">Debbie · Online</span>
            </div>
          </div>

          {/* Chat */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0F0722]/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6FC043] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                {stage === "running" ? "Debbie analyseert..." : "Gesprek met Debbie"}
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
                      m.role === "debbie"
                        ? "bg-white/5 text-white/90 rounded-bl-sm self-start"
                        : "bg-gradient-to-br from-[#FFB820] to-[#FF8A00] text-[#0A0618] rounded-br-sm self-end font-medium"
                    }`}
                  >
                    {m.typing ? (
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </span>
                    ) : m.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {stage === "running" && report && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="max-w-full mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFB820] mb-2">Live rapport</p>
                  <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{report}</div>
                </motion.div>
              )}

              {stage === "done" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-5 rounded-2xl border border-[#FFB820]/40 bg-[#FFB820]/10">
                  <p className="text-sm text-white/90 mb-3">
                    ✓ Rapport is naar <strong className="text-[#FFB820]">{answers.email}</strong>.
                  </p>
                  <a href="https://cal.com/handsomebstrd/aiow-scan" target="_blank" rel="noopener"
                    className="inline-block px-5 py-2.5 rounded-full bg-[#FFB820] text-[#0A0618] font-medium text-sm">
                    Plan 2-uur strategie-call →
                  </a>
                </motion.div>
              )}
              <div ref={chatEnd} />
            </div>

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
                      type={stage === "intake" && step === 2 ? "email" : "text"}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={stage === "verify" ? "6-cijferige code" : "Typ je antwoord..."}
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
