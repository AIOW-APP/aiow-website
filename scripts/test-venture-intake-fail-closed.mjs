#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = Number(process.env.AIOW_FAIL_CLOSED_PORT || 4322);
const baseUrl = `http://127.0.0.1:${port}`;

const SCENARIOS = [
  {
    name: "no durable backend configured",
    env: {},
  },
  {
    name: "jsonl/local test mode on Vercel must never accept",
    env: {
      VERCEL: "1",
      AIOW_VENTURE_INTAKE_LOCAL_TEST: "1",
      AIOW_VENTURE_INTAKE_LOCAL_STORE: "/tmp/aiow-venture-intake-must-not-be-used.json",
    },
  },
];

for (const scenario of SCENARIOS) {
  await runScenario(scenario);
}
console.log("VENTURE_INTAKE_FAIL_CLOSED_PASS");

async function runScenario(scenario) {
  const env = { ...process.env, NODE_ENV: "production" };
  for (const name of [
    "AIOW_VENTURE_INTAKE_LOCAL_TEST",
    "AIOW_VENTURE_INTAKE_LOCAL_STORE",
    "AIOW_SUPABASE_URL",
    "AIOW_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VERCEL",
  ]) delete env[name];
  env.AIOW_VENTURE_INTAKE_HASH_SECRET = "local-test-only-hmac-secret-32-characters-minimum";
  Object.assign(env, scenario.env);

  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));
  try {
    for (let i = 0; i < 80; i += 1) {
      try {
        const response = await fetch(`${baseUrl}/`);
        if (response.ok) break;
      } catch {}
      await delay(125);
    }
    const response = await fetch(`${baseUrl}/api/venture-score`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": `fail-closed-${crypto.randomUUID()}` },
      body: JSON.stringify({}),
    });
    const body = await response.json();
    assert.equal(response.status, 503, `scenario "${scenario.name}" must fail closed`);
    assert.equal(body.code, "INTAKE_UNAVAILABLE", `scenario "${scenario.name}" must report INTAKE_UNAVAILABLE`);
    console.log(`fail-closed OK: ${scenario.name}`);
  } finally {
    server.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => server.once("exit", resolve)), delay(5000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
