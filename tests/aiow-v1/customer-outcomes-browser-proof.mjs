import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.AIOW_PROOF_BASE;
assert.ok(base && new URL(base).hostname==='127.0.0.1','loopback only');
const out=process.env.AIOW_PROOF_DIR || '.team-handsome/customer-outcomes-20260908';
await mkdir(out,{recursive:true});
const receipt={base,buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),engine:'WebKit headless',views:[],noJs:[]};
const browser=await webkit.launch({headless:true});
const {default:sharp}=await import('sharp');
async function captureSection(page, locator, file) {
 await page.evaluate(()=>window.scrollTo(0,0));
 const box=await locator.boundingBox();
 const image=await page.screenshot({fullPage:true});
 await sharp(image).extract({left:Math.round(box.x),top:Math.round(box.y),width:Math.round(box.width),height:Math.round(box.height)}).toFile(file);
}
try {
for(const locale of ['nl','en']) for(const theme of ['light','dark']) for(const width of [320,375,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:width>=768?1000:844},colorScheme:theme,reducedMotion:'reduce'});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 assert.ok((await page.goto(base+(locale==='en'?'/en':'/'))).ok());
 await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
 const section=page.locator('[data-customer-outcomes]'),memo=page.locator('[data-example-memo]');
 assert.equal(await section.count(),1);assert.equal(await section.locator('[data-outcome]').count(),3);assert.equal(await page.locator('h1').count(),1);
 await section.scrollIntoViewIfNeeded();
 const prefix=`${locale}-${theme}-${width}`;
 await captureSection(page,section,`${out}/${prefix}-closed.png`);
 const summary=memo.locator('summary');await summary.focus();await page.keyboard.press('Enter');
 assert.equal(await memo.locator('details').getAttribute('open'),'');
 assert.equal(await memo.locator('dt').count(),6);
 const geometry=await page.evaluate(()=>{
  const s=document.querySelector('[data-customer-outcomes]');const r=s.getBoundingClientRect();
  const bad=[...s.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect();return b.width && (b.left<-.5||b.right>innerWidth+.5)}).map(e=>e.tagName);
  const summary=s.querySelector('summary').getBoundingClientRect();
  return {viewport:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,section:r.toJSON(),bad,summary:summary.toJSON(),theme:document.documentElement.dataset.theme};
 });
 assert.equal(geometry.viewport,width);assert.equal(geometry.overflow,0);assert.deepEqual(geometry.bad,[]);assert.ok(geometry.summary.height>=44);
 await captureSection(page,section,`${out}/${prefix}-open.png`);
 await page.keyboard.press('Enter');assert.equal(await memo.locator('details').getAttribute('open'),null);
 assert.deepEqual(errors,[]);receipt.views.push({locale,theme,width,geometry,errors});
 await writeFile(`${out}/browser-proof.json`,JSON.stringify(receipt,null,2));await context.close();
}
for(const locale of ['nl','en']) for(const theme of ['light','dark']) {
 const context=await browser.newContext({viewport:{width:320,height:844},javaScriptEnabled:false,colorScheme:theme}); const page=await context.newPage();
 assert.ok((await page.goto(base+(locale==='en'?'/en':'/'))).ok()); const memo=page.locator('[data-example-memo]');
 await memo.locator('summary').click();assert.equal(await memo.locator('details').getAttribute('open'),'');
 assert.equal(await memo.locator('dt').count(),6);assert.ok(await page.locator('a[href="mailto:info@aiow.io"]').count());
 assert.equal(await page.locator('a[href^="tel:"]').count(),0);
 await captureSection(page,memo,`${out}/${locale}-${theme}-nojs.png`);receipt.noJs.push({locale,theme,opened:true});await context.close();
}
assert.equal(receipt.views.length,24);assert.equal(receipt.noJs.length,4);
await writeFile(`${out}/browser-proof.json`,JSON.stringify(receipt,null,2));console.log(JSON.stringify({views:receipt.views.length,noJs:receipt.noJs.length,overflow:0,buildId:receipt.buildId}));
} finally {await browser.close();}
