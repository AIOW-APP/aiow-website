import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AIOW_OPERATOR_ID_HEADER,
  AIOW_OPERATOR_ROLE_HEADER,
  authorizeOpsRequest,
} from "../../lib/aiow-v1/ops-access.mjs";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const configured = {
  AIOW_OPS_DEPLOYMENT_HOST: "ops.aiow.ai",
  AIOW_OPS_BASIC_USERNAME: "operator",
  AIOW_OPS_BASIC_PASSWORD: "correct horse battery staple",
  AIOW_OPS_OPERATOR_ID: "richard",
};
const basic = (username, password) => `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
const allowed = (overrides = {}) => ({
  hostname: "ops.aiow.ai",
  authorization: basic("operator", "correct horse battery staple"),
  env: configured,
  ...overrides,
});

for (const missing of Object.keys(configured)) {
  test(`missing ${missing} is concealed`, async () => {
    const env = { ...configured };
    delete env[missing];
    assert.deepEqual(await authorizeOpsRequest(allowed({ env })), { kind: "not_found" });
  });
}

test("malformed server configuration is concealed", async () => {
  for (const env of [
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: "https://ops.aiow.ai" },
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: "ops.aiow.ai:443" },
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: "OPS.AIOW.AI" },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "" },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "bad:name" },
    { ...configured, AIOW_OPS_BASIC_PASSWORD: "bad:password" },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "bad\nname" },
    { ...configured, AIOW_OPS_BASIC_PASSWORD: "x".repeat(2049) },
    { ...configured, AIOW_OPS_OPERATOR_ID: "someone-else" },
  ]) assert.deepEqual(await authorizeOpsRequest(allowed({ env })), { kind: "not_found" });
});

test("every non-exact host is concealed before credentials matter", async () => {
  for (const hostname of [
    "aiow.ai",
    "www.aiow.ai",
    "evil.aiow.ai",
    "ops.aiow.ai.evil.example",
    "evilops.aiow.ai",
    "ops.aiow.ai:443",
    "OPS.AIOW.AI",
    "ops.aiow.ai.",
    "",
  ]) {
    assert.deepEqual(
      await authorizeOpsRequest(allowed({ hostname, authorization: basic("operator", "wrong") })),
      { kind: "not_found" },
      hostname,
    );
  }
});

test("allowed host without one strict valid Basic credential gets a challenge", async () => {
  const malformedUtf8 = `Basic ${Buffer.from([0xff, 0x3a, 0x61]).toString("base64")}`;
  for (const authorization of [
    null,
    "",
    "Bearer token",
    "Basic",
    "Basic  Zm9vOmJhcg==",
    "Basic Zm9v",
    "Basic Zm9vOmJhcjpiYXo=",
    "Basic Zm9vOmJhcg",
    "Basic Zm9vOmJhcg===",
    "Basic Zm9vOmJhcg==, Basic Zm9vOmJhcg==",
    malformedUtf8,
    `Basic ${"A".repeat(4097)}`,
  ]) assert.deepEqual(await authorizeOpsRequest(allowed({ authorization })), { kind: "unauthorized" });
});

test("wrong username and password are rejected", async () => {
  assert.deepEqual(await authorizeOpsRequest(allowed({ authorization: basic("wrong", configured.AIOW_OPS_BASIC_PASSWORD) })), { kind: "unauthorized" });
  assert.deepEqual(await authorizeOpsRequest(allowed({ authorization: basic(configured.AIOW_OPS_BASIC_USERNAME, "wrong") })), { kind: "unauthorized" });
  assert.deepEqual(await authorizeOpsRequest(allowed({ authorization: basic("wrong", "wrong") })), { kind: "unauthorized" });
});

test("valid exact host and credentials return only the trusted principal", async () => {
  assert.deepEqual(await authorizeOpsRequest(allowed({ token: "ignored-query-token" })), {
    kind: "authorized",
    principal: { id: "richard", role: "ops_admin" },
  });
  assert.equal(AIOW_OPERATOR_ID_HEADER, "x-aiow-operator-id");
  assert.equal(AIOW_OPERATOR_ROLE_HEADER, "x-aiow-operator-role");
});

test("admin source accepts only middleware-injected authority and covers UI plus API", async () => {
  const [middleware, api, page] = await Promise.all([
    read("middleware.ts"),
    read("app/api/admin/venture-accounts/route.ts"),
    read("app/portal/admin/page.tsx"),
  ]);

  for (const forbidden of ["searchParams", "AIOW_ADMIN_TOKEN", "x-aiow-admin-token"]) assert.doesNotMatch(api, new RegExp(forbidden));
  assert.match(api, /x-aiow-operator-id/);
  assert.match(api, /x-aiow-operator-role/);
  assert.match(api, /status:\s*404/);

  assert.match(page, /headers\(\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /<OpsDashboard \/>/);
  assert.ok(page.indexOf("headers()") < page.indexOf("<OpsDashboard />"));
  assert.doesNotMatch(page, /listVentureAccounts|fetch\(/);

  assert.match(middleware, /\/portal\/admin/);
  assert.match(middleware, /\/api\/admin/);
  assert.match(middleware, /\/admin/);
  assert.match(middleware, /headers\.delete\(AIOW_OPERATOR_ID_HEADER\)/);
  assert.match(middleware, /headers\.delete\(AIOW_OPERATOR_ROLE_HEADER\)/);
  assert.ok(middleware.indexOf("headers.delete(AIOW_OPERATOR_ID_HEADER)") < middleware.indexOf("const access = await authorizeOpsRequest"));
  assert.match(middleware, /hostname: request\.headers\.get\("host"\) \?\? ""/);
  assert.doesNotMatch(middleware, /x-forwarded-host/);
  assert.match(middleware, /Basic realm="AIOW Operations", charset="UTF-8"/);
  assert.match(middleware, /"WWW-Authenticate": OPERATIONS_CHALLENGE/);
  assert.ok(middleware.indexOf('if (access.kind === "unauthorized")') < middleware.indexOf("headers.set(AIOW_OPERATOR_ID_HEADER"));
});
