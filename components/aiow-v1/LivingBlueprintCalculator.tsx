"use client";

import { useRef, useState, type MouseEvent } from "react";
import { track } from "@/core/analytics/client";
import { PriceCalculator } from "./PriceCalculator";
import { QuoteModal, type CalculatorQuoteConfig } from "./QuoteModal";
import styles from "./LivingBlueprintHomepage.module.css";

export function LivingBlueprintCalculator({locale="nl"}:{locale?:"nl"|"en"}){
 const[quote,setQuote]=useState<CalculatorQuoteConfig|null>(null);const quoteTrigger=useRef<HTMLElement|null>(null);
 function openQuote(event:MouseEvent<HTMLButtonElement>,configuration:CalculatorQuoteConfig){quoteTrigger.current=event.currentTarget;void track("quote_opened",{});setQuote(configuration)}
 return <><div className={styles.calculatorShell} data-premium-instrument="calculator"><div className={styles.calculatorPlate} aria-hidden="true"><span>{locale==="en"?"Public price basis":"Publieke prijsbasis"}</span><i/><span>AIOW / 01</span></div><PriceCalculator locale={locale} onQuote={openQuote}/></div><QuoteModal open={quote!==null} onClose={()=>setQuote(null)} locale={locale} returnFocus={quoteTrigger.current} calculatorConfig={quote}/></>
}
