import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer, request as nodeRequest } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const fixtures = JSON.parse(await readFile(new URL("../fixtures/aiow-commercial-contract-v1.json", import.meta.url), "utf8"));
const secret = "commercial-route-proof-secret-000000000000000";
const basic = `Basic ${Buffer.from("operator:correct horse battery staple").toString("base64")}`;
const durable = { booking: new Map(), quote: new Map() };
let rpcMode = "ok";

function json(res, status, value) {
  const bytes = Buffer.from(JSON.stringify(value));
  res.writeHead(status, { "content-type": "application/json", "content-length": String(bytes.length) });
  res.end(bytes);
}
function error(kind, code, requestId, status) {
  return { schemaKind: `${kind}_error`, code, message: "Request rejected", requestId, retriable: status === 429 || status >= 500 };
}
async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}
function mockServer() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://mock.invalid");
    const rid = req.headers["x-aiow-request-id"];
    const key = req.headers["idempotency-key"];
    if (url.pathname === "/booking") {
      if (key === "booking-timeout-1") return req.socket.destroy();
      if (key === "booking-non2xx-1") return json(res, 500, { error: "provider failure" });
      const value = await body(req); const digest = JSON.stringify(value); const saved = durable.booking.get(key);
      if (saved && saved.digest !== digest) return json(res, 409, error("booking", "idempotency_conflict", rid, 409));
      if (saved) return json(res, 202, { ...saved.ack, replayed: true });
      const ack = { schemaKind: "booking_ack", accepted: true, requestId: rid, leadId: "123e4567-e89b-42d3-a456-426614174000", revision: 1, preference: { date: value.date, slot: value.slot, subject: value.subject }, durableAt: "2026-08-30T12:00:00.000Z", replayed: false };
      durable.booking.set(key, { digest, ack }); return json(res, 202, ack);
    }
    if (url.pathname === "/quote") {
      const value = await body(req); const saved = durable.quote.get(key);
      if (value.schemaKind === "quote_prepare_request") {
        const digest = JSON.stringify(value.quote);
        if (saved && saved.digest !== digest) return json(res, 409, error("quote_prepare", "idempotency_conflict", rid, 409));
        if (saved) return json(res, 200, { ...saved.prepare, replayed: true });
        const prepare = { schemaKind: "quote_prepare_ack", accepted: true, requestId: rid, leadId: "223e4567-e89b-42d3-a456-426614174000", commercialLeadId: "323e4567-e89b-42d3-a456-426614174000", quoteNumber: "AIOW-2026-0001", state: "prepared", expiresAt: "2026-09-30T12:00:00.000Z", replayed: false };
        durable.quote.set(key, { digest, prepare }); return json(res, 200, prepare);
      }
      if (!saved || value.requestId !== saved.prepare.requestId) return json(res, 409, error("quote_commit", "idempotency_conflict", rid, 409));
      const ack = { schemaKind: "quote_commit_ack", accepted: true, requestId: value.requestId, leadId: value.leadId, commercialLeadId: value.commercialLeadId, quoteNumber: value.quoteNumber, state: "committed", pdfSha256: value.pdf.sha256, committedAt: "2026-08-30T12:00:00.000Z", replayed: Boolean(saved.committed), pdfDeliveryPermitted: true };
      saved.committed = true; return json(res, 200, ack);
    }
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      if (rpcMode === "invalid") return json(res, 400, { code: "22023", message: "invalid" });
      const name = url.pathname.split("/").at(-1); const args = await body(req);
      if (name === "aiow_commercial_queue_v1") return json(res, 200, fixtures.projections.QueueProjection);
      if (name === "aiow_commercial_mutate_v1") return json(res, 200, fixtures.acks.OpsMutationACK);
      if (name === "aiow_commercial_report_v1") return json(res, 200, { ...fixtures.projections.AnalyticsAggregateReport, from: args.p_from, through: args.p_through });
      if (name === "aiow_commercial_event_v1") return json(res, 500, { code: "XX000", message: "offline" });
    }
    json(res, 404, { error: "not found" });
  });
}
async function startNext(port, mockPort, configured = true) {
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", AIOW_COMMERCIAL_TEST_MODE: "1", AIOW_BOOKING_WEBHOOK_URL: `http://127.0.0.1:${mockPort}/booking`, AIOW_BOOKING_WEBHOOK_SECRET: secret, AIOW_QUOTE_WEBHOOK_URL: `http://127.0.0.1:${mockPort}/quote`, AIOW_QUOTE_WEBHOOK_SECRET: secret };
  if (configured) Object.assign(env, { AIOW_SUPABASE_URL: `http://127.0.0.1:${mockPort}`, AIOW_SUPABASE_SERVICE_ROLE_KEY: "service-role", AIOW_OPS_DEPLOYMENT_HOST: "ops.aiow.ai", AIOW_OPS_BASIC_USERNAME: "operator", AIOW_OPS_BASIC_PASSWORD: "correct horse battery staple", AIOW_OPS_OPERATOR_ID: "richard" });
  else for (const key of ["AIOW_SUPABASE_URL", "AIOW_SUPABASE_SERVICE_ROLE_KEY", "AIOW_OPS_DEPLOYMENT_HOST", "AIOW_OPS_BASIC_USERNAME", "AIOW_OPS_BASIC_PASSWORD", "AIOW_OPS_OPERATOR_ID"]) delete env[key];
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: new URL(root), env, stdio: ["ignore", "pipe", "pipe"] });
  let output = ""; child.stdout.on("data", (chunk) => { output += chunk; }); child.stderr.on("data", (chunk) => { output += chunk; });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Next exited ${child.exitCode}: ${output}`);
    try { const response = await fetch(`http://127.0.0.1:${port}/`); if (response.status) return { child, output: () => output }; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  child.kill("SIGTERM"); throw new Error(`Next readiness timeout: ${output}`);
}
async function stopNext(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), new Promise((resolve) => setTimeout(resolve, 10_000))]);
  if (child.exitCode === null) child.kill("SIGKILL");
}
function opsHeaders(extra = {}) { return { host: "ops.aiow.ai", authorization: basic, ...extra }; }
async function freePort() { const server = createServer(); const port = await listen(server); await new Promise((resolve) => server.close(resolve)); return port; }
async function opsRequest(url, { method="GET", headers={}, body=null } = {}) {
  const target=new URL(url);
  return new Promise((resolve,reject)=>{
    const req=nodeRequest({ hostname:target.hostname, port:target.port, path:`${target.pathname}${target.search}`, method, headers }, (res)=>{
      const chunks=[]; res.on("data",(chunk)=>chunks.push(chunk)); res.on("end",()=>{
        const bytes=Buffer.concat(chunks); const responseHeaders=new Headers();
        for (const [name,value] of Object.entries(res.headers)) if (value !== undefined) responseHeaders.set(name,Array.isArray(value)?value.join(", "):String(value));
        resolve({ status:res.statusCode, headers:responseHeaders, text:async()=>bytes.toString("utf8"), json:async()=>JSON.parse(bytes.toString("utf8")) });
      });
    });
    req.on("error",reject); if (body!==null) req.write(body); req.end();
  });
}

