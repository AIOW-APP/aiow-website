import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid | AIOW",
  description: "Privacybeleid van AIOW BV: welke persoonsgegevens wij verwerken, waarom, op welke grondslag en hoe lang.",
};

const sections = [
  {
    title: "1. Verwerkingsverantwoordelijke",
    body: "AIOW BV, gevestigd te Bijlmermeerstraat 30, 2131HC Hoofddorp, KvK 71887466. Contact via WhatsApp: +31 6 21 89 80 39 of via de contactmogelijkheden op aiow.ai.",
  },
  {
    title: "2. Welke gegevens verwerken wij?",
    body: "Wij verwerken uitsluitend gegevens die u actief aan ons verstrekt, zoals naam, bedrijfsnaam en contactgegevens bij AI-systeemscan, WhatsApp-contact of OneTap Day intake, en informatie over uw bedrijfsprocessen, taken, afspraken, tijdvensters en prioriteiten die u deelt tijdens een scan of intake. Wij installeren geen analytics, tracking of marketingpixels zolang dat niet uitdrukkelijk is goedgekeurd.",
  },
  {
    title: "3. Grondslagen",
    body: "Wij verwerken gegevens op basis van uitvoering van een overeenkomst of precontractuele stappen (art. 6 lid 1 sub b AVG), gerechtvaardigd belang bij zakelijk contact en dienstverbetering (art. 6 lid 1 sub f AVG), en toestemming waar dit van toepassing is en apart wordt gevraagd.",
  },
  {
    title: "4. Bewaartermijnen",
    body: "Gegevens bewaren wij niet langer dan noodzakelijk voor het doel waarvoor ze zijn verstrekt, en niet langer dan de wettelijke bewaarplichten vereisen. Raw OneTap Day Phase 1 intake wordt maximaal 30 dagen bewaard. Op verzoek via support@aiow.ai of hello@aiow.ai verwijderen wij deze eerder uit de actieve inbox/workflow en zetten wij deze klaar voor permanente verwijdering volgens de verwijdercyclus van de mailboxprovider.",
  },
  {
    title: "5. Delen met derden",
    body: "Wij delen geen persoonsgegevens met derden zonder uw toestemming, behalve waar dit wettelijk verplicht is of noodzakelijk is voor verwerking van door u gevraagde communicatie/dienstverlening, zoals e-maildelivery via Resend (DPA: resend.com/legal/dpa; subprocessors: resend.com/legal/subprocessors). Voor AI-verwerking gebruiken wij waar mogelijk lokale of private infrastructuur. Bij OneTap Day geeft u apart toestemming dat AIOW AI-tools mag gebruiken om uw text-only intake samen te vatten en een dagplan te maken. Stuur geen wachtwoorden, secrets, medische details, financiële accountgegevens of gevoelige data van derden.",
  },
  {
    title: "6. Geen geautomatiseerde besluitvorming",
    body: "AIOW neemt geen besluiten met rechtsgevolgen op basis van uitsluitend geautomatiseerde verwerking.",
  },
  {
    title: "7. Uw rechten",
    body: "U heeft het recht op inzage, correctie, verwijdering, beperking en bezwaar. Neem contact met ons op via de bovenstaande contactgegevens.",
  },
  {
    title: "8. Klachten",
    body: "U kunt een klacht indienen bij de Autoriteit Persoonsgegevens via autoriteitpersoonsgegevens.nl.",
  },
  {
    title: "9. Wijzigingen",
    body: "Dit beleid kan worden aangepast. De actuele versie is beschikbaar op aiow.ai/nl/privacy.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-24 text-white md:px-10">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 md:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.36em] text-white/45">AIOW BV</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Privacybeleid</h1>
        <dl className="mt-8 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
          <div><dt className="text-white/40">Versie</dt><dd>mei 2026</dd></div>
          <div><dt className="text-white/40">KvK</dt><dd>71887466</dd></div>
          <div><dt className="text-white/40">Adres</dt><dd>Bijlmermeerstraat 30, 2131HC Hoofddorp</dd></div>
          <div><dt className="text-white/40">Contact</dt><dd>+31 6 21 89 80 39 (WhatsApp)</dd></div>
        </dl>
        <p className="mt-8 text-lg leading-8 text-white/75">
          AIOW BV (“AIOW”, “wij”, “ons”) hecht waarde aan de bescherming van persoonsgegevens. Dit privacybeleid beschrijft welke gegevens wij verwerken, waarom, op welke grondslag en hoe lang.
        </p>
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
