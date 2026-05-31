import { appendFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

type CaptureKind = "intake" | "founding-interest";

type CaptureRecord = {
  kind: CaptureKind;
  id: string;
  capturedAt: string;
  deliveryState: "LOCAL_CAPTURED" | "EMAIL_AND_LOCAL_CAPTURED";
  payload: unknown;
};

export async function captureOneTapSubmission(
  kind: CaptureKind,
  id: string,
  payload: unknown,
  deliveryState: CaptureRecord["deliveryState"] = "LOCAL_CAPTURED",
): Promise<{ path: string; deliveryState: CaptureRecord["deliveryState"] }> {
  const dir = process.env.ONETAP_CAPTURE_DIR || path.join(os.tmpdir(), "onetap-capture");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${kind}.jsonl`);
  const record: CaptureRecord = {
    kind,
    id,
    capturedAt: new Date().toISOString(),
    deliveryState,
    payload,
  };
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { path: filePath, deliveryState };
}
