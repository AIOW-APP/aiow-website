/* Mock-data waar geen API is (zelfde afspraak als de Tisnix- en Cargo-app).
 * De weging van dossier #218 is een demoweging die het echte instrument het
 * echt laat doen (les A18: demo = het echte product); de assen en gewichten
 * zijn samengesteld uit echte aanvragen, net als #217 op de site.
 * HANDOFF(Handsome): zodra het venture-score-endpoint bestaat vervangt een
 * fetch deze module; de schermen lezen alleen deze types. */

export const DOSSIER_NR = '#218';
export const LAT = 70;

export type WegingFase =
  | 'ontvangen'
  | 'founder'
  | 'venture'
  | 'partner-fit'
  | 'verdict';

export const FASEN: ReadonlyArray<{ key: WegingFase; chip: string }> = [
  { key: 'ontvangen', chip: 'Aanvraag ontvangen' },
  { key: 'founder', chip: 'As 1 · de founder wordt gewogen' },
  { key: 'venture', chip: 'As 2 · de venture wordt gewogen' },
  { key: 'partner-fit', chip: 'As 3 · partner fit wordt gewogen' },
  { key: 'verdict', chip: 'Het verdict is binnen' },
] as const;

export const faseIndex = (f: WegingFase): number => FASEN.findIndex((x) => x.key === f);

export type As = {
  id: 'founder' | 'venture' | 'partner-fit';
  label: string;
  naam: string;
  regel: string;
  gewicht: number;
  max: number;
  noot: string;
};

export const ASSEN: ReadonlyArray<As> = [
  {
    id: 'founder',
    label: 'AS 1 · DE FOUNDER',
    naam: 'Eerst de mens, dan het idee.',
    regel: 'Kent de markt, tweede bedrijf, 9 pilotklanten in eigen netwerk.',
    gewicht: 28,
    max: 33,
    noot: 'sterk',
  },
  {
    id: 'venture',
    label: 'AS 2 · DE VENTURE',
    naam: 'Draagt AI het product, of versiert het alleen?',
    regel: 'De AI zit in de rapportage, niet in de planning zelf. Daar knelt het.',
    gewicht: 17,
    max: 33,
    noot: 'hier knelt het',
  },
  {
    id: 'partner-fit',
    label: 'AS 3 · PARTNER FIT',
    naam: 'Huid in het spel, of we beginnen er niet aan.',
    regel: 'Omzetdeel akkoord, roadmap deels belegd, bouwruimte beperkt.',
    gewicht: 21,
    max: 34,
    noot: 'voldoende',
  },
] as const;

export const TOTAAL = ASSEN.reduce((som, as) => som + as.gewicht, 0); // 66

export const VERDICT = {
  kop: 'Nee. Met een concrete tip.',
  tekst:
    'De founder is sterk, maar de AI-hefboom is te dun. Bouw de AI in het hart ' +
    'van de planning, niet ernaast in de rapportage. Kom daarna terug.',
  draai: 'Wij zeggen vaker nee dan ja. Daarom is ons ja iets waard.',
} as const;

/* Intake: dezelfde drie stappen en opties als de webflow (een bron van copy). */
export const FASE_OPTIES = [
  { value: 'idee', label: 'Ik heb een idee', hint: 'Nog geen product of klanten' },
  { value: 'eerste-klanten', label: 'Ik heb eerste klanten', hint: 'Product of pilot draait' },
  { value: 'omzet', label: 'Ik draai omzet', hint: 'Bewezen bedrijf, groeikans onbenut' },
] as const;

export const DOEL_OPTIES = [
  { value: 'bouwen', label: 'Een partner om te bouwen', hint: 'Product, AI, software' },
  { value: 'groeien', label: 'Een partner om te groeien', hint: 'Omzet, funnel, schaal' },
] as const;

export type Aanvraag = {
  idee: string;
  branche: string;
  fase: string;
  doel: string;
  naam: string;
  email: string;
  kvk: string;
};

export const LEGE_AANVRAAG: Aanvraag = {
  idee: '',
  branche: '',
  fase: '',
  doel: '',
  naam: '',
  email: '',
  kvk: '',
};

/* Partner-kanaal (alleen na een ja): voortgang, bewijsmomenten, een lijn
 * naar het team. Mock: het Cargo Donkey-achtige traject als voorbeeld. */
export type PartnerFase = 'kickoff' | 'bouw' | 'livegang' | 'groei';

export const PARTNER_FASEN: ReadonlyArray<{ key: PartnerFase; chip: string }> = [
  { key: 'kickoff', chip: 'Kickoff' },
  { key: 'bouw', chip: 'Bouw' },
  { key: 'livegang', chip: 'Livegang' },
  { key: 'groei', chip: 'Groei' },
] as const;

export const partnerFaseIndex = (f: PartnerFase): number =>
  PARTNER_FASEN.findIndex((x) => x.key === f);

export type Bewijsmoment = {
  datum: string;
  titel: string;
  detail: string;
};

export const PARTNER_MOCK = {
  bedrijf: 'Planningstool voor verladers',
  fase: 'bouw' as PartnerFase,
  omzetdeel: '18%',
  volgende: 'Week 6 · eerste planningsrun met echte orders',
  bewijs: [
    {
      datum: '02-07',
      titel: 'AI-planner v0 draait op testdata',
      detail: '312 ritten herpland, 9% minder lege kilometers dan de handmatige planning.',
    },
    {
      datum: '25-06',
      titel: 'Datamodel bevroren met jullie planner',
      detail: 'Orders, ritten en voertuigen; het rapportagedeel is bewust geparkeerd.',
    },
    {
      datum: '18-06',
      titel: 'Kickoff afgerond, roadmap staat',
      detail: 'Eerste mijlpaal: planning zelf, precies zoals het verdict adviseerde.',
    },
  ] as ReadonlyArray<Bewijsmoment>,
} as const;
