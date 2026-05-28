import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | AIOW",
  description: "Cookie policy for AIOW BV: strictly necessary cookies, no marketing cookies and no analytics unless approved.",
};

const sections = [
  { title: "1. Use of cookies", body: "AIOW.ai currently uses only strictly necessary cookies required for the operation of the website. We do not place marketing cookies, advertising cookies or social media trackers." },
  { title: "2. Analytics", body: "We currently do not use analytics scripts or tracking pixels. We are evaluating cookieless options such as Plausible Analytics for future activation, but they are not active now." },
  { title: "3. Consent", body: "Because we only place strictly necessary cookies, explicit consent is currently not required. If we add non-essential cookies in the future, we will request your consent in advance." },
  { title: "4. Management", body: "You can delete or block cookies via your browser settings. Blocking strictly necessary cookies may limit website functionality." },
  { title: "5. Contact", body: "Questions about our cookie policy? Contact us via +31 6 21 89 80 39 (WhatsApp) or via aiow.ai." },
  { title: "6. Changes", body: "This policy may be updated. The current version is available at aiow.ai/en/cookies." },
];

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-24 text-white md:px-10">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 md:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.36em] text-white/45">AIOW BV</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Cookie Policy</h1>
        <dl className="mt-8 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
          <div><dt className="text-white/40">Version</dt><dd>May 2026</dd></div>
          <div><dt className="text-white/40">Chamber of Commerce</dt><dd>71887466</dd></div>
          <div><dt className="text-white/40">Address</dt><dd>Bijlmermeerstraat 30, 2131HC Hoofddorp</dd></div>
        </dl>
        <div className="mt-10 space-y-8">{sections.map((section) => (<section key={section.title}><h2 className="text-xl font-semibold tracking-[-0.02em]">{section.title}</h2><p className="mt-3 leading-7 text-white/70">{section.body}</p></section>))}</div>
        <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-white/50">Prepared by AIOW BV. Final legal review is recommended before definitive publication.</p>
      </article>
    </main>
  );
}
