import { webkit } from "/opt/homebrew/lib/node_modules/playwright/index.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.AIOW_PROOF_BASE || "http://127.0.0.1:4321";
const out = process.env.AIOW_PROOF_DIR || ".team-handsome/AIOW-TW-RESET-20260905/50-proof";
const viewports = [
  { width: 320, height: 844 }, { width: 375, height: 844 }, { width: 390, height: 844 },
  { width: 768, height: 900 }, { width: 1024, height: 900 }, { width: 1440, height: 900 },
];
await mkdir(out, { recursive: true });
const browser = await webkit.launch({ headless: true });
const receipt = { base, generatedAt: new Date().toISOString(), views: [], noJavaScript: [] };

async function inspect(page, viewport, theme) {
  const result = await page.evaluate(() => {
    const rect = (node) => { const r=node.getBoundingClientRect(); return { top:Math.round(r.top), bottom:Math.round(r.bottom), width:Math.round(r.width), height:Math.round(r.height) }; };
    const categories=[...document.querySelectorAll('nav[aria-label="Drie AIOW-categorieën"] a')];
    const cta=[...document.querySelectorAll('a')].find((node)=>node.textContent.trim()==="Laat één proces of ruimte scannen");
    const conductor=document.querySelector('[data-aiow-conductor="true"]');
    const commercialActions=[...document.querySelectorAll('a[href="/scan"]')].map(rect).filter((box)=>box.width>0&&box.height>0&&box.top<innerHeight);
    return {
      h1Count:document.querySelectorAll("h1").length,
      categoryCount:categories.length,
      categoryLabels:categories.map((node)=>node.querySelector("strong")?.textContent?.trim()),
      categoryRects:categories.map(rect),
      ctaRect:rect(cta),
      commercialActions,
      heroRect:rect(document.querySelector("#oplossingen")),
      heroMedia:document.querySelectorAll("#oplossingen img,#oplossingen video").length,
      overflow:document.documentElement.scrollWidth-innerWidth,
      conductor:{animation:getComputedStyle(conductor).animationName,offset:getComputedStyle(conductor).strokeDashoffset},
    };
  });
  if(result.h1Count!==1) throw new Error(`${viewport.width}/${theme}: H1=${result.h1Count}`);
  if(result.categoryCount!==3) throw new Error(`${viewport.width}/${theme}: categories=${result.categoryCount}`);
  if(result.categoryLabels.join("|")!=="Werk|Bedrijfspanden|Woningen & villa’s") throw new Error(`${viewport.width}/${theme}: labels=${result.categoryLabels.join("|")}`);
  if(result.heroMedia!==0) throw new Error(`${viewport.width}/${theme}: hero media=${result.heroMedia}`);
  if(result.overflow>1) throw new Error(`${viewport.width}/${theme}: overflow=${result.overflow}`);
  if(result.commercialActions.length!==1) throw new Error(`${viewport.width}/${theme}: first-viewport scan actions=${result.commercialActions.length}`);
  for(const target of [...result.categoryRects,result.ctaRect]) if(target.width<44||target.height<44) throw new Error(`${viewport.width}/${theme}: target=${JSON.stringify(target)}`);
  if(viewport.width<=390 && Math.max(...result.categoryRects.map((r)=>r.bottom))>viewport.height) throw new Error(`${viewport.width}/${theme}: category ledger below fold ${JSON.stringify(result.categoryRects)}`);
  return result;
}

try {
  for(const viewport of viewports){
    for(const theme of ["light","dark"]){
      const page=await browser.newPage({viewport,colorScheme:theme,reducedMotion:"reduce"});
      await page.goto(base,{waitUntil:"networkidle"});
      await page.evaluate((value)=>{localStorage.setItem("aiow-theme",value);document.documentElement.dataset.theme=value;},theme);
      const result=await inspect(page,viewport,theme);
      const file=path.resolve(out,`home-${viewport.width}x${viewport.height}-${theme}.png`);
      await page.screenshot({path:file,fullPage:false});
      receipt.views.push({viewport,theme,file,...result});
      await page.close();
    }
  }
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    const context=await browser.newContext({viewport,javaScriptEnabled:false,colorScheme:"light",reducedMotion:"reduce"});
    const page=await context.newPage();
    const response=await page.goto(base,{waitUntil:"load"});
    const result=await inspect(page,viewport,"no-js");
    const file=path.resolve(out,`home-${viewport.width}x${viewport.height}-no-js.png`);
    await page.screenshot({path:file,fullPage:false});
    receipt.noJavaScript.push({viewport,status:response?.status(),file,...result});
    await context.close();
  }
  const receiptPath=path.resolve(out,"browser-proof.json");
  await writeFile(receiptPath,JSON.stringify(receipt,null,2));
  console.log(`AIOW_VISUAL_PROOF_PASS views=${receipt.views.length} no_js=${receipt.noJavaScript.length} receipt=${receiptPath}`);
} finally { await browser.close(); }
