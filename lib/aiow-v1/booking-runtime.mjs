export class BookingRequestError extends Error {
  constructor(status, code) { super(code); this.name = "BookingRequestError"; this.status = status; this.code = code; }
}

export function amsterdamDateISO(now = new Date(), offsetDays = 0) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError("now must be a valid Date");
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day + offsetDays)).toISOString().slice(0, 10);
}

export async function readBoundedJson(request, maxBytes) {
  if (!request.body) throw new BookingRequestError(400, "INVALID_BODY");
  const reader = request.body.getReader();
  const chunks = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new BookingRequestError(413, "BODY_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const merged = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(merged)); }
  catch { throw new BookingRequestError(400, "INVALID_JSON"); }
}

export function createRateLimiter({ perKey = 5, global = 30, windowMs = 60_000 } = {}) {
  const clients = new Map(); let globalWindow = { startedAt: 0, count: 0 };
  function bucket(current, now) { return !current || now - current.startedAt >= windowMs ? { startedAt: now, count: 0 } : current; }
  return {
    consume(key, now = Date.now()) {
      globalWindow = bucket(globalWindow, now);
      const client = bucket(clients.get(key), now);
      if (globalWindow.count >= global || client.count >= perKey) {
        return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((Math.max(globalWindow.startedAt, client.startedAt) + windowMs - now) / 1000)) };
      }
      globalWindow.count += 1; client.count += 1; clients.set(key, client);
      if (clients.size > 2_000) for (const [storedKey, value] of clients) if (now - value.startedAt >= windowMs) clients.delete(storedKey);
      return { ok: true, retryAfterSeconds: 0 };
    },
  };
}
