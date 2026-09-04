import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const[home,enHome,page,stage,css,dna,analytics,nextConfig]=await Promise.all([
 readFile(new URL("app/page.tsx",root),"utf8"),
 readFile(new URL("app/en/page.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintStage.tsx",root),"utf8"),
 readFile(new URL("components/aiow-v1/LivingBlueprintHomepage.module.css",root),"utf8"),
 readFile(new URL("DESIGN-DNA.md",root),"utf8"),
 readFile(new URL("core/analytics/Analytics.tsx",root),"utf8"),
 readFile(new URL("next.config.ts",root),"utf8"),
]);

test("paired home routes mount the Living Blueprint and preserve canonical schemas",()=>{
 for(const source of[home,enHome]){assert.match(source,/LivingBlueprintHomepage/);assert.match(source,/homeSchemas/);assert.doesNotMatch(source,/<AiowV1Homepage/)}
 assert.match(enHome,/locale="en"/);
});

test("Living Blueprint leads with one system-scan journey and keeps pricing later",()=>{
 assert.match(page,/Hier laat u/);assert.match(page,/your AI built/);assert.match(page,/Vraag een systeemscan aan/);assert.match(page,/Request a system scan/);
 assert.ok(page.indexOf("<LivingBlueprintStage")<page.indexOf("<LivingBlueprintCalculator"));
 assert.equal((page.match(/<LivingBlueprintCalculator/g)||[]).length,1);
 assert.match(page,/id="booking"/);assert.match(page,/id=\{locale==="en"\?"solutions":"oplossingen"\}/);
});

test("three worlds share one accessible six-node authority model",()=>{
 for(const marker of["process","building","home"])assert.match(stage,new RegExp(`${marker}:\\{tab:`));
 assert.equal((stage.match(/nodes:\[/g)||[]).length,6);
 assert.match(stage,/role="tablist"/);assert.match(stage,/role="tab"/);assert.match(stage,/aria-selected/);assert.match(stage,/ArrowLeft/);assert.match(stage,/ArrowRight/);
 assert.match(stage,/index===3/);assert.match(stage,/Human approval/);assert.match(stage,/Menselijk akkoord/);
});

test("responsive and motion contract is explicit and fail-safe",()=>{
 assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/@media\(max-width:340px\)/);assert.match(css,/signal-draw-y/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/grid-template-columns:1fr/);assert.match(css,/animation:none!important/);
 assert.match(dna,/# AIOW — Living Blueprint/);assert.match(dna,/Source → Rule → AI proposal → Human approval → Action → Management/);
});

test("three verified media worlds play once and retain poster fallbacks",()=>{
 for(const name of["process","building","home"]){assert.match(stage,new RegExp(`/aiow/living-blueprint/${name}\\.mp4`));assert.match(stage,new RegExp(`/aiow/living-blueprint/${name}-poster\\.webp`))}
 assert.match(stage,/autoPlay muted playsInline preload="metadata"/);
 assert.doesNotMatch(stage,/<video[^>]*\sloop(?:\s|=|\/|>)/);
 assert.match(stage,/prefers-reduced-motion: reduce/);assert.match(stage,/saveData/);
 assert.match(css,/\.worldMedia video/);assert.match(css,/prefers-reduced-motion:reduce[^]*\.worldMedia video\{display:none!important\}/);
});

test("quality rails preserve dark-section contrast and silence local analytics delivery",()=>{
 assert.match(css,/\.buildStory \.eyebrow\{color:#d9a441\}/);
 assert.match(analytics,/\["localhost", "127\.0\.0\.1", "::1"\]/);
 assert.match(analytics,/window\.location\.hostname/);
 assert.match(nextConfig,/htmlLimitedBots:\s*\/\.\*\//);
});
