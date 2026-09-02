import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "@/app/info.module.css";
import { organizationNode } from "@/lib/aiow-v1/seo";
import { AIOW_COMPANY } from "@/lib/aiow-v1/company.mjs";

type Locale = "nl" | "en";

export function TrustPage({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const schema = organizationNode(locale);
  return <div className={`${shared.site} ${styles.page}`}>
    <PublicHeader locale={locale} />
    <main className={styles.main}>
      <p className={styles.eyebrow}>{en ? "Company and contact" : "Bedrijfsgegevens en contact"}</p>
      <h1>{en ? "Know who you are dealing with." : "Weet met wie u zaken doet."}</h1>
      <p className={styles.lead}>{en ? "AIOW B.V. is based in Hoofddorp and serves clients throughout the Netherlands. Here you will find verified company details, a direct contact route and the boundary between an indication and the final written proposal." : "AIOW B.V. is gevestigd in Hoofddorp en werkt voor klanten in heel Nederland. Hier vindt u geverifieerde bedrijfsgegevens, een directe contactroute en de grens tussen een indicatie en het uiteindelijke schriftelijke voorstel."}</p>
      <section className={styles.section} aria-labelledby="company-facts"><h2 id="company-facts">{en ? "Verified details" : "Geverifieerde gegevens"}</h2><dl className={styles.cards}>
        <div className={styles.card}><dt>{en ? "Legal name" : "Statutaire naam"}</dt><dd>{AIOW_COMPANY.legalName}</dd></div>
        <div className={styles.card}><dt>{en ? "Chamber of Commerce" : "KvK"}</dt><dd>{AIOW_COMPANY.chamberOfCommerce}</dd></div>
        <div className={styles.card}><dt>{en ? "Business address" : "Vestigingsadres"}</dt><dd>{AIOW_COMPANY.streetAddress}<br />{AIOW_COMPANY.postalCode} {AIOW_COMPANY.locality}</dd></div>
        <div className={styles.card}><dt>{en ? "Service area" : "Werkgebied"}</dt><dd>{en ? AIOW_COMPANY.countryEn : AIOW_COMPANY.countryNl}</dd></div>
      </dl></section>
      <section id="contact" className={styles.section}><h2>{en ? "Contact" : "Contact"}</h2><p>{en ? "For a commercial question, a scan request or a privacy request, email " : "Voor een commerciële vraag, scanaanvraag of privacyverzoek mailt u naar "}<a href={`mailto:${AIOW_COMPANY.publicEmail}`}>{AIOW_COMPANY.publicEmail}</a>.</p><p>{en ? "Do not email sensitive material that is not necessary for your question. A person confirms the practical scan date and time separately." : "Mail geen gevoelige informatie die niet nodig is voor uw vraag. Een mens bevestigt de praktische scandatum en -tijd apart."}</p></section>
      <section className={styles.section}><h2>{en ? "Scope and conditions" : "Scope en voorwaarden"}</h2><p>{en ? "Online rates and calculator results are non-binding indications. The final scope, exclusions, responsibilities, delivery conditions and commercial conditions are supplied in the written proposal." : "Online tarieven en calculatoruitkomsten zijn vrijblijvende indicaties. De definitieve scope, uitsluitingen, verantwoordelijkheden, leveringsvoorwaarden en commerciële voorwaarden staan in het schriftelijke voorstel."}</p></section>
      <section className={styles.section}><h2>{en ? "Public intake privacy" : "Privacy van de publieke intake"}</h2><p>{en ? "Public booking and quote details are used only to handle the request and related practical contact. Public intake data is retained for no more than 90 days, unless an active customer relationship or legal obligation requires longer retention. A durable receipt is shown only after the configured intake service has accepted the request; it is not a calendar confirmation." : "Gegevens uit de publieke booking- en offerteflow worden alleen gebruikt om de aanvraag en het praktische contact daarover af te handelen. Publieke intakegegevens worden maximaal 90 dagen bewaard, tenzij een actieve klantrelatie of wettelijke verplichting langere bewaring vereist. Een duurzaam ontvangstbewijs verschijnt alleen nadat de geconfigureerde intakevoorziening de aanvraag heeft geaccepteerd; het is geen agendabevestiging."}</p><p><a href={en ? "/en/privacy" : "/privacy"}>{en ? "Read the complete privacy explanation" : "Lees de volledige privacyuitleg"}</a>.</p></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
    </main>
    <PublicFooter locale={locale} showYear />
  </div>;
}
