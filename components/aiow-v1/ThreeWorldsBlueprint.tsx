import Link from "next/link";
import styles from "./ThreeWorldsBlueprint.module.css";

type Locale = "nl" | "en";

const content = {
  nl: {
    proof: "Schematische weergave · niet op schaal · geen klantsituatie",
    aria: "Werk, bedrijfspand en woning verbonden met één door de klant bepaalde AIOW-leiding",
    authority: "U bepaalt",
    categories: [
      { index: "01", title: "Werk", body: "Processen, websites, apps en koppelingen.", href: "/ai-automatisering" },
      { index: "02", title: "Bedrijfspanden", body: "Energie, klimaat, toegang, veiligheid en onderhoud.", href: "/smart-office" },
      { index: "03", title: "Woningen & villa’s", body: "Comfort, licht, klimaat, energie en veiligheid.", href: "/home" },
    ],
  },
  en: {
    proof: "Schematic view · not to scale · not a customer case",
    aria: "Work, commercial building and home connected by one customer-controlled AIOW conductor",
    authority: "You decide",
    categories: [
      { index: "01", title: "Work", body: "Processes, websites, apps and integrations.", href: "/en/ai-automation" },
      { index: "02", title: "Commercial buildings", body: "Energy, climate, access, safety and maintenance.", href: "/en/smart-office" },
      { index: "03", title: "Homes & villas", body: "Comfort, lighting, climate, energy and safety.", href: "/en/home" },
    ],
  },
} as const;

function ArchitecturalSections() {
  return <svg className={styles.drawing} viewBox="0 0 960 430" aria-hidden="true" focusable="false">
    <path className={styles.ground} d="M25 327H935" />

    <g className={`${styles.scene} ${styles.work}`}>
      <path className={styles.structure} d="M56 326V128H300V326M76 158H280M76 307H280" />
      <path className={styles.fill} d="M76 158H280V307H76z" />
      <path className={styles.detail} d="M103 249h132v12H103zm18 12v46m95-46v46M144 190h83v50h-83zM185 240v9M161 249h48M98 206h28v43H98z" />
      <path className={styles.screen} d="M156 207h15l8 8 13-17 13 9h10" />
      <circle className={styles.endpoint} cx="227" cy="190" r="6" />
      <path className={styles.riser} d="M227 327V190" pathLength="1" />
    </g>

    <g className={`${styles.scene} ${styles.building}`}>
      <path className={styles.structure} d="M349 327V77H607V327M349 116H607M349 170H607M349 224H607M349 278H607" />
      <path className={styles.fill} d="M350 78H606V326H350z" />
      <path className={styles.detail} d="M376 93h43v15h-43zm55 0h43v15h-43zm55 0h43v15h-43zm55 0h39v15h-39zM375 131h44v25h-44zm56 0h43v25h-43zm55 0h43v25h-43zm55 0h39v25h-39zM375 185h44v25h-44zm56 0h43v25h-43zm55 0h43v25h-43zm55 0h39v25h-39zM375 239h44v25h-44zm56 0h43v25h-43zm55 0h43v25h-43zm55 0h39v25h-39zM375 293h44v34h-44m162-34h43v34h-43M455 327v-34h50v34M368 66h61l11-17h78l11 17h61M461 49V31h48v18" />
      <path className={styles.solar} d="M375 66l14-29h42l-12 29m24 0 10-29h42l-8 29m22 0 5-29h42l-3 29" />
      <circle className={styles.endpoint} cx="485" cy="49" r="6" />
      <path className={styles.riser} d="M485 327V49" pathLength="1" />
    </g>

    <g className={`${styles.scene} ${styles.home}`}>
      <path className={styles.structure} d="M661 326V179l119-95 133 95v147M642 184L780 67l151 117M697 326V218h170v108" />
      <path className={styles.fill} d="M662 180l118-95 132 95v146H662z" />
      <path className={styles.detail} d="M714 233h52v55h-52zm84 0h51v55h-51M769 326v-91h29v91M735 121v-35h20v20M703 196h167M681 310h211M882 151v-55h22v74M899 326v-43m-17 0h34" />
      <path className={styles.lamp} d="M823 196v15m-10 0h20l-5 10h-10z" />
      <circle className={styles.endpoint} cx="823" cy="221" r="6" />
      <path className={styles.riser} d="M823 327V221" pathLength="1" />
    </g>

    <path className={styles.conductorBase} d="M91 352H869" />
    <path className={styles.conductor} data-aiow-conductor="true" d="M91 352H869" pathLength="1" />
    <circle className={styles.switchHousing} cx="480" cy="352" r="24" />
    <path className={styles.switchBlade} data-authority-switch="true" d="M469 362l21-21" />
    <circle className={styles.switchContact} cx="467" cy="364" r="4" />
    <circle className={styles.switchContact} cx="493" cy="338" r="4" />
  </svg>;
}

export function ThreeWorldsBlueprint({ locale = "nl" }: { locale?: Locale }) {
  const c = content[locale];
  return <section className={styles.world} aria-label={c.aria}>
    <ArchitecturalSections />
    <span className={styles.authority}>{c.authority}</span>
    <nav className={styles.categories} aria-label={locale === "en" ? "Three AIOW categories" : "Drie AIOW-categorieën"}>
      {c.categories.map((item) => <Link href={item.href} key={item.title} className={styles.category}>
        <span>{item.index}</span><strong>{item.title}</strong><small>{item.body}</small>
      </Link>)}
    </nav>
    <p className={styles.proof}>{c.proof}</p>
  </section>;
}
