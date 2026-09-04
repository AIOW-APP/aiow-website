import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const[home,enHome,page,blueprint,css,blueprintCss,sharedCss,dna,analytics,nextConfig]=await Promise.all([
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
]);

test("paired home routes mount the Living Blueprint and preserve canonical schemas",()=>{
 for(const source of[home,enHome]){assert.match(source,/LivingBlueprintHomepage/);assert.match(source,/homeSchemas/);assert.doesNotMatch(source,/<AiowV1Homepage/)}
 assert.match(enHome,/locale="en"/);
});

test("homepage leads with one concrete scan journey and keeps pricing later",()=>{
 for(const marker of["Wij bouwen AI","werk, pand en leven","Laat één proces of ruimte scannen","We build AI","work, property and life","Scan one process or space"])assert.match(page,new RegExp(marker));
 assert.ok(page.indexOf("<ThreeWorldsBlueprint")<page.indexOf("<LivingBlueprintCalculator"));
 assert.equal((page.match(/<LivingBlueprintCalculator/g)||[]).length,1);
 assert.match(page,/id="booking"/);assert.match(page,/id=\{locale === "en" \? "solutions" : "oplossingen"\}/);
});

test("three worlds are simultaneously present and emphasis never replaces them",()=>{
 for(const marker of["process","property","private"])assert.match(blueprint,new RegExp(`id: "${marker}"`));
 assert.match(blueprint,/DesktopWorld/);assert.match(blueprint,/MobileWorld/);
 assert.match(blueprint,/aria-pressed=\{active === item\.id\}/);assert.match(blueprint,/current === world \? "all" : world/);
 assert.match(blueprint,/U houdt de bevoegdheid/);assert.match(blueprint,/You retain authority/);
 assert.doesNotMatch(blueprint,/<video/);
});

test("rejected tabbed video and repeated page structures are removed",()=>{
 assert.doesNotMatch(page,/LivingBlueprintStage/);assert.doesNotMatch(page,/buildStory/);assert.doesNotMatch(page,/causalChain/);assert.doesNotMatch(page,/worldCard/);
 assert.equal((page.match(/className=\{styles\.authority\}/g)||[]).length,1);
 assert.equal((page.match(/className=\{styles\.method\}/g)||[]).length,1);
});

test("responsive signature is separately composed and motion fails safe",()=>{
 assert.match(blueprintCss,/\.desktopSvg\{display:block\}/);assert.match(blueprintCss,/\.mobileSvg\{display:none\}/);
 assert.match(blueprintCss,/@media\(max-width:1050px\)[^]*\.desktopSvg\{display:none\}\.mobileSvg\{display:block\}/);
 assert.match(blueprintCss,/@media\(max-width:600px\)/);assert.match(blueprintCss,/prefers-reduced-motion:reduce/);assert.match(blueprintCss,/stroke-dashoffset:0/);
 assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/\.desktopTitle\{display:none\}\.mobileTitle\{display:block\}/);
 assert.match(dna,/Three Worlds, One Blueprint/);assert.match(dna,/may never hide the other two/);
});

test("quality rails preserve contrast, metadata and silent local analytics",()=>{
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\]\{height:calc\(58px \+ env\(safe-area-inset-top\)\);top:0;max-width:100%;margin:0/);
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\] \.menuButton,\.header\[data-compact-mobile="true"\] \.language\{border:0;background:transparent/);
 assert.match(sharedCss,/\.header\[data-compact-mobile="true"\] \.headerCta\{color:#fffaf1\}/);
 assert.match(sharedCss,/:global\(html\[data-theme="dark"\]\) \.header\[data-compact-mobile="true"\] \.headerCta\{color:#14161a\}/);
 assert.match(analytics,/\["localhost", "127\.0\.0\.1", "::1"\]/);assert.match(analytics,/window\.location\.hostname/);
 assert.match(nextConfig,/htmlLimitedBots:\s*\/\.\*\//);
});
