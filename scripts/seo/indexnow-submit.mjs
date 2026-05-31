#!/usr/bin/env node
const key = "2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0";
const host = "aiow.ai";
const keyLocation = `https://${host}/${key}.txt`;

const urls = [
  "https://aiow.ai/",
  "https://aiow.ai/aiow-nl-authority.md",
  "https://aiow.ai/llms.txt",
  "https://aiow.ai/ai.txt",
  "https://aiow.ai/nl/ai-installateur-nederland",
  "https://aiow.ai/nl/ai-oplossingen-bedrijven",
  "https://aiow.ai/nl/ai-agents-bedrijven",
  "https://aiow.ai/nl/ai-implementatie-bedrijf",
  "https://aiow.ai/nl/sector/installatiebedrijven",
  "https://aiow.ai/nl/sector/klantcontact-support",
  "https://aiow.ai/nl/sector/zorg",
  "https://aiow.ai/nl/sector/marketing-agencies",
  "https://aiow.ai/nl/vergelijking/ai-agent-vs-chatbot",
  "https://aiow.ai/nl/vergelijking/private-ai-vs-cloud-ai",
  "https://aiow.ai/nl/regio/amsterdam",
  "https://aiow.ai/nl/regio/rotterdam",
  "https://aiow.ai/nl/regio/utrecht",
  "https://aiow.ai/nl/regio/den-haag",
  "https://aiow.ai/nl/regio/eindhoven-brainport",
  "https://aiow.ai/nl/regio/haarlem",
  "https://aiow.ai/nl/regio/leiden",
  "https://aiow.ai/nl/regio/almere",
];

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
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(res.status, res.statusText);
console.log(await res.text());
if (!res.ok) process.exit(1);
