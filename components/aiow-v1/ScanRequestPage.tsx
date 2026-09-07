"use client";

import { useRouter } from "next/navigation";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import type { ScanSubject } from "@/lib/aiow-v1/scan-intent";
import { BookingModal } from "./BookingModal";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import shell from "./HumanIndustrialPublicShell.module.css";
import styles from "./ScanRequestPage.module.css";

export function ScanRequestPage({ locale="nl", initialSubject="bedrijf", returnTo }:{ locale?:AiowLocale; initialSubject?:ScanSubject; returnTo?:string }){
  const router=useRouter();const en=locale==="en";
  return <div className={`${shell.site} ${styles.site}`}>
    <PublicHeader locale={locale} variant="human-industrial"/>
    <main className={styles.canvas}><p>{en?"Bounded first step":"Begrensde eerste stap"}</p><h1>{en?"Request a practical AI scan.":"Vraag een praktische AI-scan aan."}</h1><span>{en?"Your preferred date and time require separate human confirmation.":"Uw voorkeursdatum en tijd vereisen afzonderlijke menselijke bevestiging."}</span></main>
    <PublicFooter locale={locale} showYear/>
    <BookingModal open locale={locale} initialSubject={initialSubject} onClose={()=>router.push(returnTo||(en?"/en/capabilities":"/mogelijkheden"))}/>
  </div>;
}
