import type { Metadata } from "next";
import Link from "next/link";
import { AiowCustomerOnboardingForm } from "./AiowCustomerOnboardingForm";

export const metadata: Metadata = {
  title: "Klantaanmelding & onboarding",
  description:
    "Privacy-first AIOW pre-aanvraag: minimale publieke gegevens, volledige venture/company intake pas in privé klantportaal met account-ID en toegangscode.",
  alternates: { canonical: "/nl/aanmelden" },
  robots: { index: false, follow: false },
};

const CHECKS = [
  "Alleen minimale publieke pre-aanvraag",
  "Geen omzet, marges, klantlijsten of vertrouwelijke IP op deze pagina",
  "Volledige venture/company intake pas in privé klantportaal",
  "Account-ID + toegangscode voor gevoelige vervolgstappen",
  "AI Venture Deal Card na private intake",
  "Minimaal 10% omzet/doorverkoop blijft interne dealbasis",
  "Voorwaarden-gate vóór productie/live betalingen",
];

export default function AiowCustomerOnboardingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,240,255,0.22),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(255,79,216,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%)]" />
      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <Link href="/" className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-cyan-300/60 hover:text-cyan-100">
            AIOW.ai
          </Link>
          <p className="mt-10 text-xs uppercase tracking-[0.24em] text-cyan-200/70">Nieuwe klantmodel onboarding</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white md:text-7xl">
            Klantaanvraag voorbereiden zonder live risico.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">
            Deze publieke pagina start alleen een veilige pre-aanvraag. Gevoelige informatie (omzet, marges, klantlijsten, contacten, documenten, IP en dealdata) hoort pas in het privé AIOW klantportaal met account-ID en toegangscode.
          </p>

          <div className="mt-8 grid gap-3">
            {CHECKS.map((check) => (
              <div key={check} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
                <span className="grid size-6 place-items-center rounded-full bg-cyan-300/15 text-xs text-cyan-200">✓</span>
                {check}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/[0.07] p-5 text-sm leading-6 text-amber-50/85">
            <strong className="block text-amber-100">Boundary</strong>
            Formulierstatus is <span className="font-mono text-cyan-100">PAUSED_TERMS_REQUIRED</span>. Het formulier mag intake starten, maar activeert geen productieomgeving, provider billing, live payment source of betaalde module.
          </div>
          <Link href="/portal/account/new" className="mt-4 inline-flex rounded-full border border-cyan-300/30 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10">
            Klantaccount aanmaken →
          </Link>
        </aside>

        <div>
          <AiowCustomerOnboardingForm />
        </div>
      </section>
    </main>
  );
}
