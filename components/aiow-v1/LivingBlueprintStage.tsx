"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "./LivingBlueprintHomepage.module.css";

type Mode = "process" | "building" | "home";
type Locale = "nl" | "en";
type World = Readonly<{ tab:string; eyebrow:string; title:string; body:string; state:string; nodes:readonly [string,string,string,string,string,string] }>;

const worlds:Record<Locale,Record<Mode,World>>={
 nl:{
  process:{tab:"Proces",eyebrow:"Werkprocessen",title:"Van aanvraag naar gecontroleerde uitvoering.",body:"AI ordent, controleert en bereidt voor. Uw medewerker bepaalt wat verdergaat; AIOW houdt de route werkend.",state:"Medewerker beslist",nodes:["Aanvraag","Uw regel","AI-voorstel","Menselijk akkoord","Taak gestart","AIOW beheert"]},
  building:{tab:"Pand",eyebrow:"Bedrijfspanden",title:"Van gebouwsignaal naar een taak met eigenaar.",body:"Afwijkingen krijgen context en een duidelijke route. Uw beheerder kiest; bevoegde partners voeren het fysieke werk uit.",state:"Beheerder beslist",nodes:["Gebouwsignaal","Drempel","Actievoorstel","Menselijk akkoord","Taak of partner","AIOW beheert"]},
  home:{tab:"Woning & leven",eyebrow:"Woning en privéleven",title:"Van losse systemen naar begrijpelijke leefregels.",body:"Woning, informatie en privéprocessen werken samen rond uw voorkeuren. U kunt bevestigen, wijzigen of stoppen.",state:"Bewoner beslist",nodes:["Uw verzoek","Huisregel","AI-voorstel","Menselijk akkoord","Woonactie","AIOW beheert"]}},
 en:{
  process:{tab:"Process",eyebrow:"Work processes",title:"From incoming request to controlled execution.",body:"AI organises, checks and prepares. Your colleague decides what proceeds; AIOW keeps the route working.",state:"A colleague decides",nodes:["Request","Your rule","AI proposal","Human approval","Task started","AIOW manages"]},
  building:{tab:"Property",eyebrow:"Commercial property",title:"From building signal to an owned action.",body:"Deviations receive context and a clear route. Your operator chooses; qualified partners carry out physical work.",state:"The operator decides",nodes:["Building signal","Threshold","Action proposal","Human approval","Task or partner","AIOW manages"]},
  home:{tab:"Home & life",eyebrow:"Home and private life",title:"From separate systems to understandable living rules.",body:"Home, information and private workflows work around your preferences. You can confirm, change or stop.",state:"The resident decides",nodes:["Your request","House rule","AI proposal","Human approval","Home action","AIOW manages"]}}
};
const order:readonly Mode[]=["process","building","home"];

function WorldMark({mode}:{mode:Mode}){
 if(mode==="building")return <svg viewBox="0 0 120 120" aria-hidden="true"><path d="M13 105V49h34v56M55 105V18h52v87M25 66h12M25 82h12M69 38h24M69 57h24M69 76h24"/><circle cx="80" cy="92" r="8"/></svg>;
 if(mode==="home")return <svg viewBox="0 0 120 120" aria-hidden="true"><path d="M12 59 60 19l48 40v46H12zM30 102V68h27v34M73 58h21v28H73z"/><circle cx="83" cy="95" r="8"/></svg>;
 return <svg viewBox="0 0 120 120" aria-hidden="true"><path d="M12 91h25V67h24V43h45M18 28h30v17H18zM70 76h34v24H70z"/><circle cx="37" cy="91" r="6"/><circle cx="61" cy="67" r="6"/></svg>;
}

export function LivingBlueprintStage({locale="nl"}:{locale?:Locale}){
 const[mode,setMode]=useState<Mode>("process");const world=worlds[locale][mode];
 function onTabsKeyDown(event:KeyboardEvent<HTMLDivElement>){if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();const current=order.indexOf(mode);const next=event.key==="Home"?0:event.key==="End"?order.length-1:event.key==="ArrowRight"?(current+1)%order.length:(current-1+order.length)%order.length;const nextMode=order[next];setMode(nextMode);requestAnimationFrame(()=>document.getElementById(`world-tab-${nextMode}`)?.focus())}
 return <section className={styles.blueprint} aria-labelledby="blueprint-title">
  <div className={styles.modebar} role="tablist" aria-label={locale==="en"?"Choose where AIOW should work":"Kies waar AIOW moet werken"} onKeyDown={onTabsKeyDown}>{order.map(item=><button id={`world-tab-${item}`} key={item} type="button" role="tab" aria-selected={mode===item} aria-controls="blueprint-panel" tabIndex={mode===item?0:-1} onClick={()=>setMode(item)}>{worlds[locale][item].tab}</button>)}</div>
  <div id="blueprint-panel" role="tabpanel" aria-labelledby={`world-tab-${mode}`} className={styles.blueprintPanel} data-world={mode} key={mode}>
   <div className={styles.worldScene} aria-hidden="true"><span/><span/><span/><WorldMark mode={mode}/></div>
   <p className={styles.blueprintLabel}>{locale==="en"?"Public reference architecture · not a customer case":"Publieke referentiearchitectuur · geen klantcase"}</p>
   <div className={styles.worldCopy}><p>{world.eyebrow}</p><h2 id="blueprint-title">{world.title}</h2><span>{world.body}</span></div>
   <div className={styles.signalRail} aria-hidden="true"><i/></div>
   <ol className={styles.blueprintNodes} aria-label={locale==="en"?"AIOW system route":"AIOW-systeemroute"}>{world.nodes.map((node,index)=><li key={node} data-human={index===3?"true":undefined}><span>0{index+1}</span><i aria-hidden="true"/><b>{node}</b></li>)}</ol>
   <p className={styles.authorityState}>{world.state}</p>
  </div>
 </section>
}
