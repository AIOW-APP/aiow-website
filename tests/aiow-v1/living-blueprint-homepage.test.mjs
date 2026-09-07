import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const[home,enHome,page,hero,director,css,heroCss,sharedCss,dna,analytics,nextConfig,seo,llms]=await Promise.all([
 readFile(new URL("app/page.tsx",root),"utf8"),
 readFile(new URL("app/en/page.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/HumanIndustrialHero.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/HomepageMotionDirector.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.module.css",root),"utf8"),
 readFile(new URL("components/aiow-v1/HumanIndustrialHero.module.css",root),"utf8"),
 readFile(new URL("components/aiow-v1/AiowV1Homepage.module.css",root),"utf8"),
 readFile(new URL("DESIGN-DNA.md",root),"utf8"),
 readFile(new URL("core/analytics/Analytics.tsx",root),"utf8"),
 readFile(new URL("next.config.ts",root),"utf8"),
 readFile(new URL("lib/aiow-v1/seo.tsx",root),"utf8"),
 readFile(new URL("app/llms.txt/route.ts",root),"utf8"),
]);
const calculator=await readFile(new URL("components/aiow-v1/PriceCalculator.tsx",root),"utf8");

test("paired home routes mount the canonical homepage and preserve schemas",()=>{
 for(const source of[home,enHome]){assert.match(source,/LivingBlueprintHomepage/);assert.match(source,/homeSchemas/);assert.doesNotMatch(source,/<AiowV1Homepage/)}
 assert.match(enHome,/locale="en"/);
});

test("homepage mounts Human Industrial before the commercial instrument",()=>{
 assert.match(page,/<HumanIndustrialHero locale=\{locale\}/);
 assert.doesNotMatch(page,/QuietMonolithHero|ThreeWorldsBlueprint|ArchitecturalSections/);
 assert.equal((hero.match(/<h1/g)||[]).length,1);
 assert.ok(page.indexOf("<HumanIndustrialHero")<page.indexOf("<LivingBlueprintCalculator"));
 assert.equal((page.match(/<LivingBlueprintCalculator/g)||[]).length,1);
 assert.match(page,/id="pricing"/);
});

test("hero owns one route state and keeps all routes semantic",()=>{
 assert.match(hero,/"use client"/);
 assert.equal((hero.match(/useState<RouteId>/g)||[]).length,1);
 assert.match(hero,/onPointerEnter=\{\(\) => preview\(route\.id\)\}/);
 assert.match(hero,/onFocus=\{\(\) => preview\(route\.id\)\}/);
 assert.match(hero,/onPointerLeave=\{preserveFocusedRoute\}/);
 assert.equal((hero.match(/<Link/g)||[]).length,1,"one mapped semantic Link in source");
 for(const marker of["Voor mijn bedrijf","Voor mijn bedrijfspand","Voor mijn woning of villa","For my company","For my commercial building","For my home or villa"])assert.match(hero,new RegExp(marker));
 for(const href of["/ai-automatisering","/smart-office","/home","/en/ai-automation","/en/smart-office","/en/home"])assert.match(hero,new RegExp(href.replaceAll("/","\\/")));
 assert.doesNotMatch(hero,/<Image|<video|<canvas|\/quiet-monolith\/|href=\{scanHref\}/);
});

test("hero copy is authored, route-first and human bounded",()=>{
 for(const marker of["AI op maat","Voor uw bedrijf","bedrijfspand en","woning","Bespoke AI","For your company","commercial building","and home"])assert.match(hero,new RegExp(marker));
 assert.match(hero,/Een mens beslist\. Altijd\./);
 assert.match(hero,/A person decides\. Always\./);
 assert.match(hero,/AIOW ontwerpt, bouwt, koppelt en beheert één systeem/);
 assert.match(hero,/AIOW designs, builds, connects and manages one system/);
});

