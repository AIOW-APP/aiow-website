export type MailAttachmentV2 = { filename:string; mimeType:"application/pdf"|"text/calendar"; base64:string; sha256:string };
export type MailJobV2 = { schemaKind:"mail_job"; jobId:string; commercialLeadId:string; kind:"customer_booking"|"internal_booking"|"customer_quote"|"internal_lead"; from:string; to:string[]; subject:string; text:string; html:string; attachments:MailAttachmentV2[]; payloadSha256:string; attempt:number; leaseOwner:string; leaseToken:string; leaseExpiresAt:string };
export type ProviderResultV2 = { schemaKind:string; category:"accepted"|"transient_pre_acceptance"|"permanent_pre_acceptance"|"ambiguous"; code:string|null; receipt:{provider:"microsoft_graph";httpStatus:number;graphRequestId:string|null;providerMessageId:null;acceptanceKind:"graph_http_202"|null;attemptReceipt:string;observedAt:string} };
export const AIOW_MAIL_SENDER: "info@aiow.io";
export function buildCustomerBookingTemplateV2(input:{locale:"nl"|"en";customerName:string;preference:string}): Readonly<{subject:string;text:string;html:string}>;
export function validateMailJobV2(value:unknown): value is MailJobV2;
export function buildMicrosoftGraphMessage(job:MailJobV2): Record<string,unknown>;
export function sendMicrosoftGraphJob(job:unknown, gate:unknown, options?:Record<string,unknown>): Promise<ProviderResultV2>;
