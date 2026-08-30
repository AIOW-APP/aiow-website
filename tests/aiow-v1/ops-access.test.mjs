import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AIOW_OPERATOR_ID_HEADER,
  AIOW_OPERATOR_ROLE_HEADER,
  authorizeOpsRequest,
  resolveOpsDeploymentAuthority,
} from "../../lib/aiow-v1/ops-access.mjs";
import { applyOperationsAuthority, isOperationsApiPath, isOperationsPath, OPERATIONS_CHALLENGE } from "../../middleware-ops-authority.ts";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const deploymentHost = "aiow-main-site.vercel.app";
const immutableDeploymentHost = "aiow-main-site-7f3a9c.vercel.app";
const configured = {
  AIOW_OPS_DEPLOYMENT_HOST: deploymentHost,
  AIOW_OPS_BASIC_USERNAME: "operator",
  AIOW_OPS_BASIC_PASSWORD: "correct horse battery staple",
  AIOW_OPS_OPERATOR_ID: "richard",
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_TARGET_ENV: "production",
  VERCEL_URL: immutableDeploymentHost,
  VERCEL_DEPLOYMENT_ID: "dpl_7f3a9c",
  VERCEL_PROJECT_ID: "prj_aiow",
};
const localConfigured = {
  AIOW_OPS_DEPLOYMENT_HOST: "127.0.0.1",
  AIOW_OPS_BASIC_USERNAME: "operator",
  AIOW_OPS_BASIC_PASSWORD: "correct horse battery staple",
  AIOW_OPS_OPERATOR_ID: "richard",
  AIOW_OPS_LOCAL_PROOF_MODE: "loopback-test",
  NODE_ENV: "test",
};
const basic = (username, password) => `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
const allowed = (overrides = {}) => ({
  hostname: deploymentHost,
  platformDeploymentHostname: immutableDeploymentHost,
  authorization: basic("operator", "correct horse battery staple"),
  env: configured,
  ...overrides,
});

for (const missing of [
  "AIOW_OPS_DEPLOYMENT_HOST",
  "AIOW_OPS_BASIC_USERNAME",
  "AIOW_OPS_BASIC_PASSWORD",
  "AIOW_OPS_OPERATOR_ID",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_TARGET_ENV",
  "VERCEL_URL",
  "VERCEL_DEPLOYMENT_ID",
  "VERCEL_PROJECT_ID",
]) {
  test(`missing ${missing} is concealed`, async () => {
    const env = { ...configured };
    delete env[missing];
    assert.deepEqual(await authorizeOpsRequest(allowed({ env })), { kind: "not_found" });
  });
}

test("malformed or non-production platform configuration is concealed", async () => {
  for (const env of [
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: `https://${deploymentHost}` },
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: `${deploymentHost}:443` },
    { ...configured, AIOW_OPS_DEPLOYMENT_HOST: deploymentHost.toUpperCase() },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "" },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "bad:name" },
    { ...configured, AIOW_OPS_BASIC_PASSWORD: "bad:password" },
    { ...configured, AIOW_OPS_BASIC_USERNAME: "bad\nname" },
    { ...configured, AIOW_OPS_BASIC_PASSWORD: "x".repeat(2049) },
    { ...configured, AIOW_OPS_OPERATOR_ID: "someone-else" },
    { ...configured, VERCEL: "0" },
    { ...configured, VERCEL_ENV: "preview" },
    { ...configured, VERCEL_TARGET_ENV: "preview" },
    { ...configured, VERCEL_URL: `https://${immutableDeploymentHost}` },
    { ...configured, VERCEL_URL: `${immutableDeploymentHost}:443` },
    { ...configured, VERCEL_DEPLOYMENT_ID: "bad id" },
    { ...configured, VERCEL_PROJECT_ID: "" },
  ]) assert.deepEqual(await authorizeOpsRequest(allowed({ env })), { kind: "not_found" });
});

test("client Host cannot substitute for platform deployment provenance", async () => {
  for (const input of [
    allowed({ platformDeploymentHostname: null }),
    allowed({ platformDeploymentHostname: "" }),
    allowed({ platformDeploymentHostname: "different.vercel.app" }),
    allowed({ platformDeploymentHostname: deploymentHost }),
    allowed({ env: { ...configured, VERCEL_URL: "forged.vercel.app" } }),
    allowed({ env: { ...configured, VERCEL: undefined } }),
    allowed({ env: { ...configured, VERCEL_ENV: undefined } }),
    allowed({ env: { ...configured, VERCEL_URL: undefined } }),
    allowed({ env: { ...configured, AIOW_OPS_LOCAL_PROOF_MODE: "loopback-test", VERCEL: undefined } }),
  ]) assert.deepEqual(await authorizeOpsRequest(input), { kind: "not_found" });
});

