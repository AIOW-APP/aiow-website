import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
const [proof, home, company] = await Promise.all(['components/aiow-v1/CustomerOutcomes.tsx','components/aiow-v1/LivingBlueprintHomepage.tsx','lib/aiow-v1/company.mjs'].map(p=>readFile(new URL(p,root),'utf8')));
test('outcome proof replaces authority in place before pricing without another CTA',()=>{
 assert.equal((home.match(/<CustomerOutcomes /g)||[]).length,1);
 assert.ok(home.indexOf('<HumanIndustrialHero')<home.indexOf('<CustomerOutcomes'));
 assert.ok(home.indexOf('<CustomerOutcomes')<home.indexOf('<section id="pricing"'));
 assert.doesNotMatch(home,/styles\.authority|c\.memo/);
 assert.doesNotMatch(proof,/'use client'|"use client"|<button|<Link|<a |<img|<video|<canvas/);
});
test('both languages label intention and fiction explicitly',()=>{
 for(const text of ['Beoogde uitkomsten, geen gemeten resultaten','Intended outcomes, not measured results','Voorbeeld · fictief','Example · fictional','Geen klantcase, uitgevoerd project of geverifieerd resultaat','Not a customer case, delivered project or verified result','Privéleven & thuis','Private life & home','Bedrijfspand','Commercial building']) assert.ok(proof.includes(text),text);
});
test('memo covers sources, dependencies, human gate, no-AI alternative and next step',()=>{
 for(const text of ['Probleem','Problem','Voorgestelde oplossing','Proposed solution','Vereisten & afhankelijkheden','Requirements & dependencies','Menselijk besluit','Human decision','Wanneer geen AI','When not to use AI','Volgende stap','Next step','vaste regels','fixed rules','geen AI-proef','no AI trial','menselijke goedkeuring','human approval']) assert.ok(proof.includes(text),text);
 assert.match(proof,/<details>/); assert.match(proof,/<summary>/);
 assert.match(proof,/aria-labelledby="example-memo-title"/);
 assert.match(company,/publicEmail: "info@aiow\.io"/); assert.match(company,/publicPhone: null/);
});
