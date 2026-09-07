const { webkit } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base=process.env.AIOW_PROOF_BASE||"http://127.0.0.1:3112";
const out=path.resolve(process.env.AIOW_PROOF_DIR||".team-handsome/AIOW-BRAND-SURFACES-20260907/60-browser-proof");
await mkdir(out,{recursive:true});
function pngSize(bytes){if(bytes.length<24||bytes.subarray(1,4).toString()!=="PNG")throw new Error("invalid PNG");return{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};}
async function image(route,expected){const response=await fetch(new URL(route,base));if(!response.ok)throw new Error(`${route} HTTP ${response.status}`);if(!/^image\/(png|svg\+xml)/.test(response.headers.get("content-type")||""))throw new Error(`${route} content-type`);const bytes=Buffer.from(await response.arrayBuffer());const minimum=expected?1000:300;if(bytes.length<minimum)throw new Error(`${route} too small`);if(expected){const size=pngSize(bytes);if(size.width!==expected.width||size.height!==expected.height)throw new Error(`${route} ${JSON.stringify(size)}`);}return{bytes,contentType:response.headers.get("content-type")};}
const og=await image("/opengraph-image?v=human-industrial-20260907",{width:1200,height:630});
const apple=await image("/apple-icon",{width:180,height:180});
const icon=await image("/icon.svg");
const iconText=icon.bytes.toString("utf8");
if(/\srx=/.test(iconText)||!["#11110f","#d94b30","#f5f4ee"].every(v=>iconText.includes(v)))throw new Error("icon contract");
await writeFile(path.join(out,"opengraph.png"),og.bytes);await writeFile(path.join(out,"apple-icon.png"),apple.bytes);await writeFile(path.join(out,"icon.svg"),icon.bytes);
const browser=await webkit.launch({headless:true});const page=await browser.newPage({viewport:{width:1200,height:630}});const response=await page.goto(new URL("/",base).href,{waitUntil:"load",timeout:60000});if(!response?.ok())throw new Error(`home HTTP ${response?.status()||0}`);
const meta=await page.evaluate(()=>Object.fromEntries(["og:image","og:image:width","og:image:height","og:image:alt","twitter:card","twitter:image"].map(k=>[k,document.querySelector(`meta[property="${k}"],meta[name="${k}"]`)?.content||null])));
const expectedImage="https://aiow.ai/opengraph-image?v=human-industrial-20260907";
if(meta["og:image"]!==expectedImage||meta["twitter:image"]!==expectedImage||meta["og:image:width"]!=="1200"||meta["og:image:height"]!=="630"||meta["twitter:card"]!=="summary_large_image"||!/AI op maat/.test(meta["og:image:alt"]||""))throw new Error(`metadata ${JSON.stringify(meta)}`);
await browser.close();const receipt={base,og:{...pngSize(og.bytes),bytes:og.bytes.length,contentType:og.contentType},apple:{...pngSize(apple.bytes),bytes:apple.bytes.length,contentType:apple.contentType},icon:{bytes:icon.bytes.length,contentType:icon.contentType},meta};await writeFile(path.join(out,"brand-surfaces-proof.json"),JSON.stringify(receipt,null,2));console.log(`AIOW_BRAND_SURFACES_PASS og=${receipt.og.width}x${receipt.og.height} apple=${receipt.apple.width}x${receipt.apple.height}`);
