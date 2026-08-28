import Link from "next/link";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import styles from "./AiowV1Homepage.module.css";

export function PublicFooter({ locale = "nl", showYear = false }: { locale?: AiowLocale; showYear?: boolean }) {
  const en = locale === "en";
  return <footer className={styles.footer}>
    <Link href={en ? "/en" : "/"} className={styles.logo}><span>AIOW</span><i /></Link>
    <p>AI Operating Workflows{showYear ? ` · ${new Date().getFullYear()}` : ""}</p>
    <div><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Rates" : "Tarieven"}</Link><Link href={en ? "/en/privacy" : "/privacy"}>Privacy</Link><a href="/llms.txt">llms.txt</a></div>
  </footer>;
}
