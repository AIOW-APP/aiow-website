import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const read=(path)=>readFile(new URL(path,root),"utf8");
const [og,icon,apple,seo,dna,core]=await Promise.all([
  read("app/opengraph-image.tsx"),read("app/icon.svg"),read("app/apple-icon.tsx"),read("lib/aiow-v1/seo.tsx"),read("DESIGN-DNA.md"),read("core/seo/og-image.tsx"),
]);

test("AIOW social card uses Human Industrial rather than generic multi-brand OG",()=>{
  assert.doesNotMatch(og,/core\/seo\/og-image|Warm Precision|#00D9FF|radial-gradient|glow/i);
  for(const marker of["AI OP MAAT","VOOR BEDRIJF","BEDRIJFSPAND","EN WONING","DRIE OMGEVINGEN","EEN MENS BESLIST. ALTIJD.","#E4E5E0","#11110F","#D94B30"])assert.ok(og.includes(marker),marker);
  assert.match(og,/width: 1200, height: 630/);
  assert.match(og,/padding: "54px 50px 46px"/);
  assert.match(dna,/Open Graph \/ WhatsApp \/ LinkedIn \/ X/);
  assert.match(core,/#00D9FF/,"generic helper remains unchanged for other brands");
});

test("social metadata is localized and cache-busts the old WhatsApp image URL",()=>{
  assert.match(seo,/opengraph-image\?v=human-industrial-20260907/);
  assert.match(seo,/AI op maat voor bedrijf, bedrijfspand en woning/);
  assert.match(seo,/Bespoke AI for company, commercial building and home/);
  assert.match(seo,/width: 1200, height: 630/);
  assert.match(seo,/summary_large_image/);
  assert.doesNotMatch(seo,/Working AI, precisely installed/);
});

test("browser and Apple icons use the aperture glyph without baked rounded masks",()=>{
  for(const source of[icon,apple])for(const color of["#11110F","#D94B30","#F5F4EE"])assert.ok(source.toUpperCase().includes(color),color);
  assert.doesNotMatch(icon,/<rect[^>]*rx=/);
  assert.match(apple,/width: 180, height: 180/);
  assert.doesNotMatch(apple,/radial-gradient|Warm Precision|#00D9FF/i);
  assert.match(apple,/linear-gradient\(#494945 1px,transparent 1px\)/);
});
