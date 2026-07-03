import Link from "next/link";

export const metadata = {
  title: "AIOW | AI systems for companies",
  description: "AIOW.ai is the informational B2B site for AI systems, automation and secure worklayers.",
  robots: { index: false, follow: false },
};

export default function ProjectsMovedPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "clamp(2rem, 6vw, 5rem)", background: "#f5efe3", color: "#15130f", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      <Link href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 900 }}>← AIOW</Link>
      <section style={{ maxWidth: 860, margin: "clamp(3rem, 8vw, 7rem) auto" }}>
        <p style={{ color: "#9a6d32", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 950, fontSize: ".78rem" }}>AIOW.ai</p>
        <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", lineHeight: ".9", letterSpacing: "-.07em", margin: "0 0 1rem" }}>AI-systemen voor bedrijven, geen app-store.</h1>
        <p style={{ color: "#5b5146", fontSize: "clamp(1rem, 1.7vw, 1.25rem)", lineHeight: 1.55 }}>
          AIOW.ai blijft de informatieve B2B-laag: wat we bouwen, hoe we werken, welke datagrenzen we hanteren en hoe bedrijven met AI-workflows kunnen starten.
        </p>
        <p style={{ color: "#5b5146", fontSize: "clamp(1rem, 1.7vw, 1.25rem)", lineHeight: 1.55 }}>
          Consumer apps, early-adopter deals en lifetime-founder opties horen op Handsome.bot. Tot die hub live is, blijven eventuele revenue tests bewust beperkt en niet als AIOW-projectindex gepositioneerd.
        </p>
        <Link href="/#scan" style={{ display: "inline-flex", marginTop: "1rem", color: "#15130f", fontWeight: 950 }}>Start een AIOW AI-scan →</Link>
      </section>
    </main>
  );
}
