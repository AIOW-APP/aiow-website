#!/usr/bin/env node
const key = "2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0";
const host = "aiow.ai";
const base = `https://${host}`;
const keyLocation = `${base}/${key}.txt`;

async function getSitemapUrls() {
  const res = await fetch(`${base}/sitemap.xml`, { headers: { "User-Agent": "TeamRichard-AIOW/1.0" } });
  if (!res.ok) throw new Error(`sitemap ${res.status} ${res.statusText}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

const urls = await getSitemapUrls();
const body = { host, key, keyLocation, urlList: urls };

if (process.argv.includes("--print")) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

if (!process.argv.includes("--send")) {
  console.error("Dry-run only. Use --print to inspect payload or --send after explicit approval.");
  process.exit(2);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "TeamRichard-AIOW/1.0" },
  body: JSON.stringify(body),
});
console.log(res.status, res.statusText, `urls=${urls.length}`);
console.log(await res.text());
if (!res.ok) process.exit(1);
