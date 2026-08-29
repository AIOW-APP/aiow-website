export const BOOKING_SUBJECTS: readonly string[];
export const BOOKING_SLOTS: readonly string[];
export type BookingData = { subject: string; details: string; date: string; slot: string; name: string; email: string; company: string; website: string; consentAccepted: true; consentVersion: "aiow-booking-v1" };
export type BookingValidation = { ok: true; data: BookingData } | { ok: false; errors: Record<string, string> };
export function validateBooking(input: unknown, options?: { now?: Date }): BookingValidation;
