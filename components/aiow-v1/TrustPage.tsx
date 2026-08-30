import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "@/app/info.module.css";

type Locale = "nl" | "en";
const facts = { legalName: "AIOW B.V.", kvk: "71887466", email: "info@aiow.io", serviceArea: "Nederland" } as const;

export function TrustPage({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const schema = {
    "@context": "https://schema.org", "@type": "Organization", name: "AIOW", legalName: facts.legalName,
    url: "https://aiow.ai", email: facts.email,
    identifier: { "@type": "PropertyValue", propertyID: "KvK", value: facts.kvk },
    areaServed: { "@type": "Country", name: en ? "Netherlands" : facts.serviceArea },
  };
  return <div className={`${shared.site} ${styles.page}`}>
    <PublicHeader locale={locale} />
    <main className={styles.main}>
      <p className={styles.eyebrow}>{en ? "Company and contact" : "Bedrijfsgegevens en contact"}</p>
      <h1>{en ? "Know who you are dealing with." : "Weet met wie je zaken doet."}</h1>
      <p className={styles.lead}>{en ? "Verified company details, a direct contact route and the boundary between an indication and the final written proposal." : "Geverifieerde bedrijfsgegevens, een directe contactroute en de grens tussen een indicatie en het uiteindelijke schriftelijke voorstel."}</p>
      <section className={styles.section} aria-labelledby="company-facts"><h2 id="company-facts">{en ? "Verified details" : "Geverifieerde gegevens"}</h2><dl className={styles.cards}>
        <div className={styles.card}><dt>{en ? "Legal name" : "Statutaire naam"}</dt><dd>{facts.legalName}</dd></div>
        <div className={styles.card}><dt>{en ? "Chamber of Commerce" : "KvK"}</dt><dd>{facts.kvk}</dd></div>
        <div className={styles.card}><dt>{en ? "Service area" : "Werkgebied"}</dt><dd>{en ? "Netherlands" : facts.serviceArea}</dd></div>
      </dl></section>
      <section id="contact" className={styles.section}><h2>{en ? "Contact" : "Contact"}</h2><p>{en ? "For a commercial question, an intake request or a privacy request, email " : "Voor een commerciële vraag, intakeverzoek of privacyverzoek mail je naar "}<a href={`mailto:${facts.email}`}>{facts.email}</a>.</p><p>{en ? "Do not email sensitive material that is not necessary for your question. A scan time entered on the site is a preferred request; a person confirms the practical date and time separately." : "Mail geen gevoelige informatie die niet nodig is voor je vraag. Een scantijd die je op de site invoert is een voorkeursaanvraag; een mens bevestigt de praktische datum en tijd apart."}</p></section>
      <section className={styles.section}><h2>{en ? "Scope and conditions" : "Scope en voorwaarden"}</h2><p>{en ? "Online rates and calculator results are non-binding indications. The final scope, exclusions, responsibilities, delivery conditions and commercial conditions are supplied in the written proposal." : "Online tarieven en calculatoruitkomsten zijn vrijblijvende indicaties. De definitieve scope, uitsluitingen, verantwoordelijkheden, leveringsvoorwaarden en commerciële voorwaarden staan in het schriftelijke voorstel."}</p></section>
      <section className={styles.section}><h2>{en ? "Public intake privacy" : "Privacy van de publieke intake"}</h2><p>{en ? "Public booking and quote details are used only to handle the request and related practical contact. Public intake data is retained for no more than 90 days, unless an active customer relationship or legal obligation requires longer retention. A durable receipt is shown only after the configured intake service has accepted the request; it is not a calendar confirmation." : "Gegevens uit de publieke booking- en offerteflow worden alleen gebruikt om de aanvraag en het praktische contact daarover af te handelen. Publieke intakegegevens worden maximaal 90 dagen bewaard, tenzij een actieve klantrelatie of wettelijke verplichting langere bewaring vereist. Een duurzaam ontvangstbewijs verschijnt alleen nadat de geconfigureerde intakevoorziening de aanvraag heeft geaccepteerd; het is geen agendabevestiging."}</p><p><a href={en ? "/en/privacy" : "/privacy"}>{en ? "Read the complete privacy explanation" : "Lees de volledige privacyuitleg"}</a>.</p></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
    </main>
    <PublicFooter locale={locale} showYear />
  </div>;
}
