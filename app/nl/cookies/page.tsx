import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookiebeleid | AIOW",
  description: "Cookiebeleid van AIOW BV: strikt noodzakelijke cookies, geen marketingcookies en geen analytics zolang dit niet is goedgekeurd.",
};

const sections = [
  {
    title: "1. Gebruik van cookies",
    body: "AIOW.ai maakt op dit moment uitsluitend gebruik van strikt noodzakelijke cookies die noodzakelijk zijn voor de werking van de website. Wij plaatsen geen marketingcookies, advertentiecookies of social media trackers.",
  },
  {
    title: "2. Analytics",
    body: "Wij gebruiken op dit moment geen analyticsscripts of trackingpixels. We evalueren cookievrije opties, zoals Plausible Analytics, voor een toekomstige activering, maar deze zijn nu niet actief.",
  },
  {
    title: "3. Toestemming",
    body: "Omdat wij uitsluitend strikt noodzakelijke cookies plaatsen, is expliciete toestemming op dit moment niet vereist. Als wij in de toekomst niet-noodzakelijke cookies toevoegen, vragen wij vooraf uw toestemming.",
  },
  {
    title: "4. Beheer",
    body: "U kunt cookies verwijderen of blokkeren via uw browserinstellingen. Strikt noodzakelijke cookies kunnen de werking van de site beperken als ze worden geblokkeerd.",
  },
  {
    title: "5. Contact",
    body: "Vragen over ons cookiebeleid? Neem contact op via +31 6 21 89 80 39 (WhatsApp) of via aiow.ai.",
  },
  {
    title: "6. Wijzigingen",
    body: "Dit beleid kan worden bijgewerkt. De actuele versie staat op aiow.ai/nl/cookies.",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-24 text-white md:px-10">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 md:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.36em] text-white/45">AIOW BV</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Cookiebeleid</h1>
        <dl className="mt-8 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
          <div><dt className="text-white/40">Versie</dt><dd>mei 2026</dd></div>
          <div><dt className="text-white/40">KvK</dt><dd>71887466</dd></div>
          <div><dt className="text-white/40">Adres</dt><dd>Bijlmermeerstraat 30, 2131HC Hoofddorp</dd></div>
        </dl>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{section.title}</h2>
              <p className="mt-3 leading-7 text-white/70">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-white/50">
          Opgesteld door AIOW BV. Finale juridische review aanbevolen voor definitieve publicatie.
        </p>
      </article>
    </main>
  );
}
