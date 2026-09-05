import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);const read=(p)=>readFile(new URL(p,root),"utf8");

test("one canonical AIOW entity carries only verified company facts",async()=>{
  const [seo,company]=await Promise.all([read("lib/aiow-v1/seo.tsx"),read("lib/aiow-v1/company.mjs")]);const start=seo.indexOf("export function organizationNode");const end=seo.indexOf("export function homeSchemas",start);const entity=seo.slice(start,end);
  assert.match(seo,/export const SITE_URL = "https:\/\/aiow\.ai"/);assert.match(entity,/url: AIOW_COMPANY\.website/);
  for(const field of ["name","alternateName","legalName","website","publicEmail","chamberOfCommerce","streetAddress","postalCode","locality","countryCode","countryNl","countryEn"]) assert.match(entity,new RegExp(`AIOW_COMPANY\\.${field}`));
  for(const required of ["AI Operating Workflows","AIOW B.V.","info@aiow.io","71887466","Nederland","Netherlands","Bijlmermeerstraat 30","2131 HC","Hoofddorp"]) assert.match(company,new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  for(const required of ["Organization","#organization","KvK","PostalAddress"]) assert.match(entity,new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  for(const forbidden of ["telephone","sameAs","foundingDate","aggregateRating","LocalBusiness","openingHoursSpecification","hasMap"]) assert.doesNotMatch(`${entity}\n${company}`,new RegExp(forbidden));
  assert.match(seo,/export function homeSchemas[^]*organizationNode\(locale\)/);
  assert.match(seo,/export function pillarSchemas[^]*organizationNode\(locale\)/);
  assert.match(seo,/export function tariffSchemas[^]*organizationNode\(locale\)/);
  assert.match(seo,/export function pricingContextSchemas[^]*organizationNode\(locale\)/);
});

test("capabilities schema is citable, paired and references the canonical entity",async()=>{
  const seo=await read("lib/aiow-v1/seo.tsx");const start=seo.indexOf("export function capabilitiesSchemas");const schema=seo.slice(start,seo.indexOf("export function JsonLd",start));
  assert.match(schema,/organizationNode\(locale\)/);assert.match(schema,/"@type": "WebPage"/);assert.match(schema,/"@type": "BreadcrumbList"/);assert.match(schema,/about: \{ "@id": `\$\{SITE_URL\}\/\#organization` \}/);assert.match(schema,/en-GB/);assert.match(schema,/nl-NL/);
});

test("metadata titles carry AIOW once and sitemap uses route-specific freshness",async()=>{
  const [seo,nlHome,enHome,nlCap,enCap,sitemap]=await Promise.all([read("lib/aiow-v1/seo.tsx"),read("app/page.tsx"),read("app/en/page.tsx"),read("app/mogelijkheden/page.tsx"),read("app/en/capabilities/page.tsx"),read("app/sitemap.ts")]);
  assert.match(seo,/title: \{ absolute: title \}/);
  for(const source of [nlHome,enHome,nlCap,enCap]) assert.equal((source.match(/title:[^\n]*AIOW/g)||[]).length,1);
  assert.match(nlHome,/AI voor werk, bedrijfspanden en woningen/);assert.match(enHome,/AI for work, commercial buildings and homes/);
  assert.match(sitemap,/routeDates/);assert.match(sitemap,/isStable\?"yearly":isHome\?"weekly":"monthly"/);assert.doesNotMatch(sitemap,/changeFrequency: "weekly"/);
});

test("owner-confirmed Hoofddorp address is visible without invented phone or opening hours",async()=>{
  const [trust,nl,en,seo,company]=await Promise.all([read("components/aiow-v1/TrustPage.tsx"),read("app/bedrijfsgegevens/page.tsx"),read("app/en/company/page.tsx"),read("lib/aiow-v1/seo.tsx"),read("lib/aiow-v1/company.mjs")]);
  for(const source of [trust,nl,en]) assert.match(source,/Hoofddorp/);for(const fact of ["Bijlmermeerstraat 30","2131 HC"]) assert.match(company,new RegExp(fact));
  assert.match(trust,/AIOW_COMPANY\.streetAddress/);assert.match(seo,/AIOW_COMPANY\.streetAddress/);
  assert.doesNotMatch(`${trust}\n${seo}\n${company}`,/telephone|openingHours|hasMap|LocalBusiness/);
});

test("capability modes are server-selected, URL-addressable and cross-linked",async()=>{
  const [component,nl,en,css]=await Promise.all([read("components/aiow-v1/CapabilitiesExperience.tsx"),read("app/mogelijkheden/page.tsx"),read("app/en/capabilities/page.tsx"),read("components/aiow-v1/CapabilitiesExperience.module.css")]);
  assert.match(nl,/bedrijfsproces:"process",gebouw:"building",woning:"home"/);assert.match(en,/process:"process",building:"building",home:"home"/);
  assert.match(component,/initialMode/);assert.match(component,/history\.replaceState/);assert.match(component,/url\.searchParams\.set/);
  for(const path of ["/ai-automatisering","/smart-office","/home","/tarieven#bedrijf","/tarieven#pand","/tarieven#woning"]) assert.match(component,new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(css,/\.experience>nav/);
});
