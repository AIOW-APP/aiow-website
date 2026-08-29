export class BookingRequestError extends Error { status: number; code: string; constructor(status: number, code: string); }
export function amsterdamDateISO(now?: Date, offsetDays?: number): string;
export function readBoundedJson(request: Request, maxBytes: number): Promise<unknown>;
export function createRateLimiter(options?: { perKey?: number; global?: number; windowMs?: number }): { consume(key: string, now?: number): { ok: boolean; retryAfterSeconds: number } };
