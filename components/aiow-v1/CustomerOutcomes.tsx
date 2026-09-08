import styles from "./CustomerOutcomes.module.css";

const copy = {
  nl: {
    eyebrow: "Van dagelijkse frictie naar een besluit",
    title: "Wat moet er voor u makkelijker worden?",
    note: "Beoogde uitkomsten, geen gemeten resultaten. De scan toetst wat in uw situatie haalbaar is.",
    outcomes: [
      ["Werk", "Een aanvraag op één plek, klaar voor beoordeling.", "In plaats van gegevens overtypen uit mail: een conceptdossier met ontbrekende informatie. Uw medewerker controleert en verstuurt."],
      ["Bedrijfspand", "Een gebouwmelding met een concrete vervolgstap.", "In plaats van losse sensorwaarschuwingen: een onderhoudstaak met ruimte, context en voorgestelde controle. De beheerder beslist; veiligheidsinstallaties blijven leidend."],
      ["Privéleven & thuis", "Een avondinstelling zonder losse apps.", "Verlichting, zonwering en klimaat volgen afgesproken huisregels. Bewoners bepalen welke gegevens gebruikt mogen worden en houden handmatige bediening."],
    ],
    label: "Voorbeeld · fictief",
    memoTitle: "Beslismemo: een aanvraag beoordelen",
    disclaimer: "Illustratie van de scanuitkomst. Geen klantcase, uitgevoerd project of geverifieerd resultaat.",
    problemLabel: "Probleem",
    problem: "Een aanvraag komt per mail binnen. Bijlagen en afspraken staan verspreid; een medewerker zoekt eerst uit wat ontbreekt.",
    summary: "Lees het voorstel en de afweging",
    fields: [
      ["Voorgestelde oplossing", "Laat AI toegestane mails en bijlagen ordenen tot een conceptdossier met bronverwijzingen en ontbrekende gegevens. Niets wordt automatisch naar de klant verstuurd."],
      ["Vereisten & afhankelijkheden", "Toegang tot de gekozen mailbox en CRM, bruikbare brongegevens, afspraken over privacy en bewaartermijnen, en een medewerker die de beoordeling bezit. Koppelingen en rechten moeten eerst worden getoetst."],
      ["Menselijk besluit", "De medewerker controleert bronnen en voorstel, corrigeert fouten en beslist wat wordt verstuurd. De opdrachtgever bepaalt of een beperkte proef mag starten en kan die stoppen."],
      ["Wanneer geen AI", "Zijn aanvragen al uniform en volstaat een formulier met vaste regels? Kies dan die eenvoudigere oplossing. Zonder passende gegevensrechten of betrouwbare bronnen start geen AI-proef."],
      ["Volgende stap", "Bespreek één geanonimiseerde voorbeeldaanvraag en leg acceptatiecriteria vast: juiste bronnen, zichtbare ontbrekende gegevens en menselijke goedkeuring. Pas daarna scope en prijs afspreken; nog geen bouwopdracht."],
    ],
  },
  en: {
    eyebrow: "From everyday friction to a decision",
    title: "What should become easier for you?",
    note: "Intended outcomes, not measured results. The scan checks what is feasible in your situation.",
    outcomes: [
      ["Work", "One request in one place, ready for review.", "Instead of retyping email details: a draft case file with missing information flagged. Your team member checks and sends it."],
      ["Commercial building", "A building alert with a concrete next step.", "Instead of isolated sensor warnings: a maintenance task with the room, context and proposed check. The manager decides; safety systems retain authority."],
      ["Private life & home", "An evening setting without separate apps.", "Lighting, shading and climate follow agreed household rules. Residents choose which data may be used and retain manual controls."],
    ],
    label: "Example · fictional",
    memoTitle: "Decision memo: reviewing a request",
    disclaimer: "Illustration of a scan output. Not a customer case, delivered project or verified result.",
    problemLabel: "Problem",
    problem: "A request arrives by email. Attachments and agreements are scattered; a team member first has to work out what is missing.",
    summary: "Read the proposal and trade-offs",
    fields: [
      ["Proposed solution", "Have AI organise permitted emails and attachments into a draft case file with source references and missing details. Nothing is automatically sent to the customer."],
      ["Requirements & dependencies", "Access to the selected mailbox and CRM, usable source data, privacy and retention agreements, and a team member responsible for review. Integrations and permissions must be checked first."],
      ["Human decision", "The team member checks sources and the proposal, corrects errors and decides what to send. The commissioning owner decides whether a limited trial may start and can stop it."],
      ["When not to use AI", "Are requests already uniform and would a form with fixed rules suffice? Choose that simpler solution. Without appropriate data rights or reliable sources, no AI trial starts."],
      ["Next step", "Discuss one anonymised example request and define acceptance criteria: correct sources, visible missing details and human approval. Only then agree scope and price; this is not yet an instruction to build."],
    ],
  },
} as const;

export function CustomerOutcomes({ locale }: { locale: "nl" | "en" }) {
  const c = copy[locale];
  return <section className={styles.proof} aria-labelledby="customer-outcomes-title" data-customer-outcomes>
    <div className={styles.outcomes}>
      <p className={styles.eyebrow}>{c.eyebrow}</p>
      <h2 id="customer-outcomes-title">{c.title}</h2>
      <p className={styles.note}>{c.note}</p>
      <dl className={styles.rows}>{c.outcomes.map(([world, outcome, explanation]) => <div key={world} data-outcome><dt>{world}</dt><dd><strong>{outcome}</strong><p>{explanation}</p></dd></div>)}</dl>
    </div>
    <article className={styles.memo} aria-labelledby="example-memo-title" data-example-memo>
      <p className={styles.label}>{c.label}</p>
      <h3 id="example-memo-title">{c.memoTitle}</h3>
      <p className={styles.disclaimer}>{c.disclaimer}</p>
      <dl className={styles.fields}><div><dt>{c.problemLabel}</dt><dd>{c.problem}</dd></div></dl>
      <details>
        <summary>{c.summary}</summary>
        <dl className={styles.fields}>{c.fields.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
      </details>
    </article>
  </section>;
}
