#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scratch = process.env.AIOW_TEST_SCRATCH || "/Volumes/AIOW_NVME/AIOW/Scratch/aiow-venture-intake-tests";
const stateFile = path.join(scratch, "state.json");
const port = Number(process.env.AIOW_TEST_PORT || 4321);
const baseUrl = `http://127.0.0.1:${port}`;
const secret = "local-test-only-hmac-secret-32-characters-minimum";
let server;

await mkdir(scratch, { recursive: true });
await rm(stateFile, { force: true });
await rm(`${stateFile}.lock`, { recursive: true, force: true });

try {
  await startServer();
  await runContractSuite();
  await stopServer();
  await startServer();
  await runRestartSuite();
  console.log("VENTURE_INTAKE_HTTP_TESTS_PASS");
} finally {
  await stopServer();
}

async function startServer() {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "production",
      AIOW_VENTURE_INTAKE_LOCAL_TEST: "1",
      AIOW_VENTURE_INTAKE_LOCAL_STORE: stateFile,
      AIOW_VENTURE_INTAKE_HASH_SECRET: secret,
      VERCEL: "",
      AIOW_SUPABASE_URL: "",
      AIOW_SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));
  for (let i = 0; i < 80; i += 1) {
    if (server.exitCode !== null) throw new Error(`server exited with ${server.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/nl/venture-score-aanvragen`);
      if (response.ok) return;
    } catch {}
    await delay(125);
  }
  throw new Error("server readiness timed out");
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([new Promise((resolve) => server.once("exit", resolve)), delay(5000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
  server = undefined;
}

async function runContractSuite() {
  const missingId = await post(validPayload(), { ip: "198.51.100.1", id: "" });
  assert.equal(missingId.status, 400);
  assert.equal(missingId.body.code, "INVALID_REQUEST_ID");

  const insufficient = await post({ ...validPayload(), idea: "Te kort." }, { ip: "198.51.100.12", id: randomId("insufficient") });
  assert.equal(insufficient.status, 400);
  assert.equal(insufficient.body.code, "INSUFFICIENT_CONTEXT");

  const invalidEmail = await post({ ...validPayload(), email: "not-an-email" }, { ip: "198.51.100.2", id: randomId("bad-email") });
  assert.equal(invalidEmail.status, 400);
  assert.equal(invalidEmail.body.code, "INVALID_EMAIL");

  const noConsent = await post({ ...validPayload(), consentAccepted: false }, { ip: "198.51.100.3", id: randomId("no-consent") });
  assert.equal(noConsent.status, 400);
  assert.equal(noConsent.body.code, "CONSENT_REQUIRED");

  const wrongConsentVersion = await post({ ...validPayload(), consentVersion: "old" }, { ip: "198.51.100.4", id: randomId("old-consent") });
  assert.equal(wrongConsentVersion.status, 400);
  assert.equal(wrongConsentVersion.body.code, "CONSENT_REQUIRED");

  const bot = await post({ ...validPayload(), honeyWebsite: "https://spam.invalid" }, { ip: "198.51.100.5", id: randomId("bot") });
  assert.equal(bot.status, 400);
  assert.equal(bot.body.code, "BOT_REJECTED");

  const oversized = await post({ ...validPayload(), idea: "x".repeat(40_000) }, { ip: "198.51.100.6", id: randomId("oversized") });
  assert.equal(oversized.status, 413);
  assert.equal(oversized.body.code, "PAYLOAD_TOO_LARGE");

  const requestId = randomId("success");
  const first = await post(validPayload(), { ip: "198.51.100.7", id: requestId });
  assert.equal(first.status, 201);
  assert.equal(first.body.ok, true);
  assert.match(first.body.receipt.dossierId, /^aiow_avs_[0-9a-f-]{36}$/);
  assert.equal(first.body.receipt.reviewStatus, "PENDING_HUMAN_REVIEW");
  assert.equal(first.body.receipt.replayed, false);
  assert.equal(first.body.dossier, undefined);
  assert.equal(first.body.storageMode, undefined);

  const replay = await post({ ...validPayload(), idea: "changed client retry payload must not overwrite" }, { ip: "198.51.100.7", id: requestId });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.receipt.replayed, true);
  assert.equal(replay.body.receipt.dossierId, first.body.receipt.dossierId);

  const parallelId = randomId("parallel");
  const parallel = await Promise.all(
    Array.from({ length: 8 }, () => post(validPayload(), { ip: "198.51.100.8", id: parallelId })),
  );
  assert.equal(new Set(parallel.map((result) => result.body.receipt?.dossierId)).size, 1);
  assert.equal(parallel.filter((result) => result.status === 201).length, 1);
  assert.equal(parallel.filter((result) => result.status === 200).length, 7);

  const limited = [];
  for (let index = 0; index < 13; index += 1) {
    limited.push(await post(validPayload(), { ip: "198.51.100.9", id: randomId(`rate-${index}`) }));
  }
  assert.equal(limited.slice(0, 12).every((result) => result.status === 201), true);
  assert.equal(limited[12].status, 429);
  assert.equal(limited[12].body.code, "RATE_LIMITED");
  assert.match(limited[12].retryAfter, /^\d+$/);

  const state = JSON.parse(await readFile(stateFile, "utf8"));
  assert.equal(Object.keys(state.dossiers).length, 14);
  assert.equal(JSON.stringify(state).includes("198.51.100."), false);
}

async function runRestartSuite() {
  const blockedAfterRestart = await post(validPayload(), { ip: "198.51.100.9", id: randomId("restart-rate") });
  assert.equal(blockedAfterRestart.status, 429);
  const state = JSON.parse(await readFile(stateFile, "utf8"));
  const priorRequest = Object.values(state.requests)[0];
  assert.ok(priorRequest?.dossierId);
}

async function post(payload, { ip, id }) {
  const response = await fetch(`${baseUrl}/api/venture-score`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "AIOW-P0-Contract-Test/1.0",
      "x-forwarded-for": ip,
      ...(id ? { "idempotency-key": id } : {}),
    },
    body: JSON.stringify(payload),
  });
  return {
    status: response.status,
    retryAfter: response.headers.get("retry-after"),
    body: await response.json(),
  };
}

function validPayload() {
  return {
    idea: "Een logistiek platform dat handmatige ritplanning automatiseert met menselijke controle.",
    industry: "Logistiek",
    stage: "eerste-klanten",
    goal: "bouwen",
    name: "Test Founder",
    email: "founder@example.invalid",
    kvk: "12345678",
    consentAccepted: true,
    consentVersion: "aiow-venture-intake-v1",
    honeyWebsite: "",
    sourceRoute: "/nl/venture-score-aanvragen",
    sourceComponent: "contract-test",
  };
}

function randomId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