test("custom domains and every non-exact Host are concealed before credentials", async () => {
  for (const hostname of [
    "aiow.ai",
    "www.aiow.ai",
    "ops.aiow.ai",
    `evil.${deploymentHost}`,
    `${deploymentHost}.evil.example`,
    `${deploymentHost}:443`,
    deploymentHost.toUpperCase(),
    `${deploymentHost}.`,
    "",
  ]) {
    assert.deepEqual(
      await authorizeOpsRequest(allowed({ hostname, authorization: basic("operator", "wrong") })),
      { kind: "not_found" },
      hostname,
    );
  }
});

test("local proof is explicit, non-production, loopback-only, and requires a matching deployment host", async () => {
  const local = {
    hostname: "127.0.0.1",
    platformDeploymentHostname: "127.0.0.1",
    authorization: basic("operator", "correct horse battery staple"),
    env: localConfigured,
  };
  assert.deepEqual(resolveOpsDeploymentAuthority(local), { hostname: "127.0.0.1", username: "operator", password: "correct horse battery staple" });
  assert.equal((await authorizeOpsRequest(local)).kind, "authorized");
  for (const input of [
    { ...local, env: { ...localConfigured, AIOW_OPS_LOCAL_PROOF_MODE: undefined } },
    { ...local, env: { ...localConfigured, NODE_ENV: "production" } },
    { ...local, env: { ...localConfigured, VERCEL: "1" } },
    { ...local, hostname: "localhost", env: { ...localConfigured, AIOW_OPS_DEPLOYMENT_HOST: "ops.example" } },
    { ...local, hostname: "ops.example", env: { ...localConfigured, AIOW_OPS_DEPLOYMENT_HOST: "ops.example" } },
    { ...local, platformDeploymentHostname: null },
    { ...local, platformDeploymentHostname: "" },
    { ...local, platformDeploymentHostname: "localhost" },
  ]) assert.deepEqual(await authorizeOpsRequest(input), { kind: "not_found" });
});

