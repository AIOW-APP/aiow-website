import test from "node:test";
import assert from "node:assert/strict";
import { availableLeadStatuses, buildStatusTransition, isTerminalStatus, LEGAL_STATUS_TRANSITIONS, MAX_REOPEN_REASON_LENGTH } from "../../components/aiow-v1/ops-lifecycle.ts";

const statuses = ["new", "qualified", "awaiting_info", "scan_planned", "proposal", "won", "lost"];

test("every and only frozen lifecycle edge is offered and accepted", () => {
  for (const current of statuses) {
    assert.deepEqual(availableLeadStatuses(current), [current, ...LEGAL_STATUS_TRANSITIONS[current]]);
    for (const target of statuses) {
      const expected = LEGAL_STATUS_TRANSITIONS[current].includes(target);
      const result = buildStatusTransition(current, target, current === "lost" && target === "qualified" ? " Nieuwe informatie ontvangen. " : "ignored");
      assert.equal(result.ok, expected, `${current} -> ${target}`);
      if (result.ok) assert.equal(result.reopenReason, current === "lost" ? "Nieuwe informatie ontvangen." : null);
    }
  }
});

test("lost reopen requires a bounded nonempty trimmed reason", () => {
  for (const reason of ["", " ", "\n\t"]) assert.deepEqual(buildStatusTransition("lost", "qualified", reason), { ok: false, reason: "reopen_reason_required" });
  assert.deepEqual(buildStatusTransition("lost", "qualified", "x".repeat(MAX_REOPEN_REASON_LENGTH + 1)), { ok: false, reason: "reopen_reason_too_long" });
  assert.deepEqual(buildStatusTransition("lost", "qualified", ` ${"x".repeat(MAX_REOPEN_REASON_LENGTH)} `), { ok: true, status: "qualified", reopenReason: "x".repeat(MAX_REOPEN_REASON_LENGTH) });
});

test("won and lost are terminal for next-action controls", () => {
  assert.equal(isTerminalStatus("won"), true);
  assert.equal(isTerminalStatus("lost"), true);
  for (const status of statuses.filter((value) => value !== "won" && value !== "lost")) assert.equal(isTerminalStatus(status), false);
});
