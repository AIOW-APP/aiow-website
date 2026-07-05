import { Platform } from 'react-native';

/* AIOW-tokens, clean-glass v3 (DESIGN-DNA.md v2.1), OKLCH omgerekend naar sRGB
 * (oklch-mix dreef eerder richting violet; srgb is de wet, zie report §2):
 *   canvas  oklch(0.982 0.004 95)  -> #FAF9F6  papier van het dossier
 *   ink     oklch(0.22 0.015 260)  -> #171B22  de inkt van het oordeel
 *   accent  oklch(0.47 0.10 220)   -> #006781  verdict-petrol (AA 6.1:1 op canvas)
 *   verdict oklch(0.17 0.02 250)   -> #091018  het ene donkere moment
 *   fout    oklch(0.51 0.19 25)    -> #BA1D27  UITSLUITEND destructief/fout (les A14)
 * Tekst-hierarchie via opacity-trappen van ink: 100 / 62 / 45% (les A4);
 * de 45%-trap alleen voor placeholders en decor (AA-bodem, les B6). */
export const theme = {
  bg: '#FAF9F6',
  panel: '#FFFFFF',
  ink: '#171B22',
  ink62: 'rgba(23,27,34,0.62)',
  ink45: 'rgba(23,27,34,0.45)',
  hair: 'rgba(23,27,34,0.12)',
  hair2: 'rgba(23,27,34,0.06)',
  accent: '#006781',
  accentDonker: '#005065',
  accentSoft: 'rgba(0,103,129,0.08)',
  verdictBg: '#091018',
  verdictInk: '#F2F6F7',
  verdictInk62: 'rgba(242,246,247,0.72)',
  verdictHair: 'rgba(242,246,247,0.16)',
  fout: '#BA1D27',
  foutSoft: 'rgba(186,29,39,0.06)',
  radius: 16,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
};
