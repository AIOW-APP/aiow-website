import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);
const read=(path)=>readFile(new URL(path,root),"utf8");

test("capabilities experience proves three four-stage workflows with honest authority boundaries",async()=>{
  const source=await read("components/aiow-v1/CapabilitiesExperience.tsx");
  for(const world of ["Bedrijfsproces","Gebouw","Woning","Business process","Building","Home"]) assert.match(source,new RegExp(world));
  for(const stage of ["01 · Signaal","02 · Interpretatie","03 · Systeemactie","04 · Beslissing","01 · Signal","02 · Interpretation","03 · System action","04 · Decision"]) assert.match(source,new RegExp(stage.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  for(const authority of ["Afgeleid door AI","Begrensde automatisering","Menselijke autoriteit","Derived by AI","Bounded automation","Human authority"]) assert.match(source,new RegExp(authority));
  assert.match(source,/Publieke, synthetische referentieworkflow/); assert.match(source,/Public, synthetic reference workflow/);
  assert.match(source,/geen klantcase, besparingsclaim of live verwerking/); assert.match(source,/not a customer case, saving claim or live processing/);
  assert.doesNotMatch(source,/\b(?:98%|ROI|bespaart|saves?\s+\d|klant zegt|customer says|guaranteed outcome)\b/i);
});

test("scan output is one bounded decision artifact with all ten promised parts",async()=>{
  const source=await read("components/aiow-v1/CapabilitiesExperience.tsx");
  for(const item of ["Huidige situatie","Gekozen proces of ruimte","Geverifieerde inputs","Systemen en afhankelijkheden","Menselijke beslismomenten","Uitzonderingen en foutimpact","Aanbevolen pilot","Expliciete uitsluitingen","Gepubliceerde prijsbasis","Volgende beslissing"]) assert.match(source,new RegExp(item));
  assert.match(source,/U krijgt een besluitbaar ontwerp, geen AI-presentatie/);
  assert.match(source,/You receive a decision-ready design, not an AI presentation/);
  assert.match(source,/Breng één proces of één ruimte mee/); assert.match(source,/Bring one process or one space/);
  assert.equal((source.match(/en\?"\/en\/scan":"\/scan"/g)||[]).length,2);
  assert.doesNotMatch(source,/\/#booking|\/en#booking/);
});

test("capabilities routes are paired, crawlable and directly reachable from primary navigation",async()=>{
  const [nl,en,locale,header,sitemap,css,scanNl,scanEn,llms,llmsFull,scanPage,scanCss]=await Promise.all([
    read("app/mogelijkheden/page.tsx"),read("app/en/capabilities/page.tsx"),read("lib/aiow-v1/locale.ts"),read("components/aiow-v1/PublicHeader.tsx"),read("app/sitemap.ts"),read("components/aiow-v1/CapabilitiesExperience.module.css"),read("app/scan/page.tsx"),read("app/en/scan/page.tsx"),read("app/llms.txt/route.ts"),read("app/llms-full.txt/route.ts"),read("components/aiow-v1/ScanRequestPage.tsx"),read("components/aiow-v1/ScanRequestPage.module.css"),
  ]);
  assert.match(nl,/path:"\/mogelijkheden"/); assert.match(en,/path:"\/en\/capabilities"/);
  assert.match(locale,/\["\/mogelijkheden", "\/en\/capabilities"\]/);
  assert.match(locale,/\["\/scan", "\/en\/scan"\]/);
  assert.match(header,/key: "capabilities"/); assert.match(header,/Mogelijkheden/); assert.match(header,/Capabilities/);
  assert.match(header,/const scanHref = en \? "\/en\/scan" : "\/scan"/);
  assert.match(scanNl,/ScanRequestPage locale="nl"/); assert.match(scanEn,/ScanRequestPage locale="en"/);
  assert.match(scanNl,/mens bevestigd/); assert.match(scanEn,/confirmed separately by a person/);
  assert.match(scanPage,/import shared from "\.\/AiowV1Homepage\.module\.css"/); assert.match(scanPage,/className=\{`\$\{shared\.site\} \$\{styles\.site\}`\}/);
  for(const token of ["--bg","--ink","--line","--copper","--muted"]) assert.match(scanCss,new RegExp(`var\\(${token}\\)`));
  assert.doesNotMatch(scanCss,/#14161a|#f4efe6|#2e333c|#d9a441|#a7a297/i);
  assert.match(sitemap,/PUBLIC_ROUTE_PAIRS/);
  for(const source of [llms,llmsFull]) { assert.match(source,/mogelijkheden/); assert.match(source,/en\/capabilities/); assert.match(source,/\/scan/); assert.match(source,/\/en\/scan/); }
  assert.match(css,/@media\(max-width:600px\)/); assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/:global\(html\[data-theme="light"\]\) \.site/); assert.match(css,/:global\(html\[data-theme="dark"\]\) \.site/); assert.match(css,/@media\(prefers-color-scheme:light\)/);
  assert.doesNotMatch(css,/backdrop-filter|filter:\s*blur|animation:[^;]*(?:infinite|linear)/);
});
