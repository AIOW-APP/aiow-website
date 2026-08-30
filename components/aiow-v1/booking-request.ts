export type FailureClass = "validation" | "rate_limit" | "unavailable" | "conflict";
export type AnalyticsEmitter = (event: "booking_failed" | "booking_succeeded", fields: { failureClass: FailureClass } | { experiment: null }) => unknown;

type BookingSuccess = { ok: true; requestId: string };
type BookingFailure = { ok: false; fields: Record<string, string>; failureClass: FailureClass };
export type BookingRequestResult = BookingSuccess | BookingFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function httpFailureClass(status: number): FailureClass {
  if (status === 429) return "rate_limit";
  if (status === 409) return "conflict";
  if (status >= 500) return "unavailable";
  return "validation";
}

function responseFields(value: unknown): Record<string, string> {
  if (!isRecord(value) || !isRecord(value.fields)) return {};
  return Object.fromEntries(Object.entries(value.fields).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

export async function requestBooking(
  fetcher: typeof fetch,
  init: RequestInit,
  emit: AnalyticsEmitter,
): Promise<BookingRequestResult> {
  let response: Response;
  try {
    response = await fetcher("/api/booking", init);
  } catch {
    void emit("booking_failed", { failureClass: "unavailable" });
    return { ok: false, fields: {}, failureClass: "unavailable" };
  }

  if (!response.ok) {
    const failureClass = httpFailureClass(response.status);
    let body: unknown = null;
    try { body = await response.json(); } catch { /* HTTP status remains authoritative. */ }
    void emit("booking_failed", { failureClass });
    return { ok: false, fields: responseFields(body), failureClass };
  }

  let body: unknown;
  try { body = await response.json(); }
  catch {
    void emit("booking_failed", { failureClass: "unavailable" });
    return { ok: false, fields: {}, failureClass: "unavailable" };
  }
  if (!isRecord(body) || body.ok !== true || typeof body.requestId !== "string" || body.requestId.length < 1 || body.requestId.length > 128) {
    void emit("booking_failed", { failureClass: "unavailable" });
    return { ok: false, fields: responseFields(body), failureClass: "unavailable" };
  }

  void emit("booking_succeeded", { experiment: null });
  return { ok: true, requestId: body.requestId };
}
