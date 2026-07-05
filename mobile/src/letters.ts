/* Literata als merkdisplay (voorlopige keuze, DESIGN-DNA v2: Richard kan
 * overrulen; de sans-wordmark-kwestie staat open op het board). De variabele
 * font uit public/fonts is voor native geinstantieerd naar twee statische
 * snedes: Display (wght 520, opsz 36) voor chapter-statements en Bold
 * (wght 700, opsz 24) voor de wordmark. DM Mono voor cijfers en microlabels,
 * exact zoals de site.
 *
 * Content staat nooit achter het laden: tot de fonts er zijn rendert alles in
 * de systeem-serif/mono-fallback en wisselt daarna stil. expo-font ontbreekt
 * op web-verify; alles faalt stil naar de fallback. */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

let F: typeof import('expo-font') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  F = require('expo-font');
} catch {
  F = null;
}

export type Letters = { display: string; displayBold: string; mono: string };

const fallback: Letters = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  displayBold: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
};

const geladen: Letters = {
  display: 'Literata-Display',
  displayBold: 'Literata-Bold',
  mono: 'DM-Mono',
};

let klaarSingleton = false;

export function useLetters(): Letters {
  const [klaar, setKlaar] = useState(klaarSingleton);
  useEffect(() => {
    if (klaarSingleton || !F) return;
    let actief = true;
    F.loadAsync({
      'Literata-Display': require('../assets/fonts/Literata-Display.ttf'),
      'Literata-Bold': require('../assets/fonts/Literata-Bold.ttf'),
      'DM-Mono': require('../assets/fonts/DM-Mono-400-Latin.ttf'),
    })
      .then(() => {
        klaarSingleton = true;
        if (actief) setKlaar(true);
      })
      .catch(() => {});
    return () => {
      actief = false;
    };
  }, []);
  return klaar ? geladen : fallback;
}
