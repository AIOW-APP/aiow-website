import Link from "next/link";

export const metadata = {
  title: { absolute: "Founders — Handsome.bot" },
  description: "The AI team behind Handsome.bot apps.",
};

const founders = [
  { icon: "👑", name: "Handsome", lane: "commander, product pressure, final gates" },
  { icon: "🧠", name: "Book", lane: "strategy, taste, UX, PASS/PARTIAL review" },
  { icon: "👽", name: "Mini", lane: "social, distribution, support once proof exists" },
];

export default function FoundersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0d0b08", color: "#fff8ec", fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "clamp(1.2rem, 4vw, 4rem)" }}>
      <nav style={{ maxWidth: 1080, margin: "0 auto 4rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 950 }}>Handsome.bot</Link>
        <Link href="/apps/onetap-day" style={{ color: "#ffb840", textDecoration: "none", fontWeight: 950 }}>OneTap Day →</Link>
      </nav>
      <section style={{ maxWidth: 1080, margin: "0 auto" }}>
        <p style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 950 }}>Founders</p>
        <h1 style={{ fontSize: "clamp(3rem, 9vw, 8rem)", lineHeight: ".84", letterSpacing: "-.09em", margin: "0 0 1rem" }}>AI team. Echte producten.</h1>
        <p style={{ color: "#d9c7ad", maxWidth: 760, lineHeight: 1.6, fontSize: "1.15rem" }}>
          Handsome.bot wordt gebouwd door Team Handsome: commander plus AI lanes. Niet als org-chart. Als machine die kleine, testbare producten van idee naar bewijs brengt.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
          {founders.map((founder) => (
            <article key={founder.name} style={{ border: "1px solid rgba(255,184,64,.24)", background: "rgba(255,255,255,.07)", borderRadius: 28, padding: "1.2rem" }}>
              <span style={{ fontSize: "2.4rem" }}>{founder.icon}</span>
              <h2 style={{ fontSize: "2.2rem", letterSpacing: "-.06em", margin: ".7rem 0 .3rem" }}>{founder.name}</h2>
              <p style={{ color: "#d9c7ad", lineHeight: 1.5 }}>{founder.lane}</p>
            </article>
          ))}
        </div>
        <section style={{ marginTop: "1rem", border: "1px solid rgba(255,184,64,.24)", background: "linear-gradient(135deg, rgba(255,184,64,.14), rgba(255,255,255,.06))", borderRadius: 28, padding: "1.2rem" }}>
          <p style={{ color: "#ffb840", fontWeight: 950, margin: 0 }}>Proof</p>
          <p style={{ color: "#d9c7ad", lineHeight: 1.6 }}>OneTap Day is de eerste reference run. Als deze PASS haalt, is het template klaar voor het volgende idee: intake → outcome contract → build → proof → review.</p>
        </section>
      </section>
    </main>
  );
}
