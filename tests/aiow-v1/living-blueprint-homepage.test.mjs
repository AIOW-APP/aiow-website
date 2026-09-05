import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const[home,enHome,page,blueprint,css,blueprintCss,sharedCss,dna,analytics,nextConfig,seo,llms]=await Promise.all([
 readFile(new URL("app/page.tsx",root),"utf8"),
 readFile(new URL("app/en/page.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/ThreeWorldsBlueprint.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.module.css",root),"utf8"),
 readFile(new URL("components/aiow-v1/ThreeWorldsBlueprint.module.css",root),"utf8"),
 readFile(new URL("components/aiow-v1/AiowV1Homepage.module.css",root),"utf8"),
 readFile(new URL("DESIGN-DNA.md",root),"utf8"),
 readFile(new URL("core/analytics/Analytics.tsx",root),"utf8"),
 readFile(new URL("next.config.ts",root),"utf8"),
 readFile(new URL("lib/aiow-v1/seo.tsx",root),"utf8"),
 readFile(new URL("app/llms.txt/route.ts",root),"utf8"),
]);

test("paired home routes mount the Living Blueprint and preserve canonical schemas",()=>{
 for(const source of[home,enHome]){assert.match(source,/LivingBlueprintHomepage/);assert.match(source,/homeSchemas/);assert.doesNotMatch(source,/<AiowV1Homepage/)}
 assert.match(enHome,/locale="en"/);
});

test("homepage leads with the exact three categories and one concrete scan journey",()=>{
 for(const marker of["AI voor uw","Werk","Bedrijfspanden","Woningen & villa’s","Laat één proces of ruimte scannen","AI for your","Commercial buildings","Homes & villas","Scan one process or space"])assert.match(page,new RegExp(marker));
 for(const rejected of[/werk, pand en leven/i,/work, property and life/i,/title: "Pand"/,/title: "Privé"/])assert.doesNotMatch(page,rejected);
 assert.equal((page.match(/<h1/g)||[]).length,1);
 assert.ok(page.indexOf("<ThreeWorldsBlueprint")<page.indexOf("<LivingBlueprintCalculator"));
 assert.equal((page.match(/<LivingBlueprintCalculator/g)||[]).length,1);
 assert.match(page,/id="booking"/);assert.match(page,/id=\{locale === "en" \? "solutions" : "oplossingen"\}/);
});

test("hero is server rendered, media free and all three category links stay present",()=>{
 assert.doesNotMatch(blueprint,/"use client"|useState|aria-pressed|<button|<video|<img/);
 for(const marker of["Werk","Bedrijfspanden","Woningen & villa’s","Work","Commercial buildings","Homes & villas","U bepaalt","You decide"])assert.match(blueprint,new RegExp(marker));
 assert.equal((blueprint.match(/<Link href=\{item\.href\}/g)||[]).length,1);
 assert.match(blueprint,/ArchitecturalSections/);
});

test("every category exposes a four-stage reference trace and four to six examples",()=>{
 for(const marker of["Signaal","AI-interpretatie","Begrensde actie of systeem","Menselijke bevoegdheid","Signal","AI interpretation","Bounded action or system","Human authority"])assert.match(page,new RegExp(marker));
 const exampleArrays=[...page.matchAll(/examples: \[([^\]]+)\]/g)];
 assert.equal(exampleArrays.length,6);
 for(const match of exampleArrays){const count=(match[1].match(/"/g)||[]).length/2;assert.ok(count>=4&&count<=6,`example count ${count}`)}
 assert.match(page,/geen klantcases, garanties of inbegrepen hardware/);
 assert.match(page,/not customer cases, guarantees or included hardware/);
});

test("scan contract and physical scope remain visible beside the single commercial action",()=>{
 assert.match(page,/u ontvangt een beslismemo/);assert.match(page,/Hardware, fysieke installatie en partnerwerk worden apart gescoped/);
 assert.match(page,/een mens bevestigt datum en tijd/);assert.match(page,/stoppen blijft mogelijk/);
 assert.match(page,/gekwalificeerde partner/);assert.match(page,/qualified partner/);
 assert.equal((page.match(/cta: "Laat één proces of ruimte scannen"/g)||[]).length,1);
 assert.match(page,/showCta=\{false\}/);
});

test("metadata, schema and machine text carry the same truth without a generic home price offer",()=>{
 for(const marker of["werk, bedrijfspanden en woningen","work, commercial buildings and homes"])assert.match(`${home}\n${enHome}`,new RegExp(marker,"i"));
 for(const marker of["Drie AIOW-categorieën","Bedrijfspanden","Woningen & villa’s","Commercial buildings","Homes & villas"])assert.match(seo,new RegExp(marker));
 assert.doesNotMatch(seo,/\/#service[^]*price: "2950"/);
 assert.match(llms,/Werk, Bedrijfspanden en Woningen & villa’s/);
});

test("responsive signature is separately composed and motion fails safe",()=>{
 assert.match(blueprintCss,/@media\(max-width:600px\)/);assert.match(blueprintCss,/prefers-reduced-motion:reduce/);assert.match(blueprintCss,/stroke-dashoffset:0/);assert.match(blueprintCss,/update:slow/);
 assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/\.hero h1\{font-size:clamp\(36px/);
 assert.match(dna,/Three Sections, One Controlled Conductor/);assert.match(dna,/never controls that hide or replace another category/);
});

test("quality rails preserve contrast, metadata and silent local analytics",()=>{
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\]\{height:calc\(58px \+ env\(safe-area-inset-top\)\);top:0;max-width:100%;margin:0/);
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\] \.menuButton,\.header\[data-compact-mobile="true"\] \.language\{border:0;background:transparent/);
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\] \.headerCta\{color:#fffaf1\}/);
 assert.match(sharedCss,/:global\(html\[data-theme="dark"\]\) \.header\[data-compact-mobile="true"\] \.headerCta\{color:#14161a\}/);
 assert.match(analytics,/\["localhost", "127\.0\.0\.1", "::1"\]/);assert.match(analytics,/window\.location\.hostname/);
 assert.match(nextConfig,/htmlLimitedBots:\s*\/\.\*\//);
});
