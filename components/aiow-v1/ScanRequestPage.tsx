"use client";

import { useRouter } from "next/navigation";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { BookingModal } from "./BookingModal";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import styles from "./ScanRequestPage.module.css";

export function ScanRequestPage({ locale="nl" }:{ locale?:AiowLocale }){
  const router=useRouter();const en=locale==="en";
  return <div className={styles.site}>
    <PublicHeader locale={locale}/>
    <main className={styles.canvas}><p>{en?"Bounded first step":"Begrensde eerste stap"}</p><h1>{en?"Request a practical AI scan.":"Vraag een praktische AI-scan aan."}</h1><span>{en?"Your preferred date and time require separate human confirmation.":"Uw voorkeursdatum en tijd vereisen afzonderlijke menselijke bevestiging."}</span></main>
    <PublicFooter locale={locale} showYear/>
    <BookingModal open locale={locale} onClose={()=>router.push(en?"/en/capabilities":"/mogelijkheden")}/>
  </div>;
}
