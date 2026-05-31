import Link from "next/link";
import styles from "./AiowPrototypePage.module.css";

type Lang = "en" | "nl";
type Kind = "privacy" | "cookies" | "terms";

const WHATSAPP_URL = "https://wa.me/31621898039";
const LEGAL_ENTITY = "AIOW BV";
const KVK = "71887466";
const ADDRESS_NL = "Bijlmermeerstraat 30, 2131HC Hoofddorp, Nederland";
const ADDRESS_EN = "Bijlmermeerstraat 30, 2131HC Hoofddorp, Netherlands";
const PHONE_DISPLAY = "+31 6 21 89 80 39";

const content: Record<Lang, Record<Kind, { title: string; updated: string; intro: string; sections: { title: string; body: (string | string[])[] }[] }>> = {
  nl: {
    privacy: {
      title: "Privacybeleid",
      updated: "Versie: mei 2026",
      intro: "AIOW BV hecht waarde aan de bescherming van persoonsgegevens. Dit privacybeleid beschrijft welke gegevens wij verwerken, waarom, op welke grondslag en hoe lang.",
      sections: [
        { title: "1. Verwerkingsverantwoordelijke", body: [`${LEGAL_ENTITY}, gevestigd te ${ADDRESS_NL}, KvK ${KVK}. Contact via WhatsApp: ${PHONE_DISPLAY} of via de contactmogelijkheden op aiow.ai.`] },
        { title: "2. Welke gegevens verwerken wij?", body: ["Wij verwerken uitsluitend gegevens die u actief aan ons verstrekt of die technisch noodzakelijk zijn voor een veilige werking van de website.", ["Naam, bedrijfsnaam en contactgegevens bij AI-systeemscan of WhatsApp-contact.", "Informatie over bedrijfsprocessen, systemen, documenten of knelpunten die u vrijwillig deelt tijdens een scan of intake.", "Beperkte technische logs voor beveiliging, foutopsporing en misbruikpreventie.", "Wij plaatsen geen marketingpixels, advertentiecookies of productanalytics zolang dat niet apart is goedgekeurd."]] },
        { title: "3. Grondslagen", body: [["Uitvoering van een overeenkomst of precontractuele stappen (art. 6 lid 1 sub b AVG).", "Gerechtvaardigd belang bij zakelijk contact, beveiliging en dienstverbetering (art. 6 lid 1 sub f AVG).", "Toestemming, waar dit van toepassing is en apart wordt gevraagd."]] },
        { title: "4. Bewaartermijnen", body: ["Gegevens bewaren wij niet langer dan noodzakelijk voor het doel waarvoor ze zijn verstrekt, en niet langer dan wettelijke bewaarplichten vereisen. Concrete bewaartermijnen worden per intake of dienstverlening vastgesteld."] },
        { title: "5. Delen met derden", body: ["Wij verkopen, verhuren of verhandelen persoonsgegevens niet. Wij delen persoonsgegevens alleen wanneer dit nodig is voor hosting, beveiliging, communicatie, wettelijke verplichtingen of uitvoering van de afgesproken dienstverlening. Voor AI-verwerking gebruiken wij waar mogelijk lokale of private infrastructuur. Indien externe AI-diensten worden ingezet, maken wij daar duidelijke afspraken over."] },
        { title: "6. AI, menselijke goedkeuring en geautomatiseerde besluitvorming", body: ["AIOW ontwerpt AI-systemen met menselijke goedkeuring voor externe, publieke, destructieve of gevoelige acties. AIOW neemt geen besluiten met rechtsgevolgen op basis van uitsluitend geautomatiseerde verwerking."] },
        { title: "7. Uw rechten", body: ["U heeft onder de AVG onder meer recht op inzage, correctie, verwijdering, beperking, dataportabiliteit, bezwaar en intrekking van toestemming. Neem contact op via WhatsApp of de contactmogelijkheden op aiow.ai."] },
        { title: "8. Klachten", body: ["U kunt een klacht indienen bij de Autoriteit Persoonsgegevens via autoriteitpersoonsgegevens.nl."] },
        { title: "9. Wijzigingen", body: ["Dit beleid kan worden aangepast. De actuele versie is beschikbaar op aiow.ai/nl/privacy."] },
      ],
    },
    cookies: {
      title: "Cookiebeleid",
      updated: "Versie: mei 2026",
      intro: "Dit cookiebeleid legt uit welke cookies en vergelijkbare technieken AIOW.ai gebruikt.",
      sections: [
        { title: "1. Gebruik van cookies", body: ["AIOW.ai maakt op dit moment uitsluitend gebruik van strikt noodzakelijke cookies of vergelijkbare technieken wanneer die noodzakelijk zijn voor de werking, beveiliging of toegankelijkheid van de website. Wij plaatsen geen marketingcookies, advertentiecookies of social media trackers."] },
        { title: "2. Analytics", body: ["Wij gebruiken op dit moment geen actieve analyticsscripts of trackingpixels. Plausible Analytics is voorbereid als cookieless optie voor toekomstige activering, maar staat uit tenzij expliciet geconfigureerd en gecontroleerd."] },
        { title: "3. Toestemming", body: ["Omdat wij op dit moment uitsluitend strikt noodzakelijke cookies gebruiken, vragen wij geen cookieconsent voor marketing of analytics. Als wij in de toekomst niet-noodzakelijke cookies toevoegen, vragen wij vooraf toestemming."] },
        { title: "4. Beheer", body: ["U kunt cookies verwijderen of blokkeren via uw browserinstellingen. Strikt noodzakelijke cookies kunnen de werking van de site beperken als ze worden geblokkeerd."] },
        { title: "5. Contact", body: [`Vragen over ons cookiebeleid? Neem contact op via WhatsApp: ${PHONE_DISPLAY}.`] },
        { title: "6. Wijzigingen", body: ["Dit beleid kan worden bijgewerkt. De actuele versie staat op aiow.ai/nl/cookies."] },
      ],
    },
    terms: {
      title: "Voorwaarden",
      updated: "Versie: mei 2026",
      intro: "Deze voorwaarden beschrijven het gebruik van AIOW.ai en voorbereidende intake of AI-systeemscan gesprekken. Definitieve projectvoorwaarden worden apart overeengekomen.",
      sections: [
        { title: "1. Wie wij zijn", body: [`${LEGAL_ENTITY}, KvK ${KVK}, gevestigd aan ${ADDRESS_NL}. Contact via WhatsApp: ${PHONE_DISPLAY}.`] },
        { title: "2. Gebruik van de website", body: ["U mag AIOW.ai gebruiken om informatie te bekijken en contact op te nemen over een AI-systeemscan. U mag de website niet misbruiken, overbelasten, kopiëren, reverse-engineeren of gebruiken voor onrechtmatige doelen."] },
        { title: "3. Intake en AI-systeemscan", body: ["Een gratis quick check of intake is oriënterend; een betaalde AI-systeemscan wordt apart bevestigd. Adviezen, voorbeeldscenario's en roadmaps zijn conceptueel totdat scope, data, risico's, kosten en verantwoordelijkheden schriftelijk zijn bevestigd."] },
        { title: "4. Geen garanties of harde resultaten", body: ["AIOW doet geen onbewezen ROI-, besparings-, ranking-, uptime- of benchmarkbeloften. Resultaten hangen af van scope, data, organisatie, technische systemen en menselijke opvolging."] },
        { title: "5. Privacy en vertrouwelijkheid", body: ["Deel geen gevoelige persoonsgegevens, bedrijfsgeheimen of klantdata via publieke of onbeveiligde kanalen zonder afspraak. Voor projecten worden passende afspraken gemaakt over gegevens, toegang, AI-verwerking en goedkeuring."] },
        { title: "6. Aansprakelijkheid", body: ["Voor zover wettelijk toegestaan is AIOW niet aansprakelijk voor indirecte schade, gevolgschade of gemiste kansen door gebruik van publieke website-informatie. Dit beperkt geen aansprakelijkheid die volgens Nederlands recht niet mag worden uitgesloten."] },
        { title: "7. Toepasselijk recht", body: ["Op deze voorwaarden is Nederlands recht van toepassing. Eventuele geschillen worden bij voorkeur eerst in overleg opgelost."] },
        { title: "8. Wijzigingen", body: ["Deze voorwaarden kunnen worden aangepast. De actuele versie is beschikbaar op aiow.ai/nl/terms."] },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy Policy",
      updated: "Version: May 2026",
      intro: "AIOW BV values the protection of personal data. This policy explains what data we process, why, on which basis and for how long.",
      sections: [
        { title: "1. Controller", body: [`${LEGAL_ENTITY}, located at ${ADDRESS_EN}, Dutch Chamber of Commerce / KvK ${KVK}. Contact via WhatsApp: ${PHONE_DISPLAY} or via aiow.ai.`] },
        { title: "2. Data we process", body: ["We process only data you actively provide or data technically necessary for safe website operation.", ["Name, company name and contact details when requesting an AI system scan or contacting us by WhatsApp.", "Information about business processes, systems, documents or bottlenecks you voluntarily share during intake.", "Limited technical logs for security, debugging and abuse prevention.", "We do not run marketing pixels, ad cookies or product analytics unless separately approved."]] },
        { title: "3. Legal bases", body: [["Contract or pre-contractual steps.", "Legitimate interest for business contact, security and service improvement.", "Consent where applicable and separately requested."]] },
        { title: "4. Retention", body: ["We keep data no longer than necessary for the purpose for which it was provided and no longer than required by law. Concrete retention periods are set per intake or service engagement."] },
        { title: "5. Sharing with third parties", body: ["We do not sell, rent or trade personal data. We share data only when needed for hosting, security, communication, legal obligations or delivery of agreed services. For AI processing we use local or private infrastructure where practical. If external AI services are used, this is handled with clear agreements."] },
        { title: "6. AI, human approval and automated decisions", body: ["AIOW designs AI systems with human approval for external, public, destructive or sensitive actions. AIOW does not make decisions with legal effects based solely on automated processing."] },
        { title: "7. Your rights", body: ["Under GDPR, you may have rights of access, correction, deletion, restriction, portability, objection and withdrawal of consent. Contact us via WhatsApp or aiow.ai."] },
        { title: "8. Complaints", body: ["You may file a complaint with the Dutch Data Protection Authority at autoriteitpersoonsgegevens.nl."] },
        { title: "9. Changes", body: ["This policy may be updated. The current version is available at aiow.ai/en/privacy."] },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      updated: "Version: May 2026",
      intro: "This cookie policy explains which cookies and similar technologies AIOW.ai uses.",
      sections: [
        { title: "1. Cookie use", body: ["AIOW.ai currently uses only strictly necessary cookies or similar technologies where required for website operation, security or accessibility. We do not place marketing cookies, advertising cookies or social media trackers."] },
        { title: "2. Analytics", body: ["We currently do not run active analytics scripts or tracking pixels. Plausible Analytics is prepared as a cookieless option for future activation, but remains off unless explicitly configured and checked."] },
        { title: "3. Consent", body: ["Because we currently use only strictly necessary cookies, we do not ask for marketing or analytics cookie consent. If non-essential cookies are added later, we will request prior consent."] },
        { title: "4. Management", body: ["You can delete or block cookies through your browser settings. Blocking strictly necessary cookies may limit site functionality."] },
        { title: "5. Contact", body: [`Questions about this policy? Contact us via WhatsApp: ${PHONE_DISPLAY}.`] },
        { title: "6. Changes", body: ["This policy may be updated. The current version is available at aiow.ai/en/cookies."] },
      ],
    },
    terms: {
      title: "Terms",
      updated: "Version: May 2026",
      intro: "These terms cover use of AIOW.ai and initial intake or AI system scan conversations. Final project terms are agreed separately.",
      sections: [
        { title: "1. Who we are", body: [`${LEGAL_ENTITY}, KvK ${KVK}, located at ${ADDRESS_EN}. Contact via WhatsApp: ${PHONE_DISPLAY}.`] },
        { title: "2. Website use", body: ["You may use AIOW.ai to view information and contact us about an AI system scan. You may not misuse, overload, copy, reverse-engineer or use the website for unlawful purposes."] },
        { title: "3. Intake and AI system scan", body: ["A free AI system scan or intake is exploratory. Advice, example scenarios and roadmaps are conceptual until scope, data, risks, fees and responsibilities are confirmed in writing."] },
        { title: "4. No hard guarantees", body: ["AIOW does not make unsupported ROI, savings, ranking, uptime or benchmark promises. Results depend on scope, data, organization, technical systems and human follow-up."] },
        { title: "5. Privacy and confidentiality", body: ["Do not share sensitive personal data, trade secrets or client data through public or unsecured channels without prior agreement. Projects require appropriate arrangements for data, access, AI processing and approvals."] },
        { title: "6. Liability", body: ["To the extent permitted by law, AIOW is not liable for indirect damages, consequential damages or missed opportunities arising from use of public website information. This does not limit liability that cannot be excluded under Dutch law."] },
        { title: "7. Governing law", body: ["These terms are governed by Dutch law. Disputes should preferably first be resolved through discussion."] },
        { title: "8. Changes", body: ["These terms may be updated. The current version is available at aiow.ai/en/terms."] },
      ],
    },
  },
};

export function AiowLegalPage({ lang, kind }: { lang: Lang; kind: Kind }) {
  const c = content[lang][kind];
  const finalReview = lang === "nl" ? "Finale juridische/privacyreview aanbevolen voordat dit als definitieve juridische versie wordt behandeld." : "Final legal/privacy review recommended before treating this as the definitive legal version.";
  const homeLabel = lang === "nl" ? "Terug naar AIOW" : "Back to AIOW";

  return (
    <main className={styles.policy}>
      <Link href={`/${lang}`} className={styles.logo}>AIOW</Link>
      <p className={styles.eyebrow}>{LEGAL_ENTITY} · KvK {KVK}</p>
      <h1>{c.title}</h1>
      <p className={styles.warning}>{finalReview}</p>
      <p><strong>{c.updated}</strong></p>
      <p>{c.intro}</p>
      {c.sections.map((section) => (
        <section key={section.title} className={styles.legalSection}>
          <h2>{section.title}</h2>
          {section.body.map((block, index) => Array.isArray(block) ? (
            <ul key={index}>{block.map((item) => <li key={item}>{item}</li>)}</ul>
          ) : (
            <p key={index}>{block}</p>
          ))}
        </section>
      ))}
      <p>{LEGAL_ENTITY} · {lang === "nl" ? ADDRESS_NL : ADDRESS_EN} · <a href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a></p>
      <p><Link href={`/${lang}`}>{homeLabel}</Link> · <Link href={`/${lang}/privacy`}>Privacy</Link> · <Link href={`/${lang}/cookies`}>Cookies</Link> · <Link href={`/${lang}/terms`}>Terms</Link></p>
    </main>
  );
}
