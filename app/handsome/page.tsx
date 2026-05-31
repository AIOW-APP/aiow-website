import Link from "next/link";

export const metadata = {
  title: { absolute: "Handsome.bot — apps die iets doen" },
  description: "Consumer apps, early access en bewijs van Team Handsome.",
};

const apps = [
  {
    name: "OneTap Day",
    href: "/apps/onetap-day",
    status: "Early access · provider-off",
    description:
      "Maak van een rommelige dag één uitvoerbaar plan. Eerst recurring value bewijzen, daarna pas betaaltest.",
    cta: "Open OneTap Day",
  },
];

const proof = [
  {
    label: "Betaalproviders live",
    value: "0",
    source: "Stripe/checkout blijft provider-off tot Richard GO.",
  },
  {
    label: "Book gate",
    value: "OPEN",
    source: "Book receipt #660: review pas op echte preview/live build.",
  },
  {
    label: "Reference run",
    value: "OneTap",
    source: "A-Z outcome contract; geen extra governance.",
  },
];

const cardStyle = {
  border: "1px solid rgba(255,184,64,.22)",
  background: "rgba(255,255,255,.07)",
  borderRadius: 28,
  padding: "clamp(1rem, 3vw, 1.6rem)",
} as const;

export default function HandsomeHomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 12% 8%, rgba(255,184,64,.22), transparent 28rem), radial-gradient(circle at 86% 18%, rgba(0,240,255,.12), transparent 26rem), #0d0b08", color: "#fff8ec", fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "clamp(1.2rem, 4vw, 4rem)" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", maxWidth: 1180, margin: "0 auto" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 950, letterSpacing: "-.04em", fontSize: "1.1rem" }}>Handsome.bot</Link>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link href="/apps" style={{ color: "#ffe2ad", textDecoration: "none", fontWeight: 850 }}>Apps</Link>
          <Link href="/early-access" style={{ color: "#ffe2ad", textDecoration: "none", fontWeight: 850 }}>Early access</Link>
          <Link href="/founders" style={{ color: "#ffe2ad", textDecoration: "none", fontWeight: 850 }}>Founders</Link>
          <a href="https://aiow.ai" style={{ color: "#ffb840", textDecoration: "none", fontWeight: 950 }}>AIOW B2B →</a>
        </div>
      </nav>

      <section style={{ maxWidth: 1180, margin: "clamp(4rem, 10vw, 8rem) auto 3rem", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, .7fr)", gap: "clamp(1.2rem, 4vw, 3rem)", alignItems: "end" }}>
        <div>
          <p style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".16em", fontWeight: 950, fontSize: ".78rem" }}>Team Handsome product hub</p>
          <h1 style={{ fontSize: "clamp(3.8rem, 10vw, 9rem)", lineHeight: ".82", letterSpacing: "-.09em", margin: "0 0 1rem" }}>
            Apps die iets doen.
          </h1>
          <p style={{ color: "#d9c7ad", fontSize: "clamp(1.08rem, 2vw, 1.4rem)", lineHeight: 1.55, maxWidth: 760 }}>
            Handsome.bot is de plek voor consumer apps, early access en product proof. Geen procespagina. Geen nep-roadmap. Gewoon dingen openen, testen en bewijzen.
          </p>
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginTop: "1.4rem" }}>
            <Link href="/apps/onetap-day" style={{ background: "#ffb840", color: "#15130f", borderRadius: 999, padding: ".95rem 1.15rem", textDecoration: "none", fontWeight: 950 }}>Open OneTap Day</Link>
            <Link href="/early-access" style={{ background: "rgba(255,255,255,.1)", color: "#fff8ec", border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, padding: ".95rem 1.15rem", textDecoration: "none", fontWeight: 900 }}>Join early access</Link>
          </div>
        </div>
        <aside style={cardStyle}>
          <p style={{ margin: 0, color: "#ffb840", fontWeight: 950 }}>Reference run</p>
          <p style={{ color: "#d9c7ad", lineHeight: 1.55 }}>
            OneTap Day is de A-Z run: outcome contract → product → proof → Book PASS/PARTIAL. Public publish, money, legal/security en store blijven hard-gated.
          </p>
        </aside>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto 1rem", display: "grid", gap: "1rem" }} aria-label="Apps">
        {apps.map((app) => (
          <Link key={app.name} href={app.href} style={{ display: "grid", gap: ".8rem", border: "1px solid rgba(255,184,64,.25)", background: "linear-gradient(135deg, rgba(255,184,64,.16), rgba(255,255,255,.06))", color: "inherit", textDecoration: "none", borderRadius: 32, padding: "clamp(1.2rem, 3vw, 2rem)" }}>
            <span style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".14em", fontSize: ".76rem", fontWeight: 950 }}>{app.status}</span>
            <strong style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", lineHeight: ".9", letterSpacing: "-.07em" }}>{app.name}</strong>
            <span style={{ color: "#d9c7ad", maxWidth: 760, lineHeight: 1.55 }}>{app.description}</span>
            <span style={{ fontWeight: 950, color: "#ffb840" }}>{app.cta} →</span>
          </Link>
        ))}
      </section>

      <section style={{ maxWidth: 1180, margin: "1rem auto", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: ".85rem" }} aria-label="Proof and metrics">
        {proof.map((item) => (
          <article key={item.label} style={cardStyle}>
            <p style={{ margin: 0, color: "#d9c7ad", fontSize: ".82rem", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 900 }}>{item.label}</p>
            <strong style={{ display: "block", fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-.07em", lineHeight: .95 }}>{item.value}</strong>
            <p style={{ color: "#d9c7ad", lineHeight: 1.5 }}>{item.source}</p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: 1180, margin: "1rem auto 0", ...cardStyle }}>
        <p style={{ margin: 0, color: "#ffb840", fontWeight: 950 }}>Gebouwd door een AI team</p>
        <p style={{ color: "#d9c7ad", lineHeight: 1.6, maxWidth: 840 }}>
          Handsome zet de richting, Book bewaakt product/taste, Mini pakt distributie wanneer er iets echts staat. OneTap Day bewijst de machine met één concreet product in plaats van nog een governance-pagina.
        </p>
      </section>
    </main>
  );
}
