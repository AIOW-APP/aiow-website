import Link from "next/link";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { AIOW_COMPANY } from "@/lib/aiow-v1/company.mjs";
import styles from "./AiowV1Homepage.module.css";

export function PublicFooter({ locale = "nl", showYear = false }: { locale?: AiowLocale; showYear?: boolean }) {
  const en = locale === "en";
  return <footer className={styles.footer}>
    <Link href={en ? "/en" : "/"} className={styles.logo}><span>AIOW</span><i /></Link>
    <p>{AIOW_COMPANY.alternateName}{showYear ? ` · ${new Date().getFullYear()}` : ""}<br />{AIOW_COMPANY.streetAddress} · {AIOW_COMPANY.postalCode} {AIOW_COMPANY.locality} · KvK {AIOW_COMPANY.chamberOfCommerce}</p>
    <div><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Rates" : "Tarieven"}</Link><Link href={en ? "/en/knowledge" : "/nl/kennis"}>{en ? "Knowledge" : "Kennis"}</Link><Link href={en ? "/en/company" : "/bedrijfsgegevens"}>{en ? "Company & contact" : "Bedrijf & contact"}</Link><Link href={en ? "/en/privacy" : "/privacy"}>Privacy</Link><Link href={en ? "/en/ventures" : "/ventures"}>Ventures</Link><a href={`mailto:${AIOW_COMPANY.publicEmail}`}>{AIOW_COMPANY.publicEmail}</a><a href="/llms.txt">llms.txt</a></div>
  </footer>;
}
