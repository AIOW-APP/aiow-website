import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
// Run after `npm run build` with Node 24; reuses the homepage recovery matrix.
const root=new URL('../../',import.meta.url).pathname;
const out=process.env.HERO_PROOF_OUT || '/tmp/aiow-hero-row-proof';
fs.mkdirSync(out,{recursive:true});
const reserve=net.createServer(); await new Promise(r=>reserve.listen(0,'127.0.0.1',r)); const port=reserve.address().port; await new Promise(r=>reserve.close(r));
const log=fs.openSync(`${out}/server.log`,'w');
const server=spawn('/opt/homebrew/opt/node@24/bin/node',['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:root,stdio:['ignore',log,log]});
async function textGeometry(page) {
 return page.evaluate(()=>{
  const hero=document.querySelector('[data-active-route]'), copy=hero.querySelector('[class*="_copy"]'), h1=hero.querySelector('h1');
  const box=e=>({rect:e.getBoundingClientRect().toJSON(),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollLeft:e.scrollLeft,overflowX:getComputedStyle(e).overflowX,alignSelf:getComputedStyle(e).alignSelf});
  const ancestors=[];for(let e=h1;e;e=e.parentElement)ancestors.push({tag:e.tagName,className:e.className,...box(e)});
  const text=[];const walker=document.createTreeWalker(h1,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const r of range.getClientRects())if(r.width)text.push({text:walker.currentNode.textContent,...r.toJSON()});}
  return {scrollX,document:box(document.documentElement),hero:box(hero),copy:box(copy),h1:box(h1),ancestors,text};
 });
}
function assertText(g,label,issues,width){
 if(g.scrollX!==0||g.ancestors.some(a=>a.scrollLeft!==0))issues.push(`${label}: horizontal scroll`);
 for(const r of g.text){
  if(r.left<-.5||r.right>width+.5)issues.push(`${label}: H1 text viewport clipping ${r.text} [${r.left},${r.right}]`);
  for(const a of g.ancestors)if(['hidden','clip','auto','scroll'].includes(a.overflowX)&&(r.left<a.rect.left-.5||r.right>a.rect.right+.5))issues.push(`${label}: H1 clipped by ${a.tag}`);
 }
 if(g.copy.rect.left<-.5||g.copy.rect.right>width+.5)issues.push(`${label}: copy outside viewport`);
}
let browser; const rows=[]; const issues=[]; const receipt={node:process.version,port,pid:server.pid,headless:true,rows,issues};
try {
 let ready=false; for(let i=0;i<60;i++){if(server.exitCode!==null)throw Error('server exited');try {const r=await fetch(`http://127.0.0.1:${port}`);if(r.status===200){ready=true;break;}}catch{} await new Promise(r=>setTimeout(r,500));} if(!ready)throw Error('server not ready');
 browser=await chromium.launch({headless:true});
 for(const locale of ['nl','en']) for(const theme of ['light','dark']) for(const width of [320,375,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:width>=700?900:844},isMobile:width<700,hasTouch:width<700,deviceScaleFactor:1,colorScheme:theme,reducedMotion:'reduce'});
  const response=await page.goto(`http://127.0.0.1:${port}${locale==='en'?'/en':'/'}`); await page.waitForLoadState('networkidle'); await page.evaluate(()=>document.fonts.ready); await page.waitForFunction(()=>document.querySelector('[data-active-route]')?.dataset.cinema==='settled');
  const data=await page.evaluate(()=>{const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth}};const hero=document.querySelector('[data-active-route]'); return {innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,hero:box(hero),copy:box(hero.querySelector('[class*="_copy"]')),h1:box(hero.querySelector('h1')),h1Count:document.querySelectorAll('h1').length,routes:[...hero.querySelectorAll('a[data-route]')].map(e=>({href:e.getAttribute('href'),...box(e)})),scan:box(hero.querySelector('a[href$="scan"]')),pricingY:document.querySelector('#pricing').getBoundingClientRect().y};});
  Object.assign(data,{locale,theme,width,status:response.status()}); rows.push(data);
  const stem=`${locale}-${theme}-${width}`;
  if(data.innerWidth!==width||data.clientWidth!==width||data.scrollWidth>width) issues.push(`${stem}: viewport/overflow`);
  if(data.h1Count!==1||data.status!==200)issues.push(`${stem}: h1/status`);
  if(data.copy.bottom>data.routes[0].y+1)issues.push(`${stem}: copy/routes overlap ${data.copy.bottom} > ${data.routes[0].y}`);
  for(const [i,r] of [...data.routes,data.scan].entries()) if(r.x<0||r.right>width+1||r.h<44||r.scrollWidth>r.clientWidth+1)issues.push(`${stem}: target ${i} geometry`);
  if(data.scan.y<data.routes.at(-1).bottom-1)issues.push(`${stem}: routes/scan overlap`);
  data.states=[];
  for (const state of ['default','active','focus']) {
   if(state==='active') { await page.locator('[data-active-route] a[data-route="building"]').dispatchEvent('pointerover'); await page.waitForFunction(()=>document.querySelector('[data-active-route]').dataset.activeRoute==='building'); }
   if(state==='focus') { await page.locator('[data-active-route] a[data-route="building"]').focus(); await page.waitForFunction(()=>document.querySelector('[data-active-route]').dataset.activeRoute==='building'); }
   const geometry=await page.evaluate(()=>[...document.querySelectorAll('[data-active-route] a[data-route]')].map(a=>{const short=a.querySelector('[class*="_routeShort"]'); const copy=a.querySelector('[class*="_routeCopy"]');return {route:a.dataset.route,active:a.dataset.active==='true',routeShort:short.getBoundingClientRect().toJSON(),routeCopy:copy.getBoundingClientRect().toJSON(),fontSize:getComputedStyle(short).fontSize};}));
   const text=await textGeometry(page); assertText(text,`${stem}/${state}`,issues,width); data.states.push({state,geometry,text});
   const gap=4;
   for(const row of geometry) if(!(row.routeShort.right + gap <= row.routeCopy.left)) issues.push(`${stem}/${state}/${row.route}: routeShort.right ${row.routeShort.right} + gap ${gap} > routeCopy.left ${row.routeCopy.left}`);
   await page.screenshot({path:`${out}/${stem}-${state}.png`});
  }
  await page.screenshot({path:`${out}/${stem}-viewport.png`}); await page.screenshot({path:`${out}/${stem}-full.png`,fullPage:true});
  data.interactions=[]; for(const a of await page.locator('[data-active-route] a').all()){for(const action of ['scrollIntoView','trial','focus']){if(action==='scrollIntoView')await a.scrollIntoViewIfNeeded();if(action==='trial')await a.click({trial:true,timeout:5000});if(action==='focus')await a.focus();const text=await textGeometry(page);data.interactions.push({href:await a.getAttribute('href'),action,text});assertText(text,`${stem}/${action}`,issues,width);}}
  await page.close(); console.log(stem,JSON.stringify({overflow:data.scrollWidth>width,copyBottom:data.copy.bottom,routeTop:data.routes[0].y,scanY:data.scan.y,pricingY:data.pricingY}));
 }
}catch(e){issues.push(String(e));}finally{if(browser)await browser.close();server.kill('SIGTERM');await Promise.race([new Promise(r=>server.once('exit',r)),new Promise(r=>setTimeout(r,5000))]);receipt.serverExit=server.exitCode;receipt.serverSignal=server.signalCode;try{await fetch(`http://127.0.0.1:${port}`);receipt.portClosed=false;issues.push('owned server port still open');}catch{receipt.portClosed=true;}}
receipt.assertion='routeShort.right + 4 <= routeCopy.left';receipt.expectedStates=60;receipt.stateCount=rows.reduce((n,row)=>n+(row.states?.length||0),0);receipt.expectedRows=20;receipt.count=rows.length;receipt.pass=rows.length===20&&receipt.stateCount===60&&issues.length===0;fs.writeFileSync(`${out}/receipt.json`,JSON.stringify(receipt,null,2));console.log(JSON.stringify({pass:receipt.pass,count:rows.length,issues,portClosed:receipt.portClosed}));process.exitCode=receipt.pass?0:1;
