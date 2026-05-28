import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AIOW",
  description: "Privacy policy for AIOW BV: what personal data we process, why, on what legal basis and for how long.",
};

const sections = [
  { title: "1. Controller", body: "AIOW BV, located at Bijlmermeerstraat 30, 2131HC Hoofddorp, the Netherlands, Dutch Chamber of Commerce number 71887466. Contact via WhatsApp: +31 6 21 89 80 39 or via the contact options on aiow.ai." },
  { title: "2. What data do we process?", body: "We only process data that you actively provide, such as name, company name and contact details during an AI system scan or WhatsApp contact, and information about your business processes that you share during a scan or intake. We do not install analytics, tracking or marketing pixels unless this has been explicitly approved." },
  { title: "3. Legal bases", body: "We process data on the basis of performance of a contract or pre-contractual steps, legitimate interest in business contact and service improvement, and consent where applicable and requested separately." },
  { title: "4. Retention", body: "We do not keep data longer than necessary for the purpose for which it was provided, and no longer than required by legal retention obligations." },
  { title: "5. Sharing with third parties", body: "We do not share personal data with third parties without your consent, except where legally required. For AI processing we use local or private infrastructure where possible. If external AI services are used, we will inform you and request your approval." },
  { title: "6. No automated decision-making", body: "AIOW does not make decisions with legal effects based solely on automated processing." },
  { title: "7. Your rights", body: "You have the right to access, correction, deletion, restriction and objection. Contact us using the details above." },
  { title: "8. Complaints", body: "You may file a complaint with the Dutch Data Protection Authority at autoriteitpersoonsgegevens.nl." },
  { title: "9. Changes", body: "This policy may be updated. The current version is available at aiow.ai/en/privacy." },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-24 text-white md:px-10">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 md:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.36em] text-white/45">AIOW BV</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Privacy Policy</h1>
        <dl className="mt-8 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
          <div><dt className="text-white/40">Version</dt><dd>May 2026</dd></div>
          <div><dt className="text-white/40">Chamber of Commerce</dt><dd>71887466</dd></div>
          <div><dt className="text-white/40">Address</dt><dd>Bijlmermeerstraat 30, 2131HC Hoofddorp</dd></div>
          <div><dt className="text-white/40">Contact</dt><dd>+31 6 21 89 80 39 (WhatsApp)</dd></div>
        </dl>
        <p className="mt-8 text-lg leading-8 text-white/75">AIOW BV (“AIOW”, “we”, “us”) values the protection of personal data. This policy describes which data we process, why, on what legal basis and for how long.</p>
        <div className="mt-10 space-y-8">{sections.map((section) => (<section key={section.title}><h2 className="text-xl font-semibold tracking-[-0.02em]">{section.title}</h2><p className="mt-3 leading-7 text-white/70">{section.body}</p></section>))}</div>
        <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-white/50">Prepared by AIOW BV. Final legal review is recommended before definitive publication.</p>
      </article>
    </main>
  );
}