test("allowed deployment without one strict valid Basic credential gets a challenge", async () => {
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

test("stable alias with a different exact immutable deployment and valid credentials returns only the trusted principal", async () => {
  assert.deepEqual(await authorizeOpsRequest(allowed({ token: "ignored-query-token" })), {
    kind: "authorized",
    principal: { id: "richard", role: "ops_admin" },
  });
  assert.equal(AIOW_OPERATOR_ID_HEADER, "x-aiow-operator-id");
  assert.equal(AIOW_OPERATOR_ROLE_HEADER, "x-aiow-operator-role");
});

test("admin source uses shared middleware authority for UI, API, export and PII surfaces", async () => {
  const [middleware, authority, access, api, page] = await Promise.all([
    read("middleware.ts"),
    read("middleware-ops-authority.ts"),
    read("lib/aiow-v1/ops-access.mjs"),
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

  for (const route of ["/portal/admin", "/api/admin", "/api/ops", "/admin"]) assert.match(authority, new RegExp(route.replaceAll("/", "\\/")));
  assert.match(middleware, /applyOperationsAuthority/);
  assert.match(middleware, /VERCEL_URL/);
  assert.match(authority, /requestHeaders\.delete\(AIOW_OPERATOR_ID_HEADER\)/);
  assert.match(authority, /requestHeaders\.delete\(AIOW_OPERATOR_ROLE_HEADER\)/);
  assert.match(authority, /requestHeaders\.delete\("x-forwarded-host"\)/);
  assert.match(authority, /requestHeaders\.delete\(PLATFORM_DEPLOYMENT_HEADER\)/);
  assert.ok(authority.indexOf("requestHeaders.delete(AIOW_OPERATOR_ID_HEADER)") < authority.indexOf("const access = await authorizeOpsRequest"));
  assert.match(authority, /platformDeploymentHostname/);
  assert.match(access, /VERCEL_ENV === "production"/);
  assert.match(access, /validHostname\(env\?\.VERCEL_URL\)/);
  assert.match(access, /platformDeploymentHostname === env\.VERCEL_URL/);
  assert.match(authority, /Basic realm="AIOW Operations", charset="UTF-8"/);
  assert.match(authority, /"WWW-Authenticate": OPERATIONS_CHALLENGE/);
  assert.ok(authority.indexOf('if (access.kind === "unauthorized")') < authority.indexOf("requestHeaders.set(AIOW_OPERATOR_ID_HEADER"));
});

test("host and x-forwarded-host spoofing cannot unlock UI, API, export or PII paths", async () => {
  const paths = [
    "/portal/admin",
    "/portal/admin/export",
    "/admin",
    "/api/admin/venture-accounts",
    "/api/ops",
    "/api/ops/leads",
    "/api/ops/report",
    "/api/ops/report/export",
    "/api/ops/leads/123e4567-e89b-42d3-a456-426614174000/pii",
  ];
  for (const pathname of paths) {
    assert.equal(isOperationsPath(pathname), true, pathname);
    const credentials = basic("operator", "correct horse battery staple");
    for (const headers of [
      { host: deploymentHost, authorization: credentials },
      { host: deploymentHost, "x-forwarded-host": deploymentHost, authorization: credentials },
      { host: "ops.aiow.ai", "x-forwarded-host": deploymentHost, "x-vercel-deployment-url": immutableDeploymentHost, authorization: credentials },
      { host: deploymentHost, "x-forwarded-host": "ops.aiow.ai", "x-vercel-deployment-url": "forged.vercel.app", authorization: credentials },
    ]) {
      const rejected = await applyOperationsAuthority({ pathname, headers, env: configured });
      assert.equal(rejected.kind, "response");
      assert.equal(rejected.status, 404);
      assert.equal(rejected.body, null);
      assert.equal(rejected.headers.get("www-authenticate"), null);
      assert.equal(rejected.headers.get("cache-control"), "no-store");
    }
  }
});

test("allowed deployment API auth failures are closed no-store OpsError JSON with challenge and request ID", async () => {
  for (const pathname of ["/api/ops/leads", "/api/ops/report/export", "/api/admin/venture-accounts"]) {
    assert.equal(isOperationsApiPath(pathname), true);
    for (const authorization of [null, basic("operator", "wrong")]) {
      const headers = new Headers({ host: deploymentHost, "x-vercel-deployment-url": immutableDeploymentHost, [AIOW_OPERATOR_ID_HEADER]: "attacker", [AIOW_OPERATOR_ROLE_HEADER]: "owner" });
      if (authorization) headers.set("authorization", authorization);
      const rejected = await applyOperationsAuthority({ pathname, headers, env: configured });
      assert.equal(rejected.kind, "response");
      assert.equal(rejected.status, 401);
      assert.equal(rejected.headers.get("www-authenticate"), OPERATIONS_CHALLENGE);
      assert.equal(rejected.headers.get("cache-control"), "no-store");
      assert.match(rejected.headers.get("content-type") ?? "", /^application\/json/);
      const body = JSON.parse(rejected.body);
      assert.deepEqual({ ...body, requestId: "<uuid>" }, { schemaKind: "ops_error", code: "unauthenticated", message: "Request rejected", requestId: "<uuid>", retriable: false });
      assert.match(body.requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      assert.equal(rejected.headers.get("x-aiow-request-id"), body.requestId);
    }
  }
});

test("allowed deployment UI challenge stays closed and authorized requests replace spoofed authority", async () => {
  const challenged = await applyOperationsAuthority({ pathname: "/portal/admin", headers: { host: deploymentHost, "x-vercel-deployment-url": immutableDeploymentHost }, env: configured });
  assert.equal(challenged.kind, "response");
  assert.equal(challenged.status, 401);
  assert.equal(challenged.body, null);
  assert.equal(challenged.headers.get("www-authenticate"), OPERATIONS_CHALLENGE);
  assert.equal(challenged.headers.get("cache-control"), "no-store");

  for (const pathname of ["/portal/admin", "/api/ops/leads", "/api/admin/venture-accounts"]) {
    const accepted = await applyOperationsAuthority({
      pathname,
      headers: {
        host: deploymentHost,
        "x-vercel-deployment-url": immutableDeploymentHost,
        "x-forwarded-host": "attacker.example",
        authorization: basic("operator", "correct horse battery staple"),
        [AIOW_OPERATOR_ID_HEADER]: "attacker",
        [AIOW_OPERATOR_ROLE_HEADER]: "owner",
      },
      env: configured,
    });
    assert.equal(accepted.kind, "next");
    assert.equal(accepted.headers.get(AIOW_OPERATOR_ID_HEADER), "richard");
    assert.equal(accepted.headers.get(AIOW_OPERATOR_ROLE_HEADER), "ops_admin");
    assert.equal(accepted.headers.get("x-forwarded-host"), null);
    assert.equal(accepted.headers.get("x-vercel-deployment-url"), null);
  }
  assert.equal(isOperationsPath("/api/opsx"), false);
});
