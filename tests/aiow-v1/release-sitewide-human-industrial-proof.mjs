const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base=process.env.AIOW_PROOF_BASE||"http://127.0.0.1:3111";
const out=path.resolve(process.env.AIOW_PROOF_DIR||".team-handsome/AIOW-SITEWIDE-HUMAN-INDUSTRIAL-20260907/50-proof");
await mkdir(out,{recursive:true});
const xml=await (await fetch(new URL('/sitemap.xml',base))).text();
const sitemapRoutes=[...xml.matchAll(/<loc>https:\/\/aiow\.ai([^<]*)<\/loc>/g)].map(m=>m[1]||'/').filter(p=>!p.startsWith('/portal')&&!p.startsWith('/legacy-aiow'));
const routes=[...new Set([...sitemapRoutes,'/portal','/portal/project/not-found'])];
const expected={light:{bg:'rgb(228, 229, 224)',accent:'#d94b30'},dark:{bg:'rgb(23, 56, 46)',accent:'#f56a4d'}};
const viewports=[{width:390,height:844},{width:1440,height:900}];
const receipt={base,routes,views:[],intermediate:[],noJs:[]};
const browser=await webkit.launch({headless:true});
const representative=['/ai-automatisering','/mogelijkheden','/tarieven','/tarieven/accountants','/nl/kennis','/bedrijfsgegevens','/privacy','/ventures','/scan?intent=proces'];
function safeName(v){return v.replace(/^\//,'').replace(/[^a-z0-9]+/gi,'-')||'home'}
async function inspect(page,route,viewport,theme){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL(route,base).href,{waitUntil:'domcontentloaded',timeout:60000});
 await page.evaluate(v=>document.documentElement.setAttribute('data-theme',v),theme);
 await page.waitForTimeout(80);
 const state=await page.evaluate(()=>{const header=document.querySelector('header[data-variant]');const root=header?.parentElement||document.querySelector('[class*="HumanIndustrialPublicShell_site"]')||document.body;const h1=document.querySelector('h1');const style=getComputedStyle(root);return{title:document.title,h1:h1?.textContent?.replace(/\s+/g,' ').trim(),h1Rect:h1?.getBoundingClientRect().toJSON(),h1Overflow:h1?Math.max(0,h1.scrollWidth-h1.clientWidth):null,h1Font:h1?getComputedStyle(h1).fontFamily:null,rootBg:style.backgroundColor,accent:style.getPropertyValue('--copper').trim(),overflow:document.documentElement.scrollWidth-innerWidth,headerVariant:header?.getAttribute('data-variant'),headerBottom:header?.getBoundingClientRect().bottom,firstContentTop:document.querySelector('main')?.getBoundingClientRect().top,dialogs:document.querySelectorAll('[role="dialog"]').length};});
 if(errors.length)throw new Error(`${route}/${viewport.width}/${theme}: ${errors.join(' | ')}`);
 if(!state.h1)throw new Error(`${route}/${viewport.width}/${theme}: missing H1`);
 if(state.overflow>0.5||state.h1Overflow>1.5)throw new Error(`${route}/${viewport.width}/${theme}: overflow doc=${state.overflow} h1=${state.h1Overflow}`);
 if(!route.startsWith('/portal')&&state.headerVariant!=='human-industrial')throw new Error(`${route}/${viewport.width}/${theme}: header=${state.headerVariant}`);
 if(/Fraunces|Georgia/i.test(state.h1Font||''))throw new Error(`${route}/${viewport.width}/${theme}: legacy font=${state.h1Font}`);
 if(state.rootBg!==expected[theme].bg||state.accent!==expected[theme].accent)throw new Error(`${route}/${viewport.width}/${theme}: colors ${state.rootBg}/${state.accent}`);
 if(state.h1Rect.x<-.5||state.h1Rect.x+state.h1Rect.width>viewport.width+.5)throw new Error(`${route}/${viewport.width}/${theme}: H1 bounds`);
 return state;
}
for(const route of routes)for(const viewport of viewports)for(const theme of ['light','dark']){
 const c=await browser.newContext({viewport,colorScheme:theme});const p=await c.newPage();const state=await inspect(p,route,viewport,theme);receipt.views.push({route,viewport,theme,state});
 if(theme==='light'&&representative.includes(route))await p.screenshot({path:path.join(out,`${safeName(route)}-${viewport.width}.png`)});
 await c.close();
}
for(const route of representative.filter(r=>routes.includes(r.split('?')[0])||r.startsWith('/scan')))for(const viewport of [{width:320,height:844},{width:768,height:1024},{width:1024,height:900}]){
 const c=await browser.newContext({viewport});const p=await c.newPage();const state=await inspect(p,route,viewport,'light');receipt.intermediate.push({route,viewport,state});await c.close();
}
for(const route of routes){const c=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const p=await c.newPage();await p.goto(new URL(route,base).href,{waitUntil:'domcontentloaded',timeout:60000});const state=await p.evaluate(()=>({h1:document.querySelector('h1')?.textContent?.trim(),overflow:document.documentElement.scrollWidth-innerWidth,bg:getComputedStyle(document.body.firstElementChild||document.body).backgroundColor}));if(!state.h1||state.overflow>.5)throw new Error(`${route}/no-js failed`);receipt.noJs.push({route,state});await c.close();}
await browser.close();
await writeFile(path.join(out,'sitewide-proof.json'),JSON.stringify(receipt,null,2));
console.log(`AIOW_SITEWIDE_HI_PASS routes=${routes.length} views=${receipt.views.length} intermediate=${receipt.intermediate.length} no_js=${receipt.noJs.length}`);
