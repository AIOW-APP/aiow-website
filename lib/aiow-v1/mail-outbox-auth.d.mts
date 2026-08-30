export type MailOutboxSignatureInput = { secret:string; method:"POST"; path:"/api/internal/mail-outbox/run"; timestamp:string; requestId:string; idempotencyKey:string; bodyBytes:Uint8Array };
export const MAIL_OUTBOX_PATH: "/api/internal/mail-outbox/run";
export function canonicalMailOutboxRequest(input:Omit<MailOutboxSignatureInput,"secret">): string;
export function signMailOutboxRequest(input:MailOutboxSignatureInput): string;
export function verifyMailOutboxSignature(input:MailOutboxSignatureInput & {signature:string;now?:number}): boolean;
export function verifyMailOutboxHttpRequest(input:{request:Request;bodyBytes:Uint8Array;secret:string|undefined;now?:number}): boolean;