test("three environments remain calm below the hero and preserve causal truth",()=>{
 for(const marker of["Werk","Bedrijfspanden","Woningen & villa’s","Work","Commercial buildings","Homes & villas"])assert.match(page,new RegExp(marker));
 assert.equal((page.match(/<details>/g)||[]).length,1,"one mapped details element in source");
 for(const marker of["Signaal","AI interpreteert","Systeem handelt begrensd","Mens beslist","Signal","AI interprets","System acts within limits","Person decides"])assert.match(page,new RegExp(marker));
 const exampleArrays=[...page.matchAll(/examples: \[([^\]]+)\]/g)];
 assert.equal(exampleArrays.length,6);
 for(const match of exampleArrays){const count=(match[1].match(/"/g)||[]).length/2;assert.ok(count>=4&&count<=6,`example count ${count}`)}
});

test("scan contract, physical scope and human authority remain explicit below the hero",()=>{
 for(const marker of["maximaal circa 30 minuten","een mens bevestigt datum en tijd","u beslist pas na het memo","gekwalificeerde partners","about 30 minutes maximum","a person confirms date and time","you decide only after the memo","qualified partner work"])assert.match(page,new RegExp(marker));
 assert.match(page,/U bepaalt\. Het systeem werkt daarbinnen/);assert.match(page,/You decide\. The system works within that boundary/);
 assert.match(page,/showCta=\{false\}/);assert.match(page,/variant="human-industrial"/);
});

test("metadata, schema and machine text retain the three-category public truth",()=>{
 for(const marker of["werk, bedrijfspanden en woningen","work, commercial buildings and homes"])assert.match(`${home}\n${enHome}`,new RegExp(marker,"i"));
 for(const marker of["Drie AIOW-categorieën","Bedrijfspanden","Woningen & villa’s","Commercial buildings","Homes & villas"])assert.match(seo,new RegExp(marker));
 assert.doesNotMatch(seo,/\/#service[^]*price: "2950"/);
 assert.match(llms,/Werk, Bedrijfspanden en Woningen & villa’s/);
});

test("route field motion has stable geometry and complete fail-safe routes",()=>{
 assert.match(heroCss,/\.routeIndicator/);assert.match(heroCss,/--route-index/);assert.match(heroCss,/clip-path/);
 assert.match(heroCss,/@media\(max-width:700px\)/);assert.match(heroCss,/@media\(max-width:360px\)/);
 assert.match(heroCss,/prefers-reduced-motion:reduce/);assert.match(heroCss,/update:slow/);assert.match(heroCss,/animation:none!important/);assert.match(heroCss,/transition:none!important/);
 assert.doesNotMatch(heroCss,/infinite|cursor:.*none|filter:blur|backdrop-filter|parallax/i);
 assert.match(heroCss,/html\[data-theme="dark"\]/);assert.match(heroCss,/prefers-color-scheme:dark/);
 assert.match(dna,/Signature motion — Route Field/);assert.match(dna,/No idle loop/);assert.match(dna,/Default route content is rendered in settled state/);
});

test("Route Field Cinema is one-shot, interruptible and fail-open",()=>{
 assert.match(page,/<HomepageMotionDirector/);assert.ok((page.match(/data-reveal=/g)||[]).length>=10);
 for(const marker of["building","home","work"])assert.match(hero,new RegExp(`setActiveRoute\\(\\"${marker}\\"\\)`));
 assert.match(hero,/data-cinema=\{cinemaState\}/);assert.match(hero,/stopCommissioning/);
 assert.match(hero,/addEventListener\("wheel"/);assert.match(hero,/addEventListener\("touchstart"/);assert.match(hero,/addEventListener\("keydown"/);
 assert.match(director,/IntersectionObserver/);assert.match(director,/requestAnimationFrame/);assert.match(director,/data-motion-ready/);assert.match(director,/prefers-reduced-motion: reduce/);assert.match(director,/saveData/);
 assert.match(director,/fastScroll/);assert.match(director,/data-fast-reveal/);assert.match(director,/addEventListener\("scroll"/);
 assert.match(css,/data-motion-ready/);assert.match(css,/section-calibrate/);assert.match(css,/@media\(max-width:600px\).*transition-duration/s);
 assert.match(css,/data-fast-reveal/);assert.match(css,/transition-duration:\.1s,\.14s,\.14s/);
 assert.doesNotMatch(`${hero}\n${director}\n${heroCss}\n${css}`,/setInterval|animation-iteration-count\s*:\s*infinite|scroll-behavior:\s*smooth/i);
 assert.match(dna,/commissioning sequence/i);assert.match(dna,/never loops/i);assert.match(dna,/strictly fail-open/i);
});

test("Human Industrial removes the generic AI design grammar",()=>{
 assert.match(dna,/Human Industrial/);assert.match(dna,/No serif anywhere/);assert.match(dna,/Evening is independently art-directed/);
 assert.match(dna,/A-I-O-W identity spine/);assert.match(dna,/outlined `O`/);
 assert.doesNotMatch(heroCss,/Fraunces|Georgia|linear-gradient|radial-gradient|box-shadow/);
 assert.match(css,/Avenir Next Condensed/);assert.doesNotMatch(css,/font-family:var\(--font-fraunces\)/);
 assert.match(sharedCss,/data-variant="human-industrial"/);
});

test("anti-clutter and platform quality rails remain explicit",()=>{
 assert.doesNotMatch(hero,/proof:|stageLabels|ctaNote|trust:|<figcaption/);
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\]\{height:calc\(58px \+ env\(safe-area-inset-top\)\);top:0;max-width:100%;margin:0/);
 assert.match(analytics,/\["localhost", "127\.0\.0\.1", "::1"\]/);assert.match(analytics,/window\.location\.hostname/);
 assert.match(nextConfig,/htmlLimitedBots:\s*\/\.\*\//);
});

test("design DNA uses the canonical public contact source",()=>{
 assert.match(dna,/Company facts remain canonical:[^\n]*info@aiow\.io\./);
 assert.doesNotMatch(dna,/Company facts remain canonical:[^\n]*info@aiow\.ai\./);
});

test("booking anchor belongs to the calculator only",()=>{
 assert.match(page,/<section id="pricing" className=\{styles\.pricing\}>/);
 assert.equal((page.match(/id="booking"/g)||[]).length,0,"outer homepage must not duplicate calculator booking id");
 assert.match(calculator,/<section id="booking"/);
});
