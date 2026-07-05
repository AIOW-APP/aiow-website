/* Bisnix-regel, doorgetrokken naar AIOW: elke TESTVERSIE heet zichtbaar
 * "AIOW TEST" met testversie-chip in beeld; productie heet AIOW. Nooit een
 * fork: een codebase, brand-switch via EXPO_PUBLIC_BRAND (het EAS-productie-
 * profiel zet 'aiow'; alles zonder expliciete productie-vlag is testbuild). */

const ruw = (process.env.EXPO_PUBLIC_BRAND ?? 'test').toLowerCase();

export const BRAND = {
  isTest: ruw !== 'aiow',
  naam: 'AIOW',
  chip: ruw !== 'aiow' ? 'TESTVERSIE' : '',
} as const;