test("commercial HTTP routes enforce ops authority, durable replay and exact failure mappings", { timeout: 120_000 }, async () => {
  const mock = mockServer(); const mockPort = await listen(mock); const appPort = await freePort(); let app;
  try {
    app = await startNext(appPort, mockPort, true); const base = `http://127.0.0.1:${appPort}`;
    const queue = await opsRequest(`${base}/api/ops/leads`, { headers: opsHeaders() }); assert.equal(queue.status, 200, `${await queue.text()}\n${app.output()}`); assert.deepEqual(await queue.json(), fixtures.projections.QueueProjection);
    const mutation = fixtures.requests.OpsMarkRead;
    const mutate = await opsRequest(`${base}/api/ops/leads/${mutation.leadId}`, { method: "PATCH", headers: opsHeaders({ "content-type": "application/json", "idempotency-key": mutation.idempotencyKey }), body: JSON.stringify(mutation) }); assert.equal(mutate.status, 200); assert.deepEqual(await mutate.json(), fixtures.acks.OpsMutationACK);
    const report = await opsRequest(`${base}/api/ops/report?from=2026-08-30&through=2026-08-30`, { headers: opsHeaders() }); assert.equal(report.status, 200); assert.deepEqual(await report.json(), fixtures.projections.AnalyticsAggregateReport);
    const forged = await opsRequest(`${base}/api/ops/leads`, { headers: { host: "ops.aiow.ai", "x-aiow-operator-id": "richard", "x-aiow-operator-role": "ops_admin" } }); assert.equal(forged.status, 401); assert.equal(forged.headers.get("www-authenticate"), 'Basic realm="AIOW Operations", charset="UTF-8"');
    assert.equal((await opsRequest(`${base}/api/ops/leads`, { headers: { host: "www.aiow.ai", authorization: basic } })).status, 404);

    rpcMode = "invalid";
    const invalid = await opsRequest(`${base}/api/ops/leads/${mutation.leadId}`, { method: "PATCH", headers: opsHeaders({ "content-type": "application/json", "idempotency-key": mutation.idempotencyKey }), body: JSON.stringify(mutation) });
    assert.equal(invalid.status, 400); const invalidBody = await invalid.json(); assert.deepEqual({ ...invalidBody, requestId: "<uuid>" }, { schemaKind: "ops_error", code: "invalid_request", message: "Request rejected", requestId: "<uuid>", retriable: false }); assert.match(invalidBody.requestId, /^[0-9a-f-]{36}$/);
    rpcMode = "ok";

    const booking = { ...fixtures.requests.BookingRequest, date: "2026-09-30", subject: "bedrijf" }; const bookingHeaders = { "content-type": "application/json", "idempotency-key": "booking-replay-1" };
    const firstBooking = await fetch(`${base}/api/booking`, { method: "POST", headers: bookingHeaders, body: JSON.stringify(booking) }); assert.equal(firstBooking.status, 202); const firstBookingBody = await firstBooking.json();
    const replayBooking = await fetch(`${base}/api/booking`, { method: "POST", headers: bookingHeaders, body: JSON.stringify(booking) }); assert.equal(replayBooking.status, 202); const replayBookingBody = await replayBooking.json(); assert.equal(replayBookingBody.requestId, firstBookingBody.requestId); assert.equal(replayBookingBody.replayed, true);
    const bookingConflict = await fetch(`${base}/api/booking`, { method: "POST", headers: bookingHeaders, body: JSON.stringify({ ...booking, details: "changed" }) }); assert.equal(bookingConflict.status, 409); assert.equal((await bookingConflict.json()).code, "idempotency_conflict");
    for (const key of ["booking-timeout-1", "booking-non2xx-1"]) { const failed = await fetch(`${base}/api/booking`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": key }, body: JSON.stringify(booking) }); assert.equal(failed.status, 502, key); const value = await failed.json(); assert.equal(value.code, "unavailable"); assert.equal(value.retriable, true); }

    const quote = structuredClone(fixtures.requests.QuoteRequest); quote.contact.startDate = "2026-09-30"; const quoteHeaders = { "content-type": "application/json", "idempotency-key": "quote-replay-0001" };
    const firstQuote = await fetch(`${base}/api/quote`, { method: "POST", headers: quoteHeaders, body: JSON.stringify(quote) }); assert.equal(firstQuote.status, 200); const firstBytes = Buffer.from(await firstQuote.arrayBuffer()); assert.equal(firstQuote.headers.get("content-type"), "application/pdf"); assert.equal(firstQuote.headers.get("content-disposition"), 'attachment; filename="AIOW-2026-0001.pdf"'); assert.equal(firstQuote.headers.get("cache-control"), "no-store"); assert.equal(firstQuote.headers.get("x-aiow-pdf-sha256"), createHash("sha256").update(firstBytes).digest("hex"));
    const replayQuote = await fetch(`${base}/api/quote`, { method: "POST", headers: quoteHeaders, body: JSON.stringify(quote) }); assert.equal(replayQuote.status, 200); const replayBytes = Buffer.from(await replayQuote.arrayBuffer()); assert.deepEqual(replayBytes, firstBytes); for (const header of ["content-type", "content-disposition", "cache-control", "x-aiow-quote-number", "x-aiow-request-id", "x-aiow-pdf-sha256"]) assert.equal(replayQuote.headers.get(header), firstQuote.headers.get(header), header);
    const changed = structuredClone(quote); changed.contact.note = "changed"; const quoteConflict = await fetch(`${base}/api/quote`, { method: "POST", headers: quoteHeaders, body: JSON.stringify(changed) }); assert.equal(quoteConflict.status, 409); assert.equal((await quoteConflict.json()).code, "idempotency_conflict");

    const event = fixtures.events.page_view; const eventResponse = await fetch(`${base}/api/events`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "events-unavailable-1" }, body: JSON.stringify(event) }); assert.equal(eventResponse.status, 503); const eventBody = await eventResponse.json(); assert.deepEqual({ ...eventBody, requestId: "<uuid>" }, { schemaKind: "analytics_error", code: "rate_limited", message: "Request rejected", requestId: "<uuid>", retriable: true });
    await stopNext(app.child); app = null;

    const noConfigPort = await freePort(); app = await startNext(noConfigPort, mockPort, false); const noConfigBase = `http://127.0.0.1:${noConfigPort}`;
    assert.equal((await opsRequest(`${noConfigBase}/api/ops/leads`, { headers: opsHeaders() })).status, 404);
    const unavailable = await fetch(`${noConfigBase}/api/events`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "events-no-config-1" }, body: JSON.stringify(event) }); assert.equal(unavailable.status, 503); const unavailableBody = await unavailable.json(); assert.deepEqual({ ...unavailableBody, requestId: "<uuid>" }, { schemaKind: "analytics_error", code: "rate_limited", message: "Analytics is unavailable", requestId: "<uuid>", retriable: true });
  } finally { if (app) await stopNext(app.child); await new Promise((resolve) => mock.close(resolve)); }
});
