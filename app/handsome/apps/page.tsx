import Link from "next/link";

export const metadata = {
  title: { absolute: "Apps — Handsome.bot" },
  description: "Echte Team Handsome apps. Geen roadmap-fictie.",
};

const apps = [
  {
    name: "OneTap Day",
    href: "/apps/onetap-day",
    status: "Early access · provider-off",
    description: "Maak van een rommelige dag één uitvoerbaar plan. De reference run voor de Team Handsome A-Z machine.",
    proof: "Book gate open; betaalprovider blijft uit tot Richard GO.",
  },
];

export default function HandsomeAppsIndex() {
  return (
    <main style={{ minHeight: "100vh", background: "#0d0b08", color: "#fff8ec", fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "clamp(1.2rem, 4vw, 4rem)" }}>
      <nav style={{ maxWidth: 1180, margin: "0 auto 4rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 950 }}>Handsome.bot</Link>
        <Link href="/early-access" style={{ color: "#ffb840", textDecoration: "none", fontWeight: 950 }}>Early access →</Link>
      </nav>
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 950 }}>Apps</p>
        <h1 style={{ fontSize: "clamp(3rem, 9vw, 8rem)", lineHeight: ".84", letterSpacing: "-.09em", margin: "0 0 1rem" }}>Alleen wat bestaat.</h1>
        <p style={{ color: "#d9c7ad", maxWidth: 760, lineHeight: 1.6, fontSize: "1.15rem" }}>Deze pagina toont geen wenslijst en geen roadmap als product. Live of early-access apps komen hier. OneTap Day staat bovenaan omdat dit de reference run is.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
          {apps.map((app) => (
            <Link key={app.name} href={app.href} style={{ color: "inherit", textDecoration: "none", border: "1px solid rgba(255,184,64,.24)", background: "linear-gradient(135deg, rgba(255,184,64,.16), rgba(255,255,255,.06))", borderRadius: 30, padding: "1.35rem", display: "grid", gap: ".75rem" }}>
              <span style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".12em", fontSize: ".74rem", fontWeight: 950 }}>{app.status}</span>
              <strong style={{ fontSize: "2.4rem", letterSpacing: "-.07em", lineHeight: .9 }}>{app.name}</strong>
              <span style={{ color: "#d9c7ad", lineHeight: 1.5 }}>{app.description}</span>
              <span style={{ color: "#ffe2ad", fontWeight: 900 }}>{app.proof}</span>
              <span style={{ color: "#ffb840", fontWeight: 950 }}>Open app →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
