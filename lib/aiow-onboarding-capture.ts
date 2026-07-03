import { appendFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

type CustomerOnboardingRecord = {
  id: string;
  capturedAt: string;
  deliveryState: "LOCAL_CAPTURED" | "EMAIL_AND_LOCAL_CAPTURED";
  payload: unknown;
};

export async function captureAiowCustomerOnboarding(
  id: string,
  payload: unknown,
  deliveryState: CustomerOnboardingRecord["deliveryState"] = "LOCAL_CAPTURED",
): Promise<{ path: string; deliveryState: CustomerOnboardingRecord["deliveryState"] }> {
  const dir = process.env.AIOW_CUSTOMER_ONBOARDING_CAPTURE_DIR || path.join(os.tmpdir(), "aiow-customer-onboarding");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, "customer-onboarding.jsonl");
  const record: CustomerOnboardingRecord = {
    id,
    capturedAt: new Date().toISOString(),
    deliveryState,
    payload,
  };
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { path: filePath, deliveryState };
}
