import Link from "next/link";

export const metadata = {
  title: { absolute: "Early access — Handsome.bot" },
  description: "Join early access for Team Handsome apps.",
};

export default function EarlyAccessPage() {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 16% 8%, rgba(255,184,64,.2), transparent 28rem), #0d0b08", color: "#fff8ec", fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "clamp(1.2rem, 4vw, 4rem)" }}>
      <nav style={{ maxWidth: 980, margin: "0 auto 4rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 950 }}>Handsome.bot</Link>
        <Link href="/apps" style={{ color: "#ffb840", textDecoration: "none", fontWeight: 950 }}>Apps →</Link>
      </nav>
      <section style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1.2rem" }}>
        <p style={{ color: "#ffb840", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 950 }}>Early access</p>
        <h1 style={{ fontSize: "clamp(3rem, 9vw, 8rem)", lineHeight: ".84", letterSpacing: "-.09em", margin: 0 }}>Kom binnen als het echt is.</h1>
        <p style={{ color: "#d9c7ad", maxWidth: 720, lineHeight: 1.6, fontSize: "1.15rem" }}>
          Meld je aan voor vroege toegang tot Handsome.bot apps. Je krijgt alleen updates wanneer er iets testbaars staat. Geen pricing, geen checkout en geen fake launch.
        </p>
        <form action="mailto:hello@aiow.ai" method="post" encType="text/plain" style={{ display: "grid", gap: ".8rem", maxWidth: 560, border: "1px solid rgba(255,184,64,.24)", background: "rgba(255,255,255,.07)", borderRadius: 28, padding: "1.2rem" }}>
          <label style={{ display: "grid", gap: ".35rem", fontWeight: 850 }}>
            Email
            <input name="email" type="email" required placeholder="jij@example.com" style={{ border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.1)", color: "#fff8ec", borderRadius: 14, padding: ".9rem" }} />
          </label>
          <label style={{ display: "grid", gap: ".35rem", fontWeight: 850 }}>
            Waarvoor wil je early access?
            <textarea name="interest" rows={4} placeholder="OneTap Day, nieuwe apps, founder tools..." style={{ border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.1)", color: "#fff8ec", borderRadius: 14, padding: ".9rem" }} />
          </label>
          <button type="submit" style={{ background: "#ffb840", color: "#15130f", border: 0, borderRadius: 999, padding: ".95rem 1.15rem", fontWeight: 950 }}>Vraag early access</button>
          <small style={{ color: "#d9c7ad", lineHeight: 1.5 }}>Consent-light: je vraagt om een reply/update. Geen betaling. Geen store invite. Verwijderen kan via hello@aiow.ai.</small>
        </form>
      </section>
    </main>
  );
}
